import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

import {
  isFullHiragana,
  isFullKatakana,
  isHiragana,
  isKatakana,
} from '@utils/jp';

import { getCachePath } from './get-cache-path';
import { IndexedWords } from './index-by-chars';
import { isSubSet } from './is-subset';
import { areAllCharsUsed } from './are-all-chars-used';
import { formatSize, formatTime } from './format';

/**
 * Interface for the data stored in the written file
 */
export interface PlayableWordsSavedState {
  hiragana: PlayableWordsSavedStateField;
  katakana: PlayableWordsSavedStateField;
}

export interface PlayableWordsSavedStateField {
  combination: string;
  done: number;
  total: number;
  wordsByChar: Record<string, string[]>;
}

/** Print the state and save the file each X ms */
const REPORT_EACH_MS = 60_000;
/**
 * Minimum number words that a combination of characters requires to be
 * considered valid for a game
 */
const MIN_WORDS = 4;
/**
 * If `true`, a combination of characters won't considered valid when not
 * all characters are required to form those words
 */
const NEED_ALL_CHARS_USED = true;

/**
 * Returns a maping between available chars -> list of possible words
 * It will also export the data incrementally in the cache folder
 */
export async function findPlayableWords(
  xmlCreationDate: string,
  chars: string,
  index: IndexedWords
): Promise<Record<string, string[]>> {
  console.log(
    ` - Finding playable words from ${
      Object.keys(index).length
    } unique words with ${chars.length} chars...`
  );

  const cachePath = getCachePath(xmlCreationDate, 'playable-words.json');
  let state: Partial<PlayableWordsSavedState> = {};

  if (existsSync(cachePath)) {
    const t0 = Date.now();
    const stringData = (await readFile(cachePath)).toString();
    state = JSON.parse(stringData);
    const loadTime = Date.now() - t0;
    console.log(
      `  - From cached state: (${formatSize(
        stringData.length
      )} read in ${formatTime(loadTime)})`
    );
    const { hiragana, katakana } = state;
    if (hiragana) {
      console.log(`     - hiragana: ${hiragana.done}/${hiragana.total}`);
    }
    if (katakana) {
      console.log(`     - katakana: ${katakana.done}/${katakana.total}`);
    }
  } else {
    console.log('     - no cache found');
  }

  // to optimize the process, divide the words by hiragana and katanaka
  // and do the same with the chars
  const hiragana = chars.split('').filter(isHiragana).join('');
  const katakana = chars.split('').filter(isKatakana).join('');
  const indexKeys = Object.keys(index);
  const hiraganaKeys = indexKeys.filter(isFullHiragana);
  const katakanaKeys = indexKeys.filter(isFullKatakana);
  const mixedKeys = indexKeys.filter(
    (key) => !isFullHiragana(key) && !isFullKatakana(key)
  );

  console.log(
    `   - keys: ${hiraganaKeys.length} hiragana / ${katakanaKeys.length} katakana / ${mixedKeys.length} mixed (ignored)`
  );

  console.log(`   - hiragana...`);
  await findWords(
    hiragana,
    hiraganaKeys,
    index,
    saveState.bind(undefined, cachePath, 'hiragana', state),
    state.hiragana
  );

  console.log(`   - katakana...`);
  await findWords(
    katakana,
    katakanaKeys,
    index,
    saveState.bind(undefined, cachePath, 'katakana', state),
    state.katakana
  );

  // once both are done (state should be populated and saved in the cache file)
  if (!state.hiragana || !state.katakana) {
    throw new Error(`state not properly populated`);
  }

  const hw = state.hiragana.wordsByChar;
  const kw = state.hiragana.wordsByChar;
  const keys = Object.keys(hw).concat(Object.keys(kw)).sort();

  return keys.reduce((res, key) => {
    res[key] = hw[key] || kw[key];
    return res;
  }, {} as Record<string, string[]>);
}

type SaveStateFn = (
  combination: string,
  done: number,
  total: number,
  wordsByChar: Readonly<Map<string, string[]>>
) => Promise<Record<'time' | 'size', number>>;

/**
 * Given the list of combinable chars (kana)
 * and the subset of keys to check in the indexed words,
 * find the playable words in it
 */
async function findWords(
  chars: string,
  indexKeys: string[],
  index: IndexedWords,
  save: SaveStateFn,
  initialState: PlayableWordsSavedStateField | undefined
): Promise<void> {
  const total = Math.pow(chars.length, 5);

  if (initialState && total !== initialState.total) {
    throw new Error(`Initial state doesn't match`);
  }

  const wordsByChars = new Map<string, string[]>(
    initialState ? Object.entries(initialState.wordsByChar) : undefined
  );

  const startTime = Date.now();
  const startIteration = initialState ? initialState.done : 0;
  let nextReport = startTime + REPORT_EACH_MS;
  let iterations = initialState ? initialState.done : 0;
  let fromInitialState = !!initialState?.combination;
  let c1i = initialState ? chars.indexOf(initialState.combination[0]) : 0;
  let c2i = initialState ? chars.indexOf(initialState.combination[1]) : 0;
  let c3i = initialState ? chars.indexOf(initialState.combination[2]) : 0;
  let c4i = initialState ? chars.indexOf(initialState.combination[3]) : 0;
  let c5i = initialState ? chars.indexOf(initialState.combination[4]) : 0;

  // we always want to have 5 chars to select from... do it using bruteforce
  for (c1i = fromInitialState ? c1i : 0; c1i < chars.length; c1i++) {
    const c1 = chars[c1i];
    for (c2i = fromInitialState ? c2i : 0; c2i < chars.length; c2i++) {
      const c2 = chars[c2i];
      for (c3i = fromInitialState ? c3i : 0; c3i < chars.length; c3i++) {
        const c3 = chars[c3i];
        for (c4i = fromInitialState ? c4i : 0; c4i < chars.length; c4i++) {
          const c4 = chars[c4i];
          for (c5i = fromInitialState ? c5i : 0; c5i < chars.length; c5i++) {
            fromInitialState = false;
            iterations++;
            const c5 = chars[c5i];
            // normalize the available chars and
            const combination = [c1, c2, c3, c4, c5].sort().join('');

            // log the progress
            const now = Date.now();
            if (now > nextReport) {
              nextReport = now + REPORT_EACH_MS;
              const progress = getProgress(
                startIteration,
                iterations,
                total,
                startTime
              );
              const { time, size } = await save(
                combination,
                iterations,
                total,
                wordsByChars
              );
              console.log(
                `       - [${c1}${c2}${c3}${c4}${c5}] (${progress}) (${formatSize(
                  size
                )} saved in ${formatTime(time)})`
              );
            }

            //  avoid checking twice the same
            if (wordsByChars.has(combination)) continue;

            // find the words
            const words: string[] = [];
            for (const keyChars of indexKeys) {
              if (isSubSet(keyChars, combination)) {
                words.push(...index[keyChars]);
              }
            }

            if (
              words.length < MIN_WORDS ||
              (NEED_ALL_CHARS_USED && !areAllCharsUsed(combination, words))
            ) {
              continue;
            }

            wordsByChars.set(combination, words);
          }
        }
      }
    }
  }

  await save('100%', iterations, total, wordsByChars);
}

async function saveState(
  cachePath: string,
  field: 'hiragana' | 'katakana',
  base: Partial<PlayableWordsSavedState>,
  combination: string,
  done: number,
  total: number,
  wordsByCharMap: Readonly<Map<string, string[]>>
): Promise<{ time: number; size: number }> {
  const t0 = Date.now();
  const wordsByChar: Record<string, string[]> = {};

  // save only the chars -> words[] where there are actually words
  for (const [chars, words] of wordsByCharMap.entries()) {
    if (words.length > 0) {
      wordsByChar[chars] = words;
    }
  }

  base[field] = {
    combination,
    done,
    total,
    wordsByChar,
  };

  // custom stringify to have smaller files but still legible
  const str =
    '{\n' +
    [
      base.hiragana ? `"hiragana":${stringifyStateField(base.hiragana)}` : '',
      base.katakana ? `"katakana":${stringifyStateField(base.katakana)}` : '',
    ]
      .filter(Boolean)
      .join(',\n') +
    '\n}\n';

  await writeFile(cachePath, str);

  return {
    time: Date.now() - t0,
    size: str.length,
  };
}

/**
 * Custom stringify function of hiragana|katakana fields of the SavedState
 * to have smaller and more legible files
 */
function stringifyStateField(
  data: PlayableWordsSavedState[keyof PlayableWordsSavedState]
): string {
  return [
    '{',
    `"combination":"${data.combination}",`,
    `"done":${data.done},`,
    `"total":${data.total},`,
    `"wordsByChar":{`,
    Object.entries(data.wordsByChar)
      .map(
        ([key, list]) =>
          ` "${key}":[${list.map((word) => `"${word}"`).join(',')}]`
      )
      .join(',\n'),
    `}`,
    '}',
  ].join('\n');
}

function getProgress(
  start: number,
  current: number,
  total: number,
  startTime: number
): string {
  const finished = current - start;
  const pctg = ((100 * current) / total).toFixed(2) + '%';
  if (!finished) return pctg;

  const remaining = total - current;
  const entriesPerMs = finished / (Date.now() - startTime);
  const ms = Math.ceil(remaining / entriesPerMs);

  return `${pctg} ~${formatTime(ms)}`;
}

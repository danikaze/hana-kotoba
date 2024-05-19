import { isMixedKana } from '@utils/jp';
import { charsUnion } from './chars-union';
import { formatNumber, formatPctg, formatTime } from './format';
import { getCombinedLevel } from './get-combined-level';
import { ReadingMetaData } from './get-reading-meta';
import {
  IndexedWords,
  indexByLengthAndChars,
} from './index-by-length-and-chars';
import { isSubSet } from './is-subset';
import { SuperSet } from './super-set';

export interface FindCombinableWordsOptions {
  /** List of words with their meta */
  meta: Readonly<Map<string, ReadingMetaData>>;
  /** Max characters to use for a word */
  maxChars: number;
  /** Min characters for a word to have */
  minChars: number;
  /** Interval between reports */
  reportInterval: number;
}

export interface CombinableWords {
  chars: string;
  words: string[];
  level: number;
}

export function findCombinableWords(
  options: FindCombinableWordsOptions
): Promise<CombinableWords[]> {
  const finder = new CombinableWordsFinder(options);
  return finder.run();
}

class CombinableWordsFinder {
  private options: FindCombinableWordsOptions;

  public constructor(options: FindCombinableWordsOptions) {
    this.options = options;
  }

  /**
   *
   */
  public async run(): Promise<CombinableWords[]> {
    // index the provided words by length and chars
    const { index } = indexByLengthAndChars(
      Array.from(this.options.meta.keys())
    );

    // get all the keys with max length
    const t0 = Date.now();
    const keys = this.combineKeys(index);
    const t1 = Date.now();
    console.log(
      `- Total keys: ${formatNumber(keys.length)} (${formatTime(t1 - t0)})\n`
    );

    // for each key, find words writtable with those characters
    const words = Array.from(this.options.meta.keys());
    const wordList = this.findWritableWords(keys, words);
    const t2 = Date.now();
    console.log(`- Words found in ${formatTime(t2 - t1)}`);

    // prepare the result with the proper format
    const res = this.wordListToCombinableWords(wordList);
    return res;
  }

  /**
   * Combine keys until nothing new gets added and return the ones with the
   * desired length
   */
  private combineKeys(index: IndexedWords): string[] {
    console.log('- Combining keys...');
    const startTime = Date.now();
    const { maxChars } = this.options;
    const sizes = Object.keys(index)
      .map((n) => Number(n))
      .filter((n) => n <= maxChars)
      .sort();
    const maxCharKeys = new SuperSet<string>();
    const combinableKeys = new SuperSet<string>();

    // get all keys with less than the maximum length, to be combined
    for (const size of sizes) {
      Object.keys(index[size]).forEach((key) => {
        if (key.length === maxChars) {
          maxCharKeys.add(key);
        } else {
          combinableKeys.add(key);
        }
      });
    }

    // combine them until there's no new addition
    let loop = 1;
    let keys: string[] = [];

    while (keys.length !== combinableKeys.size) {
      let nextReport = Date.now() + this.options.reportInterval;
      keys = combinableKeys.toArray();
      console.log(
        `  - Starting loop ${loop} from ${formatNumber(keys.length)} keys`
      );
      const loopStartTime = Date.now();

      for (let i = 0; i < keys.length; i++) {
        const keyA = keys[i];
        for (let j = 0; j < keys.length; j++) {
          if (Date.now() > nextReport) {
            const ellapsedTime = Date.now() - loopStartTime;
            const projectedTime = (keys.length / i) * ellapsedTime;
            const loopDelta = combinableKeys.size - keys.length;
            nextReport = Date.now() + this.options.reportInterval;
            console.log(
              `    - Loop ${formatNumber(loop)} delta: +${formatNumber(
                loopDelta
              )} keys / ${formatPctg(
                i / keys.length
              )} / Loop ellapsed: ${formatTime(
                ellapsedTime
              )} / Loop ETA: ${formatTime(projectedTime - ellapsedTime)}`
            );
          }

          const keyB = keys[j];
          const newKey = charsUnion(keyA, keyB);

          // avoid mixing hiragana and katakana
          if (isMixedKana(newKey)) {
            continue;
          }

          // keys are normalized to avoid duplicates
          const normalizedNewKey = newKey.split('').sort().join('');

          // if they already reached the maxChar, they are a solution
          // and can't grow (not combinable) anymore
          if (normalizedNewKey.length === maxChars) {
            maxCharKeys.add(normalizedNewKey);
          } else if (normalizedNewKey.length < maxChars) {
            combinableKeys.add(normalizedNewKey);
          }
        }
      }

      console.log(
        `    - Loop ${loop} finished in ${formatTime(
          Date.now() - loopStartTime
        )}: ${formatNumber(combinableKeys.size)} keys (+${formatNumber(
          combinableKeys.size - keys.length
        )})`
      );
      loop++;
    }

    // display result summary
    const originalMaxSizeKeys = Object.keys(index[maxChars]).length;
    const totalKeys = combinableKeys.size;
    console.log(
      `- Finished combining keys in ${formatTime(Date.now() - startTime)}`
    );
    console.log(
      `  - Original keys with length = ${maxChars}: ${formatNumber(
        originalMaxSizeKeys
      )}`
    );
    console.log(
      `  - ${formatNumber(
        maxCharKeys.size
      )} keys of length = ${maxChars} from a total of ${formatNumber(
        totalKeys
      )} (+${formatNumber(maxCharKeys.size - originalMaxSizeKeys)})`
    );

    return maxCharKeys.toArray();
  }

  /**
   * Given a list of keys and a list of words, return a map with the list of
   * words writables for each key
   */
  private findWritableWords(
    keys: string[],
    words: string[]
  ): Map<string, Set<string>> {
    console.log('- Checking for writable words...');
    console.log(`  - word pool size: ${formatNumber(words.length)}`);
    console.log(`  - keys pool size: ${formatNumber(keys.length)}`);

    const { minChars, reportInterval } = this.options;
    const wordList = new Map<string, Set<string>>();
    const startTime = Date.now();
    let nextReport = startTime + reportInterval;
    let totalWords = 0;
    let wordsFromLastReport = 0;
    let keyIndexFromLastReport = 0;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const wordSet = new Set<string>();
      wordList.set(key, wordSet);

      for (const word of words) {
        if (word.length >= minChars && isSubSet(word, key)) {
          wordSet.add(word);
        }
      }
      totalWords += wordSet.size;

      const now = Date.now();
      if (now > nextReport) {
        const totalEllapsed = now - startTime;
        const progress = i - keyIndexFromLastReport;
        const projectedTime = (keys.length / progress) * reportInterval;
        const wordsAdded = totalWords - wordsFromLastReport;

        console.log(
          `    - ${formatPctg(i / keys.length)} keys checked / ${formatNumber(
            totalWords
          )} words (+${formatNumber(wordsAdded)}) / ETA: ${formatTime(
            projectedTime
          )} (total ellapsed: ${formatTime(totalEllapsed)})`
        );

        nextReport = now + reportInterval;
        wordsFromLastReport = totalWords;
        keyIndexFromLastReport = i;
      }
    }

    // print some stats
    const wordSizeFreq = new Map<number, number>();
    for (const [, list] of wordList.entries()) {
      wordSizeFreq.set(list.size, (wordSizeFreq.get(list.size) || 0) + 1);
    }
    const wordSizeFreqSorted = Array.from(wordSizeFreq.entries()).sort(
      ([a], [b]) => a - b
    );
    console.log(`  - ${totalWords} found:`);
    console.log(
      wordSizeFreqSorted.reduce(
        (str, [size, n]) => `${str}    - ${size} words: ${n} lists\n`,
        ''
      )
    );

    return wordList;
  }

  /**
   * Transform the word list into the output type
   */
  private wordListToCombinableWords(
    solutions: Map<string, Set<string>>
  ): CombinableWords[] {
    return Array.from(solutions.entries()).reduce((res, entry) => {
      const [chars, wordsSet] = entry as [string, Set<string>];
      const words = Array.from(wordsSet);

      res.push({
        chars,
        words,
        level: getCombinedLevel(this.options.meta, words),
      });
      return res;
    }, [] as CombinableWords[]);
  }
}

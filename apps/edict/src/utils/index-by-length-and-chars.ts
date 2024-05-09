import { formatTime } from './format';

/**
 * length -> chars -> words[]
 */
export type IndexedWords = Record<number, Record<string, string[]>>;

export interface WordIndex {
  /** List of different chars used by every word */
  chars: string;
  /** The given words, indexed by length and chars */
  index: IndexedWords;
}

export function indexByLengthAndChars(words: string[]): WordIndex {
  console.log(`- Indexing ${words.length} words...`);
  const startTime = Date.now();

  const index: IndexedWords = {};
  const chars: string[] = [];
  const wordsPerSize: Map<number, number> = new Map();

  for (const word of words) {
    for (const char of word) {
      if (!chars.includes(char)) {
        chars.push(char);
      }
    }

    wordsPerSize.set(word.length, (wordsPerSize.get(word.length) || 0) + 1);
    indexWord(index, word);
  }

  chars.sort();

  const ellapsed = Date.now() - startTime;
  console.log(`  - ${words.length} indexed in ${formatTime(ellapsed)}`);
  const wordsPerSizeSorted = Array.from(wordsPerSize).sort(([a], [b]) => a - b);
  console.log(
    wordsPerSizeSorted.reduce(
      (str, [size, totalWords]) =>
        `${str}    - ${size} chars: ${totalWords} words\n`,
      ''
    )
  );

  return {
    index,
    chars: chars.join(''),
  };
}

function indexWord(index: IndexedWords, word: string): void {
  const chars = word.split('').sort().join('');

  let sizeList = index[chars.length];
  if (!sizeList) {
    sizeList = {};
    index[chars.length] = sizeList;
  }

  let wordList = sizeList[chars];
  if (!wordList) {
    wordList = [];
    sizeList[chars] = wordList;
  }

  if (!wordList.includes(word)) {
    wordList.push(word);
  }
}

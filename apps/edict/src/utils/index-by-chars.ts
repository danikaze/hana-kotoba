/**
 * chars -> words[]
 */
export type IndexedWords = Record<string, string[]>;

export interface WordIndex {
  /** List of different chars used by every word */
  chars: string;
  /** The given words, indexed by chars */
  index: IndexedWords;
}

export function indexByChars(words: string[]): WordIndex {
  console.log(' - Indexing words...');

  const index: IndexedWords = {};
  const chars: string[] = [];

  for (const word of words) {
    for (const char of word) {
      if (!chars.includes(char)) {
        chars.push(char);
      }
    }

    indexWord(index, word);
  }

  chars.sort();

  return {
    index,
    chars: chars.join(''),
  };
}

function indexWord(index: IndexedWords, word: string): void {
  const chars = word.split('').sort().join('');

  let wordList = index[chars];
  if (!wordList) {
    wordList = [];
    index[chars] = wordList;
  }

  if (!wordList.includes(word)) {
    wordList.push(word);
  }
}

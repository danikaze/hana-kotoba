import * as json from './data.json';

interface IndexedData {
  /** List of available kanas (hiragana/katakana) */
  kanas: string[];
  /**
   * Key1: Length of the word
   * Key2: Every kana in the word, but ordered
   * Value: List of words that can be written with that kanas
   */
  wordsByKana: Record<number, Record<string, string[]>>;
  /**
   * List of available kanas (ordered) by length
   * Basically `Object.keys(wordsByKana[length])` cached
   */
  kanasByLength: Record<number, string[]>;
  /**
   * List of available kanas (ordered) by length
   * Basically `Object.keys(wordsByKana[length])` cached
   */
  entriesByLength: Record<number, [string, string[]][]>;
}

export function getIndexedData(): IndexedData {
  return data;
}

const data = processData(json);

function processData(
  raw: Omit<IndexedData, 'kanasByLength' | 'entriesByLength'>
): IndexedData {
  return {
    kanas: raw.kanas,
    wordsByKana: raw.wordsByKana,
    kanasByLength: Object.entries(raw.wordsByKana).reduce(
      (res, [length, words]) => {
        res[Number(length)] = Object.keys(words);
        return res;
      },
      {} as Record<number, string[]>
    ),
    entriesByLength: Object.entries(raw.wordsByKana).reduce(
      (res, [length, words]) => {
        res[Number(length)] = Object.entries(words);
        return res;
      },
      {} as Record<number, [string, string[]][]>
    ),
  };
}

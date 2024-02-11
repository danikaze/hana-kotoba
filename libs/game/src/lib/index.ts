import { pick } from '@utils/pick';
import { Matrix2D } from '@utils/matrix-2d';
import { getIndexedData } from './indexed-data';
import { WordAligner } from './word-aligner';

const MAX_TRIES = 3;

export function getGameData() {
  let tryN = 0;
  let kanas: string;
  let words: string[];
  let matrix: Readonly<Matrix2D<string>> | undefined;

  do {
    tryN++;
    // randomly choose the 1st word to use, with 5 kanas
    kanas = pickRandomKanas(5);
    // find all the possible words
    words = findWords(kanas);
    // align them
    matrix = alignWords(words);
  } while (!matrix && tryN < MAX_TRIES);

  return matrix
    ? {
        kanas,
        words,
        matrix,
      }
    : undefined;
}

/**
 * Pick a random set of kanas of the specified length
 */
function pickRandomKanas(length: number): string {
  const data = getIndexedData();
  return pick(data.kanasByLength[length]);
}

/**
 * Find all the possible words that can be written with the given kanas
 */
function findWords(availableKanas: string): string[] {
  const { wordsByKana, entriesByLength } = getIndexedData();
  let length = availableKanas.length;
  const foundWords = wordsByKana[length][availableKanas];

  for (;;) {
    length--;
    const entries = entriesByLength[length];
    if (!entries) break;
    for (const [kanas, words] of entries) {
      if (!isSubSet(kanas, availableKanas)) continue;
      foundWords.push(...words);
    }
  }

  return foundWords;
}

/**
 * Check if the `part` is a subset of `all`
 * Note that for performance, `part` and `all` both are supposed ordered already
 *
 * i.e. `ABC` is a subset of `ABCDE`
 *      `BC`  is a subset of `ABCDE`
 *      `AA`  is NOT a subset of `ABCDE`
 */
function isSubSet(part: string, all: string): boolean {
  let index = -1;

  for (const char of part) {
    index = all.indexOf(char, index + 1);
    if (index === -1) return false;
  }

  return true;
}

/**
 * Given a list of words, try to position them as in a cross-word
 */
function alignWords(
  words: Readonly<string[]>
): Readonly<Matrix2D<string>> | undefined {
  const solver = new WordAligner({ maxTime: 2000, maxDepth: 10 });
  const result = solver.run({
    words,
    matrix: new Matrix2D<string>(0, 0),
  });

  console.log({ stopReason: result.stopReason, meta: result.meta });

  return pick(result.solutions)?.matrix;
}

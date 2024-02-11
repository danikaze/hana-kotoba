import { Matrix2D } from '@utils/matrix-2d';

export interface WordPosition {
  word: string;
  direction: 'v' | 'h';
  col: number;
  row: number;
}

export const EMPTY_CELL = '';

const DATA_SEPARATOR = ',';
const WORD_SEPARATOR = ';';
const DIRECTION_SEPARATOR = ':';

/**
 * Given a matrix with words, find them and serialize them into a string
 * so they can be shared
 */
export function serializeMatrixWords(
  matrix: Readonly<Matrix2D<string>>,
  encode?: boolean
): string {
  const words = findMatrixWords(matrix);
  return encode ? encodeWords(words) : serializeWords(words);
}

/**
 * Given a serialized matrix into words put in a string, parse de data and
 * get the list of words with their positioning
 */
export function deserializeMatrixWords(
  str: string,
  encoded?: boolean
): WordPosition[] {
  if (encoded) {
    return decodeWords(str);
  }

  const [h, v] = str.split(DIRECTION_SEPARATOR);
  return [
    ...h.split(WORD_SEPARATOR).map((item) => deserializeWord('h', item)),
    ...v.split(WORD_SEPARATOR).map((item) => deserializeWord('v', item)),
  ];
}

/**
 * Given a list of positioned words, construct the smallest matrix containing
 * them all
 */
export function matrixFromPositionedWords(
  words: WordPosition[]
): Matrix2D<string> {
  // get the size of the matrix
  let w = 0;
  let h = 0;
  for (const word of words) {
    const mw = word.col + (word.direction === 'v' ? 1 : word.word.length);
    const mh = word.row + (word.direction === 'h' ? 1 : word.word.length);
    w = Math.max(w, mw);
    h = Math.max(h, mh);
  }

  // compose the matrix
  const matrix = new Matrix2D<string>(w, h, '');
  for (const word of words) {
    const cells = Matrix2D.from([word.word.split('')]);
    if (word.direction === 'v') {
      cells.transpose();
    }
    matrix.compose(cells, word.col, word.row);
  }

  return matrix;
}

/**
 * Given a list of words data, serialize them into a plain string
 */
function serializeWords(words: readonly WordPosition[]): string {
  const h = words
    .filter((word) => word.direction === 'h')
    .map(serializeWord)
    .join(WORD_SEPARATOR);
  const v = words
    .filter((word) => word.direction === 'v')
    .map(serializeWord)
    .join(WORD_SEPARATOR);

  return `${h}:${v}`;
}

/**
 * Serialize one position word data into a string
 * Direction is lost because horizontal and vertical words are separated
 * so it's implicit from the upper context
 */
function serializeWord(data: Readonly<WordPosition>): string {
  return [data.col, data.row, data.word].join(DATA_SEPARATOR);
}

/**
 * Get the original data from a serialized word
 * `direction` is needed as it's not included in the word data but given by the
 * upper context
 */
function deserializeWord(
  direction: WordPosition['direction'],
  str: string
): WordPosition {
  const parts = str.split(DATA_SEPARATOR);
  return {
    direction,
    col: Number(parts[0]),
    row: Number(parts[1]),
    word: parts[2],
  };
}

function encodeWords(words: readonly WordPosition[]): string {
  return serializeWords(words);
}

function decodeWords(str: string): WordPosition[] {
  return deserializeMatrixWords(str);
}

/**
 * Given a matrix, find all the words and return them with the needed
 * information to reconstruct the matrix later (position and orientation)
 */
function findMatrixWords(matrix: Readonly<Matrix2D<string>>): WordPosition[] {
  const words: WordPosition[] = [];
  let word: string = '';
  let startCol: number = -1;
  let startRow: number = -1;

  function addWord(direction: WordPosition['direction']): void {
    // if it was only 1 letter, it was a vertical word crossed
    if (word.length > 1) {
      words.push({
        direction,
        word,
        col: startCol,
        row: startRow,
      });
    }

    word = '';
    startCol = -1;
    startRow = -1;
  }

  function checkCell(direction: WordPosition['direction']) {
    return (cell: string, col: number, row: number) => {
      // line jump
      if (
        (direction === 'h' && startRow !== -1 && startRow !== row) ||
        (direction === 'v' && startCol !== -1 && startCol !== col)
      ) {
        addWord(direction);
      }

      if (word) {
        if (word && cell === EMPTY_CELL) {
          // find the (possible) end of a word
          addWord(direction);
        } else {
          // continue with the next character of a word
          word += cell;
        }
        // find the (possible) start of a word
      } else if (cell !== EMPTY_CELL) {
        startCol = col;
        startRow = row;
        word = cell;
      }
    };
  }

  matrix.iterateHorizontally(checkCell('h'));
  addWord('h');
  matrix.iterateVertically(checkCell('v'));
  addWord('v');

  return words;
}

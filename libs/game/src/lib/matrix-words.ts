import { BitView } from 'bit-buffer';
import { Matrix2D } from '@utils/matrix-2d';

export interface WordPosition {
  word: string;
  direction: 'v' | 'h';
  col: number;
  row: number;
}

export const EMPTY_CELL = '';

interface BitReader {
  read: (nbits: number) => number;
  readWord: (direction: WordPosition['direction']) => WordPosition;
}

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
 * Given a list of words data, serialize them into a plain string:
 * format= `${HORIZONTAL_WORD_LIST}:${VERTICAL_WORD_LIST}`
 * WORD_LIST= `${col},${row},${word}` (join with `;`)
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

/**
 * Given a list of words data, serialize/obfuscate them into a plain string,
 * which is just the list of available characters + a semi-colon (;) and then
 * the encoded string in base32 of the bit-array with the following fields:
 * - [8b]: Number of total words (`W`)
 * - [8b]: Number of horizontal words (`H`)
 * - List of words (the first `H` are horizontal, the rest (`W-H`) are vertical):
 *   - [8b]: Column index
 *   - [8b]: Row index
 *   - [8b]: Length of the word
 *   - List of characters of the word (each character taking the number of bits
 *     required to cover the index of the available character
 *     (i.e. for 5 characters 3 bits are required))
 */
function encodeWords(words: readonly WordPosition[]): string {
  const chars = getUniqueChars(words);
  const bitsPerChar = bitsRequired(chars.length);

  // define the bits to write and their values
  const bits: [nBits: number, value: number][] = [];
  // 8 bits for the number of total words
  bits.push([8, words.length]);
  // 8 bits for the number of horizontal words
  bits.push([8, words.filter((word) => word.direction === 'h').length]);
  // list of words
  for (const { word, col, row } of words) {
    // column, row and length of the word (8 bits each)
    bits.push([8, col], [8, row], [8, word.length]);
    // list of characters
    for (const char of word) {
      bits.push([bitsPerChar, chars.indexOf(char)]);
    }
  }

  // write the bits into the buffer
  const totalBits = bits.reduce((total, [n]) => total + n, 0);
  const buffer = new BitView(new ArrayBuffer(Math.ceil(totalBits / 8)));
  let offset = 0;
  for (const [nbits, value] of bits) {
    buffer.setBits(offset, value, nbits);
    offset += nbits;
  }

  // read the buffer to create the output string
  const bufferBits = buffer.byteLength * 8;
  let str = `${chars.join('')}${DATA_SEPARATOR}`;
  for (let i = 0; i < bufferBits; i += 5) {
    const read = Math.min(5, bufferBits - i);
    const n = buffer.getBits(i, read);
    str += n.toString(32);
  }

  return str;
}

/**
 * Get the original data from an encoded string with `encodeWords`
 */
function decodeWords(str: string): WordPosition[] {
  const [chars, binary] = str.split(DATA_SEPARATOR);
  const buffer = bitReader(binary, chars);
  const nWords = buffer.read(8);
  const horizontalWords = buffer.read(8);
  const words: WordPosition[] = [];

  for (let i = 0; i < nWords; i++) {
    const word = buffer.readWord(i < horizontalWords ? 'h' : 'v');
    words.push(word);
  }

  return words;
}

/**
 * Utility to replace the huge code from `BitStream` with only
 * the required features
 */
function bitReader(binaryString: string, chars: string): BitReader {
  const bitsPerChar = bitsRequired(chars.length);
  const array = binaryString.split('').map((char) => parseInt(char, 32));

  // populate the array value to value, as it looks like it doesn't get the
  // correct value when assigning `array` directly
  const bufferBits = array.length * 5;
  const buffer = new BitView(new ArrayBuffer(Math.ceil(bufferBits / 8)));
  for (let i = 0; i < array.length; i++) {
    const write = Math.min(5, bufferBits - i);
    buffer.setBits(i * 5, array[i], write);
  }

  let offsetBits = 0;
  const read = (nbits: number): number => {
    const res = buffer.getBits(offsetBits, nbits);
    offsetBits += nbits;
    return res;
  };

  const readWord = (direction: WordPosition['direction']): WordPosition => {
    const col = read(8);
    const row = read(8);
    const length = read(8);
    let word = '';
    for (let i = 0; i < length; i++) {
      const index = read(bitsPerChar);
      word += chars[index];
    }

    return {
      col,
      row,
      word,
      direction,
    };
  };

  return {
    read,
    readWord,
  };
}

/**
 * Get the unique chars used by the given list of words
 */
function getUniqueChars(words: readonly WordPosition[]): string[] {
  return Array.from(new Set(words.flatMap((data) => data.word.split(''))));
}

/**
 * Get the number of bits required to represent the given unsigned number
 */
function bitsRequired(unsignedNumber: number): number {
  let n = 1;
  let max = 2;

  for (;;) {
    if (max >= unsignedNumber) return n;
    n++;
    max = max << 1;
  }
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

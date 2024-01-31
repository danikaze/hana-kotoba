export type BinaryMatrix = boolean[][];

const SIZE_SEPARATOR = 'x';
const DATA_SEPARATOR = ':';

/**
 * Encode a matrix of booleans into a string
 */
export function encodeBinaryMatrix(matrix: Readonly<BinaryMatrix>): string;
export function encodeBinaryMatrix<T>(
  matrix: Readonly<T[][]>,
  toBool: (value: T) => boolean
): string;
export function encodeBinaryMatrix<T>(
  matrix: Readonly<T[][]>,
  toBool?: (value: T) => boolean
): string {
  const height = matrix.length;
  const width = height ? matrix[0].length : 0;
  const size = `${width}${SIZE_SEPARATOR}${height}`;

  if (!height || !width) return size;

  const bits = binaryMatrixToString(width, height, matrix, toBool!);
  return `${size}${DATA_SEPARATOR}${bits}`;
}

/**
 * Decode a string into a matrix of booleans
 */
export function decodeBinaryMatrix(encoded: string): BinaryMatrix {
  const colon = encoded.indexOf(DATA_SEPARATOR);
  const [w, h] = encoded.substring(0, colon).split(SIZE_SEPARATOR);
  const width = Number(w);
  const height = Number(h);
  const bits = encoded.substring(colon + 1);
  return stringToBooleanMatrix(width, height, bits);
}

function stringToBooleanMatrix(
  width: number,
  height: number,
  bits: string
): BinaryMatrix {
  const res: BinaryMatrix = [];

  // empty case (no data can still have multiple -empty- rows)
  if (bits === '') {
    // height === 0
    if (!height) return res;
    // width === 0
    for (let j = 0; j < height; j++) {
      res.push([]);
    }
    return res;
  }

  if (bits.length % 2) {
    throw new Error(`Invalid encoding`);
  }

  let row: boolean[] = [];
  res.push(row);

  for (let c = 0; c < bits.length; c += 2) {
    const n = parseInt(bits.substring(c, c + 2), 16);
    let b = 1;
    while (b <= n) {
      row.push((n & b) !== 0);
      if (row.length === width) {
        row = [];
        res.push(row);
      }
      b = b === 127 ? 1 : b << 1;
    }
  }

  // fill the current row with `false` if needed
  while (row.length < width) {
    row.push(false);
  }

  // fill the remaining rows with `false[]` if needed
  while (res.length < height) {
    row = [];
    res.push(row);
    for (let i = 0; i < width; i++) {
      row.push(false);
    }
  }

  return res;
}

function binaryMatrixToString<T>(
  width: number,
  height: number,
  matrix: Readonly<T[][]>,
  toBool?: (value: T) => boolean
): string {
  let str: string = '';
  let bits = 1;
  let current = 0;

  for (let j = 0; j < height; j++) {
    const row = matrix[j];
    for (let i = 0; i < width; i++) {
      const value = toBool ? toBool(row[i]) : row[i];
      if (value) {
        current += bits;
      }

      if (bits === 128) {
        bits = 1;
        str += current.toString(16);
        current = 0;
      } else {
        bits = bits << 1;
      }
    }
  }

  if (bits > 1) {
    str += current < 17 ? `0${current.toString(16)}` : current.toString(16);
  }

  return str;
}

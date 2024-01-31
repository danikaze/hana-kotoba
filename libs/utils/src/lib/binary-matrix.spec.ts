import {
  BinaryMatrix,
  encodeBinaryMatrix,
  decodeBinaryMatrix,
} from './binary-matrix';

describe('binaryMatrix', () => {
  it('should encode/decode empty matrices', () => {
    expect(encodeBinaryMatrix([])).toBe('0x0');
    expect(encodeBinaryMatrix([[]])).toBe('0x1');
    expect(encodeBinaryMatrix([[], []])).toBe('0x2');
  });

  it('should encode/decode binary matrices of less than 8 bits', () => {
    const matrix: BinaryMatrix = [
      [true, false, true],
      [false, true, false],
    ];
    const encoded = encodeBinaryMatrix(matrix);
    expect(encoded).toBe('3x2:15');

    const decoded = decodeBinaryMatrix(encoded);
    expect(decoded).toEqual(matrix);
  });

  it('should encode/decode binary matrices of more than 8 bits', () => {
    const matrix: BinaryMatrix = [
      [true, false, true],
      [false, true, false],
      [true, true, true],
      [false, true, false],
    ];
    const encoded = encodeBinaryMatrix(matrix);
    expect(encoded).toBe('3x4:d505');

    const decoded = decodeBinaryMatrix(encoded);
    expect(decoded).toEqual(matrix);
  });

  it('should encode binary matrices with non booleans', () => {
    const matrix = [
      [1, 0, 1],
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];

    const encoded = encodeBinaryMatrix(matrix, (n) => n !== 0);
    expect(encoded).toBe('3x4:d505');
  });
});

import { Matrix2D } from '@utils/matrix-2d';
import {
  deserializeMatrixWords,
  matrixFromPositionedWords,
  serializeMatrixWords,
} from './matrix-words';

describe('matrixWords', () => {
  it('should serialize matrices to string', () => {
    const data = [
      '　じゅうとう'.split('').map((c) => (c === '　' ? '' : c)),
      '　ゅ　　う　'.split('').map((c) => (c === '　' ? '' : c)),
      'とう　　じ　'.split('').map((c) => (c === '　' ? '' : c)),
    ];
    const matrix = Matrix2D.from(data);
    const str = serializeMatrixWords(matrix);

    expect(str).toBe('1,0,じゅうとう;0,2,とう:1,0,じゅう;4,0,とうじ');
  });

  it('should deserialize strings into words data', () => {
    const str = '1,0,じゅうとう;0,2,とう:1,0,じゅう;4,0,とうじ';
    const data = [
      {
        word: 'じゅうとう',
        direction: 'h',
        col: 1,
        row: 0,
      },
      {
        word: 'とう',
        direction: 'h',
        col: 0,
        row: 2,
      },
      {
        word: 'じゅう',
        direction: 'v',
        col: 1,
        row: 0,
      },
      {
        word: 'とうじ',
        direction: 'v',
        col: 4,
        row: 0,
      },
    ];

    expect(deserializeMatrixWords(str)).toEqual(data);
  });

  it('should place the words into a matrix', () => {
    const data = [
      '　じゅうとう'.split('').map((c) => (c === '　' ? '' : c)),
      '　ゅ　　う　'.split('').map((c) => (c === '　' ? '' : c)),
      'とう　　じ　'.split('').map((c) => (c === '　' ? '' : c)),
    ];
    const matrix = Matrix2D.from(data);
    const serialized = serializeMatrixWords(matrix);
    const words = deserializeMatrixWords(serialized);
    const recreated = matrixFromPositionedWords(words);

    expect(recreated.toArray()).toEqual(data);
  });

  it('should not lost a word ending in the last cell (vertical)', () => {
    const data = [
      'じゅうと'.split('').map((c) => (c === '　' ? '' : c)),
      'ゅ　　う'.split('').map((c) => (c === '　' ? '' : c)),
      'う　　じ'.split('').map((c) => (c === '　' ? '' : c)),
    ];

    const matrix = Matrix2D.from(data);
    const serialized = serializeMatrixWords(matrix);
    const words = deserializeMatrixWords(serialized);
    const recreated = matrixFromPositionedWords(words);

    expect(recreated.toArray()).toEqual(data);
  });

  it('should not lost a word ending in the last cell (horizontal)', () => {
    const data = [
      'じゅう'.split('').map((c) => (c === '　' ? '' : c)),
      'じ　　'.split('').map((c) => (c === '　' ? '' : c)),
      'ゅ　　'.split('').map((c) => (c === '　' ? '' : c)),
      'う　　'.split('').map((c) => (c === '　' ? '' : c)),
      'とうじ'.split('').map((c) => (c === '　' ? '' : c)),
    ];

    const matrix = Matrix2D.from(data);
    const serialized = serializeMatrixWords(matrix);
    const words = deserializeMatrixWords(serialized);
    const recreated = matrixFromPositionedWords(words);

    expect(recreated.toArray()).toEqual(data);
  });
});

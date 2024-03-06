import { Matrix2D } from '@utils/matrix-2d';
import { findMatrixWords } from './find-matrix-words';

describe('findMatrixWords', () => {
  it('should return empty array if there are no words', () => {
    expect(findMatrixWords(new Matrix2D(0, 0))).toEqual([]);
    expect(findMatrixWords(new Matrix2D(5, 5, ''))).toEqual([]);
  });

  it('should return unique characters from a list of words', () => {
    const matrix = Matrix2D.from([
      '　じゅうとう'.split('').map((c) => (c === '　' ? '' : c)),
      '　ゅ　　う　'.split('').map((c) => (c === '　' ? '' : c)),
      'とう　　じ　'.split('').map((c) => (c === '　' ? '' : c)),
    ]);
    expect(findMatrixWords(matrix)).toEqual([
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
    ]);
  });
});

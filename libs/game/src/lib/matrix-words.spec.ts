import { Matrix2D } from '@utils/matrix-2d';
import {
  deserializeMatrixWords,
  matrixFromPositionedWords,
  serializeMatrixWords,
} from './matrix-words';
import { WordPosition, findMatrixWords } from './find-matrix-words';

testWith(false, '1,0,じゅうとう;0,2,とう:1,0,じゅう;4,0,とうじ');
testWith(true, 'じゅうと,4g0200k04n0g04gd00g1g410g1c10');

function testWith(encode: boolean, data1String: string) {
  describe(`matrixWords (${encode ? 'encode' : 'serialize'})`, () => {
    const data1: WordPosition[] = [
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

    it('should serialize matrices to string', () => {
      const str = serializeMatrixWords(data1, encode);
      expect(str).toBe(data1String);
    });

    it('should deserialize strings into words data', () => {
      expect(deserializeMatrixWords(data1String, encode)).toEqual(data1);
    });

    it('should place the words into a matrix', () => {
      const data = [
        '　じゅうとう'.split('').map((c) => (c === '　' ? '' : c)),
        '　ゅ　　う　'.split('').map((c) => (c === '　' ? '' : c)),
        'とう　　じ　'.split('').map((c) => (c === '　' ? '' : c)),
      ];
      const matrix = Matrix2D.from(data);
      const words = findMatrixWords(matrix);
      const serialized = serializeMatrixWords(words, encode);
      const recreatedWords = deserializeMatrixWords(serialized, encode);
      const recreatedMatrix = matrixFromPositionedWords(recreatedWords);

      expect(recreatedMatrix.toArray()).toEqual(data);
    });

    it('should not lost a word ending in the last cell (vertical)', () => {
      const data = [
        'じゅうと'.split('').map((c) => (c === '　' ? '' : c)),
        'ゅ　　う'.split('').map((c) => (c === '　' ? '' : c)),
        'う　　じ'.split('').map((c) => (c === '　' ? '' : c)),
      ];

      const matrix = Matrix2D.from(data);
      const words = findMatrixWords(matrix);
      const serialized = serializeMatrixWords(words, encode);
      const recreatedWords = deserializeMatrixWords(serialized, encode);
      const recreatedMatrix = matrixFromPositionedWords(recreatedWords);

      expect(recreatedMatrix.toArray()).toEqual(data);
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
      const words = findMatrixWords(matrix);
      const serialized = serializeMatrixWords(words, encode);
      const recreatedWords = deserializeMatrixWords(serialized, encode);
      const recreatedMatrix = matrixFromPositionedWords(recreatedWords);

      expect(recreatedMatrix.toArray()).toEqual(data);
    });
  });
}

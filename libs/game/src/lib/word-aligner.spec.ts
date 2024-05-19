import { Matrix2D } from '@utils/matrix-2d';
import { WordAligner } from './word-aligner';
import { findMatrixWords } from './find-matrix-words';

describe('WordAligner', () => {
  it('should find the solutions', () => {
    const solver = new WordAligner();
    const words = [
      'あい',
      'しい',
      'しと',
      'あしあと',
      'しあい',
      'とい',
      'とし',
      'いし',
    ];

    const result = solver.run({
      words,
      matrix: new Matrix2D<string>(0, 0),
    });

    expect(result.solutions.length).toBe(1);
  });

  it('should find the best sub-solutions', () => {
    const solver = new WordAligner();
    const words = ['くるま', 'あし', 'とし', 'しあい', 'あしあと'];

    const result = solver.run({
      words,
      matrix: new Matrix2D<string>(0, 0),
    });

    expect(result.solutions.length).toBe(0);
    expect(solver.partialSolutions.length).toBeGreaterThan(0);

    const onePartialSolution = {
      words: [],
      matrix: Matrix2D.from([
        ['あ', 'し', 'あ', 'と', '', ''],
        ['し', '', '', 'し', 'あ', 'い'],
      ]),
    };

    expect(
      solver.partialSolutions.some(
        (state) =>
          state.matrix.equals(onePartialSolution.matrix) &&
          state.words.join(',') === onePartialSolution.words.join(',')
      )
    );
  });

  it('should not concatenate words', () => {
    const solver = new WordAligner({ stopOnSolution: 100 });
    const words = [
      'おかあさん',
      'かん',
      'かお',
      'さか',
      'さんか',
      'あお',
      'あさ',
      'おか',
      'かんさ',
    ].sort();
    const result = solver.run({
      words,
      matrix: new Matrix2D<string>(0, 0),
    });
    for (const { matrix } of result.solutions) {
      const wordPositions = findMatrixWords(matrix);
      const matrixWords = wordPositions.map((item) => item.word).sort();
      expect(matrixWords).toEqual(words);
    }
  });

  it('should not lose words', () => {
    const solver = new WordAligner({ stopOnSolution: 100 });
    const words = ['ひび', 'かし', 'かしつ', 'しか', 'しつ', 'つか'];
    const result = solver.run({
      words,
      matrix: new Matrix2D<string>(0, 0),
    });
    for (const { matrix } of result.solutions) {
      const wordPositions = findMatrixWords(matrix);
      const matrixWords = wordPositions.map((item) => item.word).sort();
      expect(matrixWords).toEqual(words);
    }
  });
});

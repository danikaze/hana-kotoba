import { BacktrackSolver } from '@utils/backtrack';
import { Matrix2D } from '@utils/matrix-2d';

import { EMPTY_CELL } from './matrix-words';

interface State {
  /** List of words still to use */
  words: Readonly<string[]>;
  /** Position of each kana in a "board" */
  matrix: Matrix2D<string>;
}

export class WordAligner extends BacktrackSolver<State> {
  public expand(state: Readonly<State>): readonly State[] {
    return state.words.flatMap((word, index) => {
      const words = state.words
        .slice(0, index)
        .concat(state.words.slice(index + 1));
      return this.expandWord(state.matrix, word).flatMap((matrix) => ({
        words,
        matrix,
      }));
    });
  }

  public isValid(): boolean {
    return true;
  }

  public isSolution(state: Readonly<State>): boolean {
    return state.words.length === 0;
  }

  /**
   * Put ONE word in all the possible positions
   */
  private expandWord(
    matrix: Matrix2D<string>,
    word: string
  ): Matrix2D<string>[] {
    // for the initial state, just return the word horizontal and vertical
    if (matrix.height() === 0) {
      const horizontal = Matrix2D.from([word.split('')]);
      const vertical = horizontal.clone();
      vertical.transpose();
      return [horizontal, vertical];
    }

    const res: Matrix2D<string>[] = [];

    // for each char of the word
    for (let c = 0; c < word.length; c++) {
      const char = word[c];
      // find it in the existing matrix
      matrix.iterateHorizontally((cell: string, col: number, row: number) => {
        if (cell !== char) return;

        // try to add it horizontally
        const addedHorizontally = this.addHorizontally(
          matrix,
          word,
          col,
          row,
          c
        );
        if (addedHorizontally) {
          res.push(addedHorizontally);
        }

        // try to add it vertically
        const addedVertically = this.addVertically(matrix, word, col, row, c);
        if (addedVertically) {
          res.push(addedVertically);
        }
      });
    }

    return res;
  }

  /**
   * Try to add the given `word` to the existing `matrix` horizontally,
   * matching the nth char of the `word` (given by `charIndex`) with the
   * char in the `targetColumn`:`targetRow` of the `matrix`.
   *
   * If possible, return a new state matrix, if not, `undefined`
   *
   * i.e.
   * ```
   * [くるま] and word = 'まど' (charIndex = 0)
   *          targetColumn = 2
   *          targetRow = 0
   *
   * should result in a new state like:
   * [くるま]
   * [＿＿ど]
   * ```
   */
  private addHorizontally(
    matrix: Matrix2D<string>,
    word: string,
    targetColumn: number,
    targetRow: number,
    charIndex: number
  ): Matrix2D<string> | undefined {
    const width = matrix.width();
    const height = matrix.height();

    // first check if it's possible to add it or not by checking the adjacent chars
    for (
      let c = Math.max(0, targetColumn - charIndex - 1);
      c < Math.min(width, targetColumn - charIndex + word.length + 1);
      c++
    ) {
      // targetColumn should have the intersecting word
      if (c === targetColumn) continue;
      for (
        let r = Math.max(0, targetRow - 1);
        r < Math.min(height, targetRow + 2);
        r++
      ) {
        // every other space should be free for this word to be added horizontally
        if (matrix.get(c, r)) return;
      }
    }

    const res = matrix.clone();
    // then expand the matrix on the left side when needed
    const leftColumnsNeeded = Math.max(0, charIndex - targetColumn);
    for (let i = 0; i < leftColumnsNeeded; i++) {
      res.addColumn(0, EMPTY_CELL);
    }
    // then expand the matrix on the right side when needed
    const rightColumnsNeeded = word.length - charIndex - width + targetColumn;
    for (let i = 0; i < rightColumnsNeeded; i++) {
      res.addColumn(res.width(), EMPTY_CELL);
    }

    // and finally, compose it
    const wordMatrix = Matrix2D.from([word.split('')]);
    res.compose(
      wordMatrix,
      targetColumn - charIndex + leftColumnsNeeded,
      targetRow,
      EMPTY_CELL
    );

    return res;
  }

  /**
   * Try to add the given `word` to the existing `matrix` vertically,
   * matching the nth char of the `word` (given by `charIndex`) with the
   * char in the `targetColumn`:`targetRow` of the `matrix`.
   *
   * If possible, return a new state matrix, if not, `undefined`
   *
   * i.e.
   * ```
   * [あく] and word = 'まど' (charIndex = 0)
   * [＿る]     targetColumn = 1
   * [＿ま]     targetRow = 2
   *
   * should result in a new state like:
   * [あく＿]
   * [＿る＿]
   * [＿まど]
   * ```
   */
  private addVertically(
    matrix: Matrix2D<string>,
    word: string,
    targetColumn: number,
    targetRow: number,
    charIndex: number
  ): Matrix2D<string> | undefined {
    const width = matrix.width();
    const height = matrix.height();

    // first check if it's possible to add it or not by checking the adjacent chars
    for (
      let r = Math.max(0, targetRow - charIndex - 1);
      r < Math.min(height, targetRow - charIndex + word.length + 1);
      r++
    ) {
      // targetRow should have the intersecting word
      if (r === targetRow) continue;
      for (
        let c = Math.max(0, targetColumn - 1);
        c < Math.min(width, targetColumn + 2);
        c++
      ) {
        // every other space should be free for this word to be added horizontally
        if (matrix.get(c, r)) return;
      }
    }

    const res = matrix.clone();
    // then expand the matrix on the top side when needed
    const topRowsNeeded = Math.max(0, charIndex - targetRow);
    for (let i = 0; i < topRowsNeeded; i++) {
      res.addRow(0, EMPTY_CELL);
    }
    // then expand the matrix on the borrom side when needed
    const bottomRowsNeeded = word.length - charIndex - height + targetRow;
    for (let i = 0; i < bottomRowsNeeded; i++) {
      res.addRow(res.height(), EMPTY_CELL);
    }

    // and finally, compose it
    const wordMatrix = Matrix2D.from(word.split('').map((char) => [char]));
    res.compose(
      wordMatrix,
      targetColumn,
      targetRow - charIndex + topRowsNeeded,
      EMPTY_CELL
    );

    return res;
  }
}

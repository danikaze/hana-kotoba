import { BacktrackNode, BacktrackSolver } from '@utils/backtrack';
import { Matrix2D } from '@utils/matrix-2d';
import { EMPTY_CELL } from './matrix-words';

interface State {
  /** List of words still to use */
  words: Readonly<string[]>;
  /** Position of each kana in a "board" */
  matrix: Matrix2D<string>;
}

export class WordAligner extends BacktrackSolver<State> {
  // list of the best partial solutions found
  public partialSolutions: Readonly<State>[] = [];
  // start considering partial solutions from 4 words used
  private partialSolutionsDepth = 5;

  expand = (state: Readonly<State>): readonly State[] => {
    return state.words.flatMap((word, index) => {
      const words = state.words
        .slice(0, index)
        .concat(state.words.slice(index + 1));
      return this.expandWord(state.matrix, word).flatMap((matrix) => ({
        words,
        matrix,
      }));
    });
  };

  public isValid(): boolean {
    return true;
  }

  public isSolution(state: Readonly<State>, path: Readonly<State[]>): boolean {
    const areSolutionsFound = this.solutions.length > 0;
    // consider only unique solutions, as some solution can be
    // reached with different paths
    const isFullSolution =
      state.words.length === 0 && !this.isRepeatedSolution(state);

    /*
     * In lot of cases, there's no way to align every single word provided, but
     * it is possible to align a subset of them. `WordAligner` saves them to be
     * used (just the best ones) in case there's no full solution available
     */
    if (!isFullSolution && !areSolutionsFound) {
      const depth = path.length;
      // when a new partial solution is better (uses more words = deeper)
      // than the existing ones until now, clear all of the past ones
      if (depth > this.partialSolutionsDepth) {
        this.partialSolutions = [state];
        this.partialSolutionsDepth = depth;
      } else if (depth === this.partialSolutionsDepth) {
        this.partialSolutions.push(state);
      }
    } else if (this.partialSolutions.length > 0) {
      // on the other hand, once a solution is found, partial ones are not
      // needed anymore, so free that memory
      this.partialSolutions = [];
    }

    return isFullSolution;
  }

  chooseNextState = (states: readonly BacktrackNode<State>[]): number => {
    return Math.floor(Math.random() * states.length);
  };

  /**
   * Return `true` if the current state is already registered as a solution
   */
  private isRepeatedSolution(state: Readonly<State>): boolean {
    return this.solutions.some((solution) =>
      state.matrix.equals(solution.matrix)
    );
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
   * [あく] and word = 'まど' (charIndex = 0)
   * [＿る]     targetColumn = 1
   * [＿ま]     targetRow = 2
   * ```
   * should result in a new state like:
   * ```
   * [あく＿]
   * [＿る＿]
   * [＿まど]
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
    // [あく]     For the example, it will check "✖" and "〇" cells
    // [＿〇]〇    (but "〇" will be skipped for being outside the matrix or
    // [＿〇]〇     being the target column)
    //    〇 〇
    for (
      let c = Math.max(0, targetColumn - charIndex);
      c < Math.min(width, targetColumn - charIndex + word.length);
      c++
    ) {
      // targetColumn should have the intersecting word
      if (c === targetColumn) continue;
      for (
        let r = Math.max(0, targetRow - 1);
        r < Math.min(height, targetRow + 2); // +2 because we compare with < not <=
        r++
      ) {
        // every other space should be free for this word to be added horizontally
        if (matrix.get(c, r)) return;
      }
    }
    // before and after are checked separatelly because the cells in diagonal
    // are allowed to have other words
    // for まど it will check ✖まど✖
    const beforeCol = targetColumn - charIndex - 1;
    if (beforeCol >= 0 && matrix.get(beforeCol, targetRow)) return;
    const afterCol = targetColumn - charIndex + word.length;
    if (afterCol < width && matrix.get(afterCol, targetRow)) return;

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
   * [くるま] and word = 'まど' (charIndex = 0)
   *          targetColumn = 2
   *          targetRow = 0
   * ```
   * should result in a new state like:
   * ```
   * [くるま]
   * [＿＿ど]
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
    // [く〇〇]〇   For the example, it will check "✖" and "〇" cells
    //    ✖〇 〇   (but 〇 will be skipped for being outside the matrix or being
    //              the target column)
    for (
      let r = Math.max(0, targetRow - charIndex);
      r < Math.min(height, targetRow - charIndex + word.length);
      r++
    ) {
      // targetRow should have the intersecting word
      if (r === targetRow) continue;
      for (
        let c = Math.max(0, targetColumn - 1);
        c < Math.min(width, targetColumn + 2); // +2 because we compare with < not <=
        c++
      ) {
        // every other space should be free for this word to be added horizontally
        if (matrix.get(c, r)) return;
      }
    }
    // before and after are checked separatelly because the cells in diagonal
    // are allowed to have other words
    //                      ✖
    // for ま it will check ま
    //     ど               ど
    //                      ✖
    const beforeRow = targetRow - charIndex - 1;
    if (beforeRow >= 0 && matrix.get(targetColumn, beforeRow)) return;
    const afterRow = targetRow - charIndex + word.length;
    if (afterRow < height && matrix.get(targetColumn, afterRow)) return;

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

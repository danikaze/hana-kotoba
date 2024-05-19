import { Matrix2D } from '../matrix-2d';
import {
  BacktrackSolver,
  NO_STATE_AVAILABLE,
  BacktrackSolverStopReason,
  BacktrackNodeType,
} from '.';

type SudokuState = { board: Matrix2D<number | (typeof SudokuSolver)['EMPTY']> };

class SudokuSolver<
  State extends SudokuState = SudokuState
> extends BacktrackSolver<State> {
  public static readonly EMPTY = 0;
  public static readonly BLOCK_SIZE = 3; // 3x3 blocks
  public static readonly BLOCKS = 3; // 3 blocks of 3x3 = 9x9 matrix
  public static readonly SIZE = SudokuSolver.BLOCK_SIZE * SudokuSolver.BLOCKS;

  public expand = (state: Readonly<State>): readonly State[] => {
    const emptyCell = SudokuSolver.findFirstEmpty(state);
    if (!emptyCell) return [];

    const res: State[] = [];
    const { board } = state;
    const { col, row } = emptyCell;

    for (let n = 1; n <= SudokuSolver.SIZE; n++) {
      if (!SudokuSolver.isNumberAllowed(board, n, col, row)) {
        continue;
      }

      const newState = { board: board.clone() };
      newState.board.set(col, row, n);
      res.push(newState as State);
    }

    return res;
  };

  public checkNode(state: Readonly<SudokuState>): BacktrackNodeType {
    // It's a solution when there's no empty cells
    if (!SudokuSolver.findFirstEmpty(state)) {
      return BacktrackNodeType.SOLUTION_AND_BACK;
    }
    // Only valid states are expanded so, every state should be valid
    return BacktrackNodeType.NON_SOLUTION;
  }

  /**
   * Just iterate the cells until one is undefined
   */
  protected static findFirstEmpty(state: Readonly<SudokuState>):
    | undefined
    | {
        col: number;
        row: number;
      } {
    return (
      state.board.iterateHorizontally((cell, col, row) => {
        if (cell === SudokuSolver.EMPTY) {
          return { col, row };
        }
      }) || undefined
    );
  }

  protected static isNumberAllowed(
    board: Readonly<SudokuState>['board'],
    number: number,
    col: number,
    row: number
  ): boolean {
    return !(
      SudokuSolver.isNumberInBlock(board, number, col, row) ||
      SudokuSolver.isNumberInCol(board, number, col) ||
      SudokuSolver.isNumberInRow(board, number, row)
    );
  }

  private static isNumberInRow(
    board: Readonly<SudokuState>['board'],
    number: number,
    row: number
  ): boolean {
    return (
      board.iterateRow(row, (cell) => {
        if (cell === number) return true;
      }) || false
    );
  }

  private static isNumberInCol(
    board: Readonly<SudokuState>['board'],
    number: number,
    col: number
  ): boolean {
    return (
      board.iterateCol(col, (cell) => {
        if (cell === number) return true;
      }) || false
    );
  }

  private static isNumberInBlock(
    board: Readonly<SudokuState>['board'],
    number: number,
    col: number,
    row: number
  ): boolean {
    const c0 =
      Math.floor(col / SudokuSolver.BLOCK_SIZE) * SudokuSolver.BLOCK_SIZE;
    const c1 = c0 + SudokuSolver.BLOCK_SIZE;
    const r0 =
      Math.floor(row / SudokuSolver.BLOCK_SIZE) * SudokuSolver.BLOCK_SIZE;
    const r1 = r0 + SudokuSolver.BLOCK_SIZE;

    for (let row = r0; row < r1; row++) {
      for (let col = c0; col < c1; col++) {
        if (board.get(col, row) === number) return true;
      }
    }

    return false;
  }
}

type SudokuSolverOneState = SudokuState & { lastNs: Matrix2D<number> };

class SudokuSolverOne extends SudokuSolver<SudokuSolverOneState> {
  public expandOne = (state: Readonly<SudokuSolverOneState>) => {
    const emptyCell = SudokuSolverOne.findFirstEmpty(state);
    if (!emptyCell) return NO_STATE_AVAILABLE;

    const { board, lastNs } = state;
    const { col, row } = emptyCell;
    const lastN = lastNs.get(col, row);

    for (let n = lastN + 1; n <= SudokuSolver.SIZE; n++) {
      if (!SudokuSolver.isNumberAllowed(board, n, col, row)) {
        continue;
      }

      const newState: SudokuSolverOneState = {
        lastNs,
        board: board.clone(),
      };
      lastNs.set(col, row, n);
      newState.board.set(col, row, n);
      return newState;
    }

    lastNs.set(col, row, 0);
    return NO_STATE_AVAILABLE;
  };
}

describe('SudokuSolver', () => {
  it('should find unique solutions', () => {
    const solver = new SudokuSolver({ stopOnSolution: 100 });
    const board = Matrix2D.from([
      [0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 5],
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);

    const result = solver.run({ board });
    expect(result.solutions.length).toBe(100);
    expect(result.stopReason).toBe(BacktrackSolverStopReason.SOLUTION_FOUND);
    expect(result.meta.totalNodes).toBe(8829);
    expect(result.meta.visitedNodes).toBe(8758);
    expect(result.meta.openNodes).toBe(143);
    expect(result.meta.maxOpenNodes).toBe(149);
    expect(result.meta.iterations).toBe(26100);
    expect(result.meta.depth).toBe(73);
    expect(result.totalMeta).toEqual(result.meta);
  });

  it('should expand one child at a time for a slower but more optimized memory usage', () => {
    // sadly it's still not able to found EVERY solution and it's even slower
    // than the "non-optimized" option.
    // Maybe expandOne is not needed after all...
    //
    // `SudokuSolver` could found 2,083,673 before giving a "out of memory" exception,
    //   totalNodes: 115,089,370,
    //   visitedNodes: 115,089,311,
    //   openNodes: 122,
    //   maxOpenNodes: 150,
    //   iterations: 343,184,195,
    //   depth: 73,
    //
    // `SudokuSolverOne` was able to find 2,076,480 of them
    //  totalNodes: 114,733,216,
    //  visitedNodes: 114,733,216,
    //  openNodes: 59,
    //  maxOpenNodes: 73,
    //  iterations: 456,856,263,
    //  depth: 73,
    const solver = new SudokuSolverOne({ stopOnSolution: 100 });
    const board = Matrix2D.from([
      [0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 5],
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);
    const lastNs = new Matrix2D(board.width(), board.height(), 0);

    const result = solver.run({ board, lastNs });
    expect(result.solutions.length).toBe(100);
    expect(result.stopReason).toBe(BacktrackSolverStopReason.SOLUTION_FOUND);
    expect(result.meta.totalNodes).toBe(8758);
    expect(result.meta.visitedNodes).toBe(8758);
    expect(result.meta.openNodes).toBe(72);
    expect(result.meta.maxOpenNodes).toBe(73);
    expect(result.meta.iterations).toBe(34784);
    expect(result.meta.depth).toBe(73);
  });
});

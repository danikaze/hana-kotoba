import {
  BacktrackNode,
  BacktrackSolver,
  BacktrackSolverMethods,
  BacktrackSolverOptions,
  BacktrackSolverStopReason,
  createBacktrackSolver,
} from './backtrack';

/**
 * Mediocre implementation to find combinations of numbers as an example of how
 * to use (and test) the `BacktrackSolver`
 */
class Combinations extends BacktrackSolver<number | undefined> {
  constructor(readonly pool: number[], options?: BacktrackSolverOptions) {
    super(options);
  }

  public expand(): Readonly<number[]> {
    return this.pool;
  }

  public isValid(state: number, path: Readonly<number[]>): boolean {
    // is valid if it contains no duplicates
    return new Set(path).size === path.length;
  }

  public isSolution(state: number, path: Readonly<number[]>): boolean {
    return path.length === this.pool.length + 1;
  }
}

function testWith(
  runnerName: string,
  run: BacktrackSolver<number | undefined>['run']
) {
  describe(`BacktrackSolver: ${runnerName}`, () => {
    it('should stop after the first solution by default', () => {
      const result = run(undefined);

      expect(result.meta.depth).toBe(3);
      expect(result.meta.totalNodes).toBe(10);
      expect(result.meta.visitedNodes).toBe(7);
      expect(result.meta.openNodes).toBe(5);
      expect(typeof result.meta.time).toBe('number');

      expect(result.stopReason).toBe(BacktrackSolverStopReason.SOLUTION_FOUND);

      expect(result.solutions).toEqual([3]);
      expect(result.solutionPaths).toEqual([[undefined, 1, 2, 3]]);
    });

    it('should find all solutions', () => {
      const result = run(undefined, { stopOnSolution: 0 });

      expect(result.meta.depth).toBe(3);
      expect(result.meta.totalNodes).toBe(31);
      expect(result.meta.visitedNodes).toBe(31);
      expect(result.meta.openNodes).toBe(0);
      expect(typeof result.meta.time).toBe('number');

      expect(result.stopReason).toBe(
        BacktrackSolverStopReason.ALL_NODES_VISITED
      );

      expect(result.solutions).toEqual([3, 2, 3, 1, 2, 1]);
      expect(result.solutionPaths).toEqual([
        [undefined, 1, 2, 3],
        [undefined, 1, 3, 2],
        [undefined, 2, 1, 3],
        [undefined, 2, 3, 1],
        [undefined, 3, 1, 2],
        [undefined, 3, 2, 1],
      ]);
    });

    it('should stop at certain level when specified', () => {
      const result = new Combinations([1, 2, 3], { maxDepth: 3 }).run(
        undefined
      );
      expect(result.stopReason).toBe(BacktrackSolverStopReason.SOLUTION_FOUND);
      expect(result.solutionPaths).toEqual([[undefined, 1, 2, 3]]);

      const limitedResult = new Combinations([1, 2, 3], { maxDepth: 2 }).run(
        undefined
      );
      expect(limitedResult.stopReason).toBe(
        BacktrackSolverStopReason.ALL_NODES_VISITED
      );
      expect(limitedResult.solutionPaths).toEqual([]);
    });
  });
}

const classRunner = (() => {
  const solver = new Combinations([1, 2, 3]);
  return solver.run.bind(solver);
})();
const functionSolver = (() => {
  const pool = [1, 2, 3];
  const methods: BacktrackSolverMethods<number | undefined> = {
    expand: () => {
      return pool;
    },
    isValid: (state, path): boolean => {
      // is valid if it contains no duplicates
      return new Set(path).size === path.length;
    },
    isSolution: (state, path): boolean => {
      return path.length === pool.length + 1;
    },
  };
  return createBacktrackSolver(methods);
})();

testWith('class', classRunner);
testWith('function', functionSolver);

describe('BacktrackSolver optional methods', () => {
  class CombinationsFromLast extends Combinations {
    public chooseNextState(
      states: readonly BacktrackNode<number | undefined>[]
    ): number {
      return states.length - 1;
    }
  }

  it('should allow chosing the next state', () => {
    const solver = new CombinationsFromLast([1, 2, 3], { stopOnSolution: 0 });
    const result = solver.run(undefined);

    expect(result.meta.depth).toBe(3);
    expect(result.meta.totalNodes).toBe(31);
    expect(result.meta.visitedNodes).toBe(31);
    expect(result.meta.openNodes).toBe(0);
    expect(typeof result.meta.time).toBe('number');

    expect(result.stopReason).toBe(BacktrackSolverStopReason.ALL_NODES_VISITED);

    expect(result.solutions).toEqual([1, 2, 1, 3, 2, 3]);
    expect(result.solutionPaths).toEqual([
      [undefined, 3, 2, 1],
      [undefined, 3, 1, 2],
      [undefined, 2, 3, 1],
      [undefined, 2, 1, 3],
      [undefined, 1, 3, 2],
      [undefined, 1, 2, 3],
    ]);
  });
});

import {
  BacktrackNodeType,
  BacktrackSolver,
  BacktrackSolverMethods,
  BacktrackSolverOptions,
  BacktrackSolverStopReason,
  createBacktrackSolver,
} from '.';

/**
 * Mediocre implementation to find combinations of numbers as an example of how
 * to use (and test) the `BacktrackSolver`
 */
export class Combinations extends BacktrackSolver<
  number | undefined,
  number[]
> {
  constructor(readonly pool: number[], options?: BacktrackSolverOptions) {
    super({ ...options });
  }

  public expand = (): Readonly<number[]> => {
    return this.pool;
  };

  public checkNode(
    state: number,
    path: Readonly<(undefined | number)[]>
  ): BacktrackNodeType {
    // is valid if it contains no duplicates
    if (new Set(path).size !== path.length) {
      return BacktrackNodeType.INVALID;
    }
    // it's a solution if it's reached its length
    if (path.length === this.pool.length + 1) {
      return BacktrackNodeType.SOLUTION_AND_BACK;
    }
    return BacktrackNodeType.NON_SOLUTION;
  }

  public stateToSolution = (
    state: Readonly<number | undefined>,
    path: readonly (number | undefined)[]
  ): Readonly<number[]> => {
    return path.slice(1) as number[];
  };
}

function testWith(
  runnerName: string,
  run: BacktrackSolver<number | undefined, number[]>['run']
) {
  describe(`BacktrackSolver: ${runnerName}`, () => {
    it('should stop after the first solution by default', () => {
      const result = run(undefined);

      expect(result.meta.depth).toBe(3);
      expect(result.meta.totalNodes).toBe(10);
      expect(result.meta.visitedNodes).toBe(7);
      expect(result.meta.openNodes).toBe(5);
      expect(result.meta.maxOpenNodes).toBe(8);
      expect(typeof result.meta.time).toBe('number');
      expect(result.totalMeta).toEqual(result.meta);

      expect(result.stopReason).toBe(BacktrackSolverStopReason.SOLUTION_FOUND);

      expect(result.solutions).toEqual([[1, 2, 3]]);
    });

    it('should find all solutions', () => {
      const result = run(undefined, { stopOnSolution: 0 });

      expect(result.meta.depth).toBe(3);
      expect(result.meta.totalNodes).toBe(31);
      expect(result.meta.visitedNodes).toBe(31);
      expect(result.meta.openNodes).toBe(0);
      expect(result.meta.maxOpenNodes).toBe(8);
      expect(typeof result.meta.time).toBe('number');

      expect(result.stopReason).toBe(
        BacktrackSolverStopReason.ALL_NODES_VISITED
      );

      expect(result.solutions).toEqual([
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
        [3, 1, 2],
        [3, 2, 1],
      ]);
    });

    it('should stop at certain level when specified', () => {
      const result = new Combinations([1, 2, 3], { maxDepth: 3 }).run(
        undefined
      );
      expect(result.stopReason).toBe(BacktrackSolverStopReason.SOLUTION_FOUND);
      expect(result.solutions).toEqual([[1, 2, 3]]);

      const limitedResult = new Combinations([1, 2, 3], { maxDepth: 2 }).run(
        undefined
      );
      expect(limitedResult.stopReason).toBe(
        BacktrackSolverStopReason.ALL_NODES_VISITED
      );
      expect(limitedResult.solutions).toEqual([]);
    });
  });
}

const classRunner = (() => {
  const solver = new Combinations([1, 2, 3]);
  return solver.run.bind(solver);
})();
const functionSolver = (() => {
  const pool = [1, 2, 3];
  const methods: BacktrackSolverMethods<number | undefined, number[]> = {
    expand: () => {
      return pool;
    },
    checkNode: (state, path): BacktrackNodeType => {
      // is valid if it contains no duplicates
      if (new Set(path).size !== path.length) {
        return BacktrackNodeType.INVALID;
      }
      // it's a solution if it's reached its length
      if (path.length === pool.length + 1) {
        return BacktrackNodeType.SOLUTION_AND_BACK;
      }
      return BacktrackNodeType.NON_SOLUTION;
    },
    stateToSolution: (
      state: Readonly<number | undefined>,
      path: readonly (number | undefined)[]
    ): Readonly<number[]> => {
      return path.slice(1) as number[];
    },
  };
  return createBacktrackSolver(methods);
})();

testWith('class', classRunner);
testWith('function', functionSolver);

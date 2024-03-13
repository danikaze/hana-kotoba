import {
  BacktrackNode,
  BacktrackSolverControlApi,
  BacktrackSolverOp,
  BacktrackSolverSnapshot,
  BacktrackSolverStopReason,
} from '.';
import { Combinations } from './basic.spec';

describe('BacktrackSolver optional methods', () => {
  class CombinationsFromLast extends Combinations {
    public chooseNextState = (
      states: readonly BacktrackNode<number | undefined>[]
    ): number => {
      return states.length - 1;
    };
  }

  it('should allow chosing the next state', () => {
    const solver = new CombinationsFromLast([1, 2, 3], { stopOnSolution: 0 });
    const result = solver.run(undefined);

    expect(result.meta.depth).toBe(3);
    expect(result.meta.totalNodes).toBe(31);
    expect(result.meta.visitedNodes).toBe(31);
    expect(result.meta.openNodes).toBe(0);
    expect(result.meta.maxOpenNodes).toBe(8);
    expect(typeof result.meta.time).toBe('number');

    expect(result.stopReason).toBe(BacktrackSolverStopReason.ALL_NODES_VISITED);

    expect(result.solutions).toEqual([
      [3, 2, 1],
      [3, 1, 2],
      [2, 3, 1],
      [2, 1, 3],
      [1, 3, 2],
      [1, 2, 3],
    ]);
  });
});

describe('onIterate callback', () => {
  const fn = jest.fn();

  class CombinationOnIteration extends Combinations {
    public onIteration = fn;
  }

  it('should call onIteration every iteration', () => {
    const solver = new CombinationOnIteration([1, 2, 3], { stopOnSolution: 0 });
    const result = solver.run(undefined);

    expect(fn).toHaveBeenCalledTimes(result.meta.iterations + 1);
  });
});

describe('pause/continue execution', () => {
  class CombinationWithPause extends Combinations {
    private pausesLeft;
    private pauseOnIteration: number = -1;

    public constructor(pauseOnIteration?: number) {
      super([1, 2, 3], { stopOnSolution: 0 });
      this.pausesLeft = pauseOnIteration === undefined ? 0 : 1;
      if (pauseOnIteration) {
        this.pauseOnIteration = pauseOnIteration;
      }
    }

    public onIteration = ({ stop }: BacktrackSolverControlApi) => {
      if (this.meta.iterations === this.pauseOnIteration && this.pausesLeft) {
        this.pausesLeft--;
        stop();
      }
    };
  }

  interface TestData {
    nInterations: number;
    opName: string;
    expectedSnap: BacktrackSolverSnapshot<number | undefined>['snap'];
  }

  function test({ nInterations, opName, expectedSnap }: TestData): void {
    it(`should work when the last iteration was ${opName}`, () => {
      const solver1 = new CombinationWithPause(nInterations);

      const result1 = solver1.run(undefined);
      expect(solver1.lastOp).toBe(expectedSnap.lastOp);
      expect(result1.meta.iterations).toBe(nInterations);
      expect(result1.stopReason).toBe(BacktrackSolverStopReason.MANUAL_STOP);

      const snap = solver1.getSnapshot();
      expect(snap.meta).not.toBe(result1.meta);
      expect(snap.snap).toEqual(expectedSnap);
      expect(snap.meta.totalNodes).toBe(result1.meta.totalNodes);
      expect(snap.meta.visitedNodes).toBe(result1.meta.visitedNodes);
      expect(snap.meta.openNodes).toBe(result1.meta.openNodes);
      expect(snap.meta.maxOpenNodes).toBe(result1.meta.maxOpenNodes);
      expect(snap.meta.iterations).toBe(result1.meta.iterations);
      expect(snap.meta.depth).toBe(result1.meta.depth);
      expect(snap.meta.time).toBeGreaterThanOrEqual(result1.meta.time);
      expect(snap.initialState).toBe(undefined);
      expect(snap.options).toEqual({ stopOnSolution: 0 });
      expect(snap.solutions).toEqual([
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
      ]);

      // same solver to continue where it was
      const result2 = solver1.continue();
      expect(result2.totalMeta.depth).toBe(3);
      expect(result2.totalMeta.totalNodes).toBe(31);
      expect(result2.totalMeta.visitedNodes).toBe(31);
      expect(result2.totalMeta.openNodes).toBe(0);
      expect(result2.totalMeta.maxOpenNodes).toBe(8);
      expect(result2.solutions).toEqual([
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
        [3, 1, 2],
        [3, 2, 1],
      ]);

      // new solver to continue where solver1 was
      const solver2 = new CombinationWithPause(0);
      const result3 = solver2.continue(snap);
      expect(result3.totalMeta.depth).toBe(result2.totalMeta.depth);
      expect(result3.totalMeta.totalNodes).toBe(result2.totalMeta.totalNodes);
      expect(result3.totalMeta.visitedNodes).toBe(
        result2.totalMeta.visitedNodes
      );
      expect(result3.totalMeta.openNodes).toBe(result2.totalMeta.openNodes);
      expect(result3.totalMeta.maxOpenNodes).toBe(
        result2.totalMeta.maxOpenNodes
      );
      // as the solutions are not in the snapshot, they are not included in the
      // result of the continuation
      expect(result3.solutions).toEqual([
        [3, 1, 2],
        [3, 2, 1],
      ]);
    });
  }

  test({
    opName: 'GO_BACK',
    nInterations: 47,
    expectedSnap: {
      openChildIndex: [],
      chosenChild: [2],
      lastOp: BacktrackSolverOp.GO_BACK,
    },
  });

  test({
    opName: 'GO_WIDE',
    nInterations: 48,
    expectedSnap: {
      openChildIndex: [0],
      chosenChild: [3],
      lastOp: BacktrackSolverOp.GO_WIDE,
    },
  });

  test({
    opName: 'GO_DEEP',
    nInterations: 49,
    expectedSnap: {
      openChildIndex: [0],
      chosenChild: [3, 0],
      lastOp: BacktrackSolverOp.GO_DEEP,
    },
  });
});

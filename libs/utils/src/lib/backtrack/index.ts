export enum BacktrackSolverStopReason {
  /** 1 or more solutions were found */
  SOLUTION_FOUND = 'FOUND',
  /** Every state was tried but no solution was found */
  SOLUTION_NOT_FOUND = 'NOT_FOUND',
  /** All nodes were checked */
  ALL_NODES_VISITED = 'ALL',
  /** Execution stopped after options.timeout ellapsed */
  MAX_TIME_EXCEDED = 'TIMEOUT',
  /** stop() method was called */
  MANUAL_STOP = 'STOP',
}

export enum BacktrackSolverOp {
  NONE = 'NIL',
  GO_DEEP = 'GD',
  GO_WIDE = 'GW',
  GO_BACK = 'GB',
}

export enum BacktrackNodeType {
  NON_SOLUTION = 'C',
  INVALID = 'B',
  SOLUTION_AND_BACK = 'SB',
  SOLUTION_AND_CONTINUE = 'SC',
}

export interface BacktrackSolverOptions {
  /**
   * By default it will stop after founding the first solution
   * Set this to `0` or `Infinity` to find them all, or an specific number
   */
  stopOnSolution?: number;
  /**
   * Set this to the number of milliseconds desired as maximum time to run, if
   * a budget is desired. It will stop analyzing nodes when the limit is reached
   */
  maxTime?: number;
  /**
   * Set this to the maximum depth of nodes if a limit is desired.
   * (The initial node counts as depth=0)
   *
   * Note that when specifiying this field, there will be no specific reason
   * saying the execution stopped because of this (as it would happen in the
   * case of reaching the `maxTime`), but instead it will return as if every
   * node was visited
   */
  maxDepth?: number;
}

export interface BacktrackSolverResult<ResultData> {
  /**
   * List of found solutions (final states)
   */
  solutions: ResultData[];
  /**
   * Metadata related to the last backtracking execution
   */
  meta: Readonly<Metadata>;
  /**
   * Metadata related to the global execution
   * (from this run and previous if it was continuing a snapshot)
   */
  totalMeta: Readonly<Metadata>;
  /**
   * Reason why the exeuction finished
   */
  stopReason: BacktrackSolverStopReason;
}

export interface BacktrackNode<State> {
  // initial state or chosen child
  state: State;
  // list of expanded children
  children?: BacktrackNode<State>[];
  // if `true`, the node is marked as "depleted" and must `goBack()`
  noNext?: boolean;
}

export interface BacktrackSolver<State, ResultData = State> {
  /**
   * Allows choosing the next state from the list of the current state's children
   * when going deep.
   * When not implemented, by default will keep iterating children in order (as a
   * method that always returns `0`)
   *
   * An example of use case for this method is when not every solution is wanted
   * but also some variation is required. It allows to not have the N first ones.
   */
  chooseNextState?: (states: Readonly<BacktrackNode<State>[]>) => number;
  expand?: (
    state: Readonly<State>,
    path: Readonly<State[]>
  ) => Readonly<State[]>;
  /**
   * When provided, it will take priority over `expand` and it's supposed to
   * expand only the next child to try instead of every of them at once.
   *
   * This is to optimize the memory usage on complex cases where states weights
   * a lot and probably not useful in most cases (apart from the `expandOne` logic
   * management being a bit more complex than the usual one)
   *
   * Note: To support `undefined` as a valid state, when there are no more states
   * availables to expand from the current one, return `NO_STATE_AVAILABLE`
   */
  expandOne?: (
    state: Readonly<State>,
    path: Readonly<State[]>
  ) => Readonly<State> | typeof NO_STATE_AVAILABLE;
  /**
   * When provided, it will be called before storing the solution data.
   * If not provided, the solution will be just the last state.
   */
  stateToSolution?: (
    state: Readonly<State>,
    path: Readonly<State[]>
  ) => Readonly<ResultData>;
  /**
   * When provided it will be called before each iteration step with some
   * utility methods to control the execution of the algorithm
   */
  onIteration?: (api: BacktrackSolverControlApi) => void;
  /**
   * When provided it will be called before closing a branch
   */
  onGoBack?: (state: Readonly<State>, path: Readonly<State[]>) => void;
}

export interface BacktrackSolverControlApi {
  /** Will set the run to stop on this iteration */
  stop: () => void;
  /**
   * Clear the solution list to free memory.
   * i.e. call it after storing the current solutions to a file or database
   */
  clearSolutions: () => void;
}

export type BacktrackSolverSnapshot<State, ResultData = State> = {
  initialState: Readonly<State>;
  options: Readonly<BacktrackSolverOptions>;
  snap: Readonly<{
    chosenChild: number[];
    openChildIndex: number[];
    lastOp: BacktrackSolverOp;
  }>;
  meta: Metadata;
  solutions: ResultData[];
};

export const NO_STATE_AVAILABLE = Symbol('Backtrack.NO_STATE_AVAILABLE');

interface Metadata {
  /** Total tree nodes */
  totalNodes: number;
  /**
   * Number of visited nodes
   * This can be less than the `totalNodes` when not every solution is required
   */
  visitedNodes: number;
  /**
   * Number of open nodes at any point
   * When backtracking, current branch nodes are freed
   */
  openNodes: number;
  /**
   * Highest number of open nodes at any point
   */
  maxOpenNodes: number;
  /**
   * Number of iterations required to find the solution, being an iteration a
   * basic operation like getting a level deeper, expanding the children of a
   * node or visiting a node itself to check for its validity or solution
   */
  iterations: number;
  /**
   * Maximum depth of the tree
   */
  depth: number;
  /**
   * Time ellapsed in ms taken by the run
   */
  time: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class BacktrackSolver<State, ResultData = State> {
  protected meta: Metadata = BacktrackSolver.baseMeta();
  protected totalMeta: Metadata = BacktrackSolver.baseMeta(true);

  protected readonly baseOptions: BacktrackSolverOptions;

  protected options: BacktrackSolverOptions;

  protected startTime: number = -1;

  public lastOp: BacktrackSolverOp = BacktrackSolverOp.NONE;

  /** Full active tree */
  protected root!: BacktrackNode<State>;
  /**
   * Path from the root to the current analyzed solution.
   */
  protected path: BacktrackNode<State>[] = [];
  /**
   * Path from the root to the current analyzed solution but only the states
   */
  protected statesPath: State[] = [];
  /**
   * Current child index used for each level
   * (will be 0 for all unless `chooseNextState` is used)
   */
  protected openChildIndex: number[] = [];
  /**
   * Current child index used for each level IF they were not removed to save
   * memory (to be able to recover a previous state)
   */
  protected chosenChild: number[] = [];
  /**
   * List of found solutions
   */
  protected solutions: ResultData[] = [];
  /**
   * When `true` it stops the execution and return the result
   */
  private stop: BacktrackSolverStopReason | undefined;

  constructor(options?: Readonly<BacktrackSolverOptions>) {
    this.baseOptions = {
      stopOnSolution: 1,
      ...options,
    };
    this.options = { ...this.baseOptions };
  }

  public run(
    initialState: Readonly<State>,
    options?: Readonly<BacktrackSolverOptions>
  ): BacktrackSolverResult<ResultData> {
    this.init('run', initialState, options);
    return this.start();
  }

  /**
   * Expand children to reach to the given state and start from there.
   *
   * It won't work if the defined `expand`/`expandOne`/`chooseNextState` are
   * not deterministic (i.e. when it depends on `random()` or similar)
   */
  public continue(
    snapshot?: Readonly<BacktrackSolverSnapshot<State, ResultData>>
  ): BacktrackSolverResult<ResultData> {
    this.init('continue', snapshot);
    if (snapshot) {
      this.recoverState(snapshot);
    }
    return this.start();
  }

  public getSnapshot(): Readonly<BacktrackSolverSnapshot<State, ResultData>> {
    this.meta.time = Date.now() - this.startTime;

    const snap: BacktrackSolverSnapshot<State, ResultData> = {
      initialState: this.root.state,
      options: this.options,
      snap: {
        openChildIndex: [...this.openChildIndex],
        chosenChild: [...this.chosenChild],
        lastOp: this.lastOp,
      },
      solutions: [...this.solutions],
      meta: BacktrackSolver.combineMeta(this.meta, this.totalMeta),
    };

    return snap;
  }

  /**
   * Decision maker for each node
   * - `NON_SOLUTION`: Will continue checking the node's children
   * - `INVALID`: Will close the node and backtrack
   * - `SOLUTION_AND_BACK`: Will add the node's state as a solution and backtrack
   * - `SOLUTION_AND_CONTINUE`: Will add the node's state as a solution and continue checking its children
   */
  public abstract checkNode(
    state: Readonly<State>,
    path: Readonly<State[]>
  ): BacktrackNodeType;

  /**
   * Object to be used to reset the metadata before each run
   */
  private static baseMeta(excludeInitialNode?: boolean): Metadata {
    return {
      totalNodes: excludeInitialNode ? 0 : 1, // initial state node
      visitedNodes: 0,
      openNodes: 0,
      maxOpenNodes: 0,
      iterations: 0,
      depth: 0,
      time: 0,
    };
  }

  private static combineMeta(runMeta: Metadata, totalMeta: Metadata): Metadata {
    return {
      totalNodes: totalMeta.totalNodes + runMeta.totalNodes,
      visitedNodes: totalMeta.visitedNodes + runMeta.visitedNodes,
      openNodes: totalMeta.openNodes + runMeta.openNodes,
      maxOpenNodes: Math.max(totalMeta.maxOpenNodes, runMeta.maxOpenNodes),
      iterations: totalMeta.iterations + runMeta.iterations,
      depth: Math.max(totalMeta.depth, runMeta.depth),
      time: totalMeta.time + runMeta.time,
    };
  }

  private init(
    type: 'run',
    initialState: Readonly<State>,
    options?: Readonly<BacktrackSolverOptions>
  ): void;
  private init(
    type: 'continue',
    snap?: BacktrackSolverSnapshot<State, ResultData>
  ): void;
  private init(
    type: 'run' | 'continue',
    initialStateOrSnap?:
      | Readonly<State>
      | BacktrackSolverSnapshot<State, ResultData>,
    options?: Readonly<BacktrackSolverOptions>
  ): void {
    if (type === 'run') {
      this.options = { ...this.baseOptions, ...options };
      this.meta = BacktrackSolver.baseMeta();
      this.totalMeta = BacktrackSolver.baseMeta(true);
      this.root = { state: initialStateOrSnap as Readonly<State> };
    } else if (initialStateOrSnap !== undefined) {
      const snap = initialStateOrSnap as BacktrackSolverSnapshot<
        State,
        ResultData
      >;
      this.totalMeta = { ...snap.meta };
      this.options = { ...snap.options };
      this.root = { state: snap.initialState };
    } else {
      this.meta = BacktrackSolver.baseMeta(true);
    }

    if (type === 'run' || initialStateOrSnap !== undefined) {
      this.path = [this.root];
      this.statesPath = [this.root.state];
      this.chosenChild = [];
      this.openChildIndex = [];
      this.solutions = [];
    }

    this.stop = undefined;
  }

  private recoverState(
    snapshot: BacktrackSolverSnapshot<State, ResultData>
  ): void {
    const { chosenChild, lastOp } = snapshot.snap;

    for (let depthLevel = 0; depthLevel < chosenChild.length; depthLevel++) {
      const visitedChildren = chosenChild[depthLevel];
      this.goDeep();

      for (let i = 0; i < visitedChildren - 1; i++) {
        // check which was the next child chosen
        this.goWide();
        // and remove it because it's already been closed
        this.goDeep();
        this.goBack();
      }

      if (
        depthLevel < chosenChild.length - 1 ||
        lastOp === BacktrackSolverOp.GO_WIDE
      ) {
        this.goWide();
      }
    }

    if (lastOp === BacktrackSolverOp.GO_BACK) {
      this.goBack();
    }

    this.meta = BacktrackSolver.baseMeta(true);
  }

  private start(): BacktrackSolverResult<ResultData> {
    const { maxTime } = this.options;
    this.startTime = Date.now();
    this.lastOp = BacktrackSolverOp.NONE;

    const api: BacktrackSolverControlApi = {
      stop: () => (this.stop = BacktrackSolverStopReason.MANUAL_STOP),
      clearSolutions: () => {
        this.solutions = [];
      },
    };

    // start checking (recursively)
    for (;;) {
      if (this.onIteration) {
        this.onIteration(api);
      }

      if (this.stop) break;

      this.meta.iterations++;
      this.nextStep();

      if (maxTime && Date.now() - this.startTime > maxTime) {
        this.stop = BacktrackSolverStopReason.MAX_TIME_EXCEDED;
      }
    }
    // end and return the result

    this.meta.time = Date.now() - this.startTime;
    this.totalMeta = BacktrackSolver.combineMeta(this.meta, this.totalMeta);

    const result: BacktrackSolverResult<ResultData> = {
      stopReason: this.stop,
      solutions: [...this.solutions],
      meta: this.meta,
      totalMeta: this.totalMeta,
    };

    return result;
  }

  private nextStep(): void {
    const current = this.path[this.path.length - 1];

    // the 1st time a node is visited is known because the children are not defined yet
    if (!current.children) {
      this.meta.visitedNodes++;

      const nodeType = this.checkNode(current.state, this.statesPath);
      // invalid nodes close the branch
      if (nodeType === BacktrackNodeType.INVALID) {
        this.goBack();
        return;
      }

      // solutions need to be added (only once, therefore here)
      if (
        nodeType === BacktrackNodeType.SOLUTION_AND_BACK ||
        nodeType === BacktrackNodeType.SOLUTION_AND_CONTINUE
      ) {
        const data = this.stateToSolution
          ? this.stateToSolution(current.state, this.statesPath)
          : (current.state as unknown as ResultData);
        this.addSolution(data);

        if (nodeType === BacktrackNodeType.SOLUTION_AND_BACK) {
          this.goBack();
          return;
        }
      }

      // go into the node expanding its children
      const { maxDepth } = this.options;
      if (!maxDepth || this.path.length <= maxDepth) {
        this.goDeep();
      } else {
        this.goBack();
      }
      return;
    }

    // at this point this is the 2nd+ time the current node is visited

    // if it has not more children to visit
    if (current.children.length === 0) {
      // if each children is being expanded one by one, try to get the next one
      if (!current.noNext && this.expandOne) {
        this.goDeep();
      } else {
        this.goBack();
      }
      return;
    }

    // if there are still nodes, check it in the next step
    this.goWide();
  }

  /**
   * Advance to the next level in the tree
   */
  private goDeep(): void | typeof NO_STATE_AVAILABLE {
    this.lastOp = BacktrackSolverOp.GO_DEEP;
    const depthLevel = this.path.length - 1;
    const current = this.path[depthLevel];
    let children: readonly State[];
    if (this.expandOne) {
      const state = this.expandOne(current.state, this.statesPath);
      children = state === NO_STATE_AVAILABLE ? [] : [state];
    } else if (this.expand) {
      children = this.expand(current.state, this.statesPath);
    } else {
      throw new Error(
        `One of the following methods needs to be implemented: expandOne(), expand()`
      );
    }
    current.children = children.map((state) => ({ state }));
    if (current.children.length === 0) {
      current.noNext = true;
    }
    this.chosenChild.push(0);

    this.meta.totalNodes += current.children.length;
    this.meta.openNodes += current.children.length;
    this.meta.maxOpenNodes = Math.max(
      this.meta.maxOpenNodes,
      this.meta.openNodes
    );
    this.meta.depth = Math.max(this.meta.depth, this.path.length);
  }

  /**
   * Advance to the next child of the same level in the tree
   */
  private goWide(): void {
    this.lastOp = BacktrackSolverOp.GO_WIDE;
    const depthLevel = this.path.length - 1;
    const current = this.path[depthLevel];
    this.chosenChild[depthLevel]++;
    const index = this.chooseNextState
      ? this.chooseNextState(current.children!)
      : 0;
    this.openChildIndex.push(index);
    this.path.push(current.children![index]);
    this.statesPath.push(current.children![index].state);
  }

  /**
   * Backtrack to the previous level closing the current branch
   */
  private goBack(): void {
    this.lastOp = BacktrackSolverOp.GO_BACK;
    const removedState = this.path.pop()!;
    if (this.onGoBack) {
      this.onGoBack(removedState.state, this.statesPath);
    }
    this.statesPath.pop();
    if (removedState!.children) {
      this.chosenChild.pop();
    }
    if (this.path.length === 0) {
      this.stop = BacktrackSolverStopReason.ALL_NODES_VISITED;
      return;
    }
    const current = this.path[this.path.length - 1];
    if (!current.children) return;
    const index = this.openChildIndex.pop()!;
    this.meta.openNodes -= 1 + (current.children[index].children?.length || 0);
    current.children.splice(index, 1);
  }

  /**
   * Mark the current state as one solution
   */
  protected addSolution(data: Readonly<ResultData>): void {
    this.solutions.push(data);

    if (this.options.stopOnSolution === this.solutions.length) {
      this.stop = BacktrackSolverStopReason.SOLUTION_FOUND;
    }
  }
}

export type BacktrackSolverMethods<S, R = S> = Pick<
  BacktrackSolver<S, R>,
  | 'expand'
  | 'checkNode'
  | 'chooseNextState'
  | 'expandOne'
  | 'onIteration'
  | 'stateToSolution'
>;

/**
 * Utility function to create a simple solver just by providing the required
 * methods without needed to implement a full class
 */
export function createBacktrackSolver<S, R>(
  methods: BacktrackSolverMethods<S, R>,
  baseOptions?: Readonly<BacktrackSolverOptions>
) {
  const solver = new BacktrackSolverWrapper(methods, baseOptions);
  return solver.run.bind(solver);
}

/**
 * Small utility useful to debug to get a visual representation of the enum
 * used for describing the stopping reason of the algorythm
 */
export function getStopReasonName(
  stopReason: BacktrackSolverStopReason
): string {
  if (stopReason === BacktrackSolverStopReason.ALL_NODES_VISITED) {
    return 'ALL_NODES_VISITED';
  }
  if (stopReason === BacktrackSolverStopReason.MAX_TIME_EXCEDED) {
    return 'MAX_TIME_EXCEDED';
  }
  if (stopReason === BacktrackSolverStopReason.SOLUTION_FOUND) {
    return 'SOLUTION_FOUND';
  }
  if (stopReason === BacktrackSolverStopReason.SOLUTION_NOT_FOUND) {
    return 'SOLUTION_NOT_FOUND';
  }
  if (stopReason === BacktrackSolverStopReason.MANUAL_STOP) {
    return 'MANUAL_STOP';
  }
  throw new Error(`Unknown BacktrackSolverStopReason "${stopReason}"`);
}

/**
 * Small utility useful to debug to get a visual representation of the enum
 * used for describing the last operation taken by the algorythm
 */
export function getOpName(op: BacktrackSolverOp): string {
  if (op === BacktrackSolverOp.NONE) {
    return 'NONE';
  }
  if (op === BacktrackSolverOp.GO_DEEP) {
    return 'GO_DEEP';
  }
  if (op === BacktrackSolverOp.GO_WIDE) {
    return 'GO_WIDE';
  }
  if (op === BacktrackSolverOp.GO_BACK) {
    return 'GO_BACK';
  }

  throw new Error(`Unknown BacktrackSolverOp "${op}"`);
}
class BacktrackSolverWrapper<S, R = S> extends BacktrackSolver<S, R> {
  constructor(
    methods: BacktrackSolverMethods<S, R>,
    options?: Readonly<BacktrackSolverOptions>
  ) {
    super(options);

    this.checkNode = methods.checkNode.bind(this);

    if (methods.chooseNextState) {
      this.chooseNextState = methods.chooseNextState.bind(this);
    }
    if (methods.expandOne) {
      this.expandOne = methods.expandOne.bind(this);
    }
    if (methods.expand) {
      this.expand = methods.expand.bind(this);
    }
    if (methods.stateToSolution) {
      this.stateToSolution = methods.stateToSolution.bind(this);
    }
    if (methods.onIteration) {
      this.onIteration = methods.onIteration.bind(this);
    }
  }

  public checkNode = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: Readonly<S>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    path: readonly S[]
  ): BacktrackNodeType => {
    throw new Error('method checkNode not defined');
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isSolution(state: Readonly<S>, path: readonly S[]): boolean {
    throw new Error('method isSolution not defined');
  }
}

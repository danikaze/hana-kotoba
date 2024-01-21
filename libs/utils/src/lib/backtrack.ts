export enum BacktrackSolverStopReason {
  /** 1 or more solutions were found */
  SOLUTION_FOUND = 1,
  /** Every state was tried but no solution was found */
  SOLUTION_NOT_FOUND,
  /** All nodes were checked */
  ALL_NODES_VISITED,
  /** Execution stopped after options.timeout ellapsed */
  MAX_TIME_EXCEDED,
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

export interface BacktrackSolverResult<State> {
  /**
   * List of found solutions (with their complete paths)
   */
  solutionPaths: State[][];
  /**
   * List of found solutions (final states)
   */
  solutions: State[];
  /**
   * Metadata related to the backtracking execution
   */
  meta: Readonly<Metadata>;
  /**
   * Reason why the exeuction finished
   */
  stopReason: BacktrackSolverStopReason;
}

interface Node<State> {
  state: State;
  children?: Node<State>[];
}

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

export abstract class BacktrackSolver<State> {
  private meta: Metadata = BacktrackSolver.baseMeta();

  private readonly baseOptions: BacktrackSolverOptions;

  private options: BacktrackSolverOptions;

  private startTime: number = -1;

  /** Full active tree */
  private root!: Node<State>;
  /**
   * Path from the root to the current analyzed solution.
   */
  private path: Node<State>[] = [];
  /**
   * Path from the root to the current analyzed solution but only the states
   */
  private statesPath: State[] = [];
  /**
   * List of found solutions
   */
  private solutions: State[][] = [];
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
  ): BacktrackSolverResult<State> {
    this.options = { ...this.baseOptions, ...options };
    this.meta = BacktrackSolver.baseMeta();
    this.stop = undefined;
    this.startTime = Date.now();
    // initialize the tree with the initial state
    this.root = { state: initialState };
    this.path = [this.root];
    this.statesPath = [initialState];
    this.solutions = [];
    this.meta.totalNodes = 1;

    const { maxTime } = this.options;

    // start checking (recursively)
    do {
      this.meta.iterations++;
      this.nextStep();

      if (maxTime && Date.now() - this.startTime > maxTime) {
        this.stop = BacktrackSolverStopReason.MAX_TIME_EXCEDED;
      }
    } while (!this.stop);
    // end and return the result

    this.meta.time = Date.now() - this.startTime;
    return {
      stopReason: this.stop,
      solutionPaths: this.solutions,
      solutions: this.solutions.map((path) => path[path.length - 1]),
      meta: this.meta,
    };
  }

  public abstract expand(
    state: Readonly<State>,
    path: Readonly<State[]>
  ): Readonly<State[]>;

  public abstract isValid(
    state: Readonly<State>,
    path: Readonly<State[]>
  ): boolean;

  public abstract isSolution(
    state: Readonly<State>,
    path: Readonly<State[]>
  ): boolean;

  /**
   * Object to be used to reset the metadata before each run
   */
  private static baseMeta(): Metadata {
    return {
      totalNodes: 0,
      visitedNodes: 0,
      openNodes: 0,
      iterations: 0,
      depth: 0,
      time: 0,
    };
  }

  private nextStep(): void {
    const current = this.path[this.path.length - 1];

    // the 1st time a node is visited is known because the children are not defined yet
    if (!current.children) {
      this.meta.visitedNodes++;
      // invalid nodes close the branch
      if (!this.isValid(current.state, this.statesPath)) {
        this.goBack();
        return;
      }

      // solutions need to be added (only once, therefore here)
      // and also close the branch (every solution is supposed to be a leaf)
      if (this.isSolution(current.state, this.statesPath)) {
        this.addSolution();
        this.goBack();
        return;
      }

      // go into the node expanding its children
      const { maxDepth } = this.options;
      if (!maxDepth || this.path.length <= maxDepth) {
        this.goDepth();
      } else {
        this.goBack();
      }
      return;
    }

    // at this point this is the 2+nd time the current node is visited

    // if it has not more children to visit, just close the branch
    if (current.children.length === 0) {
      this.goBack();
      return;
    }

    // if there are still nodes, check it in the next step
    this.goWide();
  }

  /**
   * Advance to the next level in the tree
   */
  private goDepth(): void {
    const current = this.path[this.path.length - 1];
    const children = this.expand(current.state, this.statesPath);
    current.children = children.map((state) => ({ state }));

    this.meta.totalNodes += current.children.length;
    this.meta.openNodes += current.children.length;
    this.meta.depth = Math.max(this.meta.depth, this.path.length);
  }

  /**
   * Advance to the next child of the same level in the tree
   * (always the first one as closed branches are removed to free memory)
   */
  private goWide(): void {
    const current = this.path[this.path.length - 1];
    this.path.push(current.children![0]);
    this.statesPath.push(current.children![0].state);
  }

  /**
   * Backtrack to the previous level closing the current branch
   */
  private goBack(): void {
    this.path.pop();
    this.statesPath.pop();
    if (this.path.length === 0) {
      this.stop = BacktrackSolverStopReason.ALL_NODES_VISITED;
      return;
    }
    const current = this.path[this.path.length - 1];
    if (!current.children) return;
    this.meta.openNodes -= 1 + (current.children[0].children?.length || 0);
    current.children.shift();
  }

  /**
   * Mark the current state as one solution
   */
  private addSolution(): void {
    // a copy is needed because it will be modified on `goBack` and also to
    // continue searching for more solutions if asked for
    this.solutions.push([...this.statesPath]);
    if (this.options.stopOnSolution === this.solutions.length) {
      this.stop = BacktrackSolverStopReason.SOLUTION_FOUND;
    }
  }
}

export type BacktrackSolverMethods<T> = Pick<
  BacktrackSolver<T>,
  'expand' | 'isValid' | 'isSolution'
>;

/** */
export function createBacktrackSolver<T>(
  methods: BacktrackSolverMethods<T>,
  baseOptions?: Readonly<BacktrackSolverOptions>
) {
  const solver = new BacktrackSolverWrapper(methods, baseOptions);
  return solver.run.bind(solver);
}

class BacktrackSolverWrapper<T> extends BacktrackSolver<T> {
  constructor(
    methods: BacktrackSolverMethods<T>,
    options?: Readonly<BacktrackSolverOptions>
  ) {
    super(options);
    this.expand = methods.expand.bind(this);
    this.isValid = methods.isValid.bind(this);
    this.isSolution = methods.isSolution.bind(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public expand(state: Readonly<T>, path: readonly T[]): readonly T[] {
    throw new Error('method expand not defined');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isValid(state: Readonly<T>, path: readonly T[]): boolean {
    throw new Error('method isValid not defined');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isSolution(state: Readonly<T>, path: readonly T[]): boolean {
    throw new Error('method isSolution not defined');
  }
}

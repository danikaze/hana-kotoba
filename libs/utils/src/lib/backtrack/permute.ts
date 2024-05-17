import { BacktrackNodeType, BacktrackSolver, BacktrackSolverOptions } from '.';

export interface PermuterOptions<T> {
  /** List of items to permute */
  pool: T[];
  /** Min length of the desired results */
  minLength?: number;
  /** Max length */
  maxLength?: number;
  /** If `true`, the same element can appear more than once in a result */
  withRepetitions?: boolean;
  /** If `true`, AB will be considered the same result as BA and appear only once (like a `Set`) */
  orderInsensitive?: boolean;
  /** Used to compare elements to check for repetitions (identity by default) */
  isEqual?(a: T, b: T): boolean;
}

export function permute<T>(
  permuterOptions: PermuterOptions<T>,
  backtrackerOptions?: BacktrackSolverOptions
): Readonly<T[]>[] {
  const permuter = new Permuter(permuterOptions, {
    stopOnSolution: 0,
    ...backtrackerOptions,
  });
  const res = permuter.run(NIL);
  const solutions = res.solutions.filter((sol) => sol.length > 0);
  if (!permuterOptions.orderInsensitive) {
    return solutions;
  }
  return solutions.filter((solution, n) => {
    // only accept it if it hasn't appeared before
    const sorted = JSON.stringify([...solution].sort());
    for (let i = 0; i < n; i++) {
      if (JSON.stringify(solutions[i]) === sorted) return false;
    }
    return true;
  });
}

const NIL = Symbol('NIL');
type Nil = typeof NIL;

class Permuter<T> extends BacktrackSolver<T | Nil, T[]> {
  /** List of items to permute */
  private pool: T[];
  /** Min length of the desired results */
  private minLength?: number;
  /** Max length */
  private maxLength?: number;
  /** If `true`, the same element can appear more than once in a result */
  private withRepetitions?: boolean;
  /** Used to compare elements to check for repetitions (identity by default) */
  private isEqual: (a: T, b: T) => boolean;

  public constructor(
    permuterOptions: PermuterOptions<T>,
    backtrackerOptions?: BacktrackSolverOptions
  ) {
    if (!permuterOptions.maxLength && permuterOptions.withRepetitions) {
      throw new Error(
        `If repetitions is allowed, a maximum length must be defined`
      );
    }

    super(backtrackerOptions);
    this.pool = permuterOptions.pool;
    this.minLength = permuterOptions.minLength;
    this.maxLength = permuterOptions.maxLength;
    this.withRepetitions = permuterOptions.withRepetitions;
    this.isEqual = permuterOptions.isEqual ?? ((a: T, b: T) => a === b);
  }

  public expand = (
    state: Readonly<T | Nil>,
    path: readonly (T | Nil)[]
  ): Readonly<(T | Nil)[]> => {
    const { pool, withRepetitions } = this;
    if (withRepetitions) return [...pool];
    return pool.filter(
      (poolItem) =>
        !path.some((pathItem) => this.isEqual(poolItem, pathItem as T))
    );
  };

  public stateToSolution = (
    state: Readonly<T | Nil>,
    path: readonly (T | Nil)[]
  ): readonly T[] => {
    return path.slice(1) as T[];
  };

  public checkNode(
    state: Readonly<T | Nil>,
    path: readonly (T | Nil)[]
  ): BacktrackNodeType {
    const { minLength, maxLength } = this;
    // -1 because the 1st node is NIL
    const currentLength = path.length - 1;

    if (minLength !== undefined && currentLength < minLength) {
      return BacktrackNodeType.NON_SOLUTION;
    }

    if (maxLength !== undefined) {
      if (currentLength === maxLength) {
        return BacktrackNodeType.SOLUTION_AND_BACK;
      }
      if (currentLength > maxLength) {
        return BacktrackNodeType.INVALID;
      }
    }

    return BacktrackNodeType.SOLUTION_AND_CONTINUE;
  }
}

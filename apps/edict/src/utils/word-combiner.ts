import { getWordsNeededChars } from '@game/get-word-chars';
import {
  BacktrackSolver,
  BacktrackSolverControlApi,
  BacktrackSolverOptions,
  BacktrackSolverResult,
  BacktrackSolverSnapshot,
} from '@utils/backtrack';
import { PartialPick } from '@utils/types';

// word selected in each step
export type WordCombinerState = string;
// comma-separated list of words (sorted)
export type WordCombinerSolution = string;

interface WordCombinerOptions {
  solutionMinWords?: number;
  solutionMaxWords?: number;
  solutionMinChars?: number;
  solutionMaxChars?: number;
  reportEachMs?: number;
  onReport?: (
    snap: Readonly<
      BacktrackSolverSnapshot<WordCombinerState, WordCombinerSolution>
    >,
    ratio: number,
    deltaMs: number
  ) => void;
}

export class WordCombiner extends BacktrackSolver<
  WordCombinerState,
  WordCombinerSolution
> {
  private readonly combinerOptions: PartialPick<
    Required<WordCombinerOptions>,
    'onReport'
  >;
  private nextReport: number;
  private completedRatio: number = 0;
  /** List of available words */
  private readonly available: string[];

  public constructor(
    available: string[],
    combinerOptions?: WordCombinerOptions,
    backtrackOptions?: BacktrackSolverOptions
  ) {
    super({
      stopOnSolution: 0,
      ...backtrackOptions,
    });
    this.combinerOptions = {
      solutionMinWords: 4,
      solutionMaxWords: Infinity,
      solutionMinChars: 5,
      solutionMaxChars: 5,
      reportEachMs: 60_000,
      onReport: undefined,
      ...combinerOptions,
    };
    this.available = available;
    this.nextReport = Date.now() + this.combinerOptions.reportEachMs;
  }

  public run(
    initialState: Readonly<WordCombinerState>,
    options?: BacktrackSolverOptions
  ): BacktrackSolverResult<WordCombinerSolution> {
    return super.run(initialState, options);
  }

  onIteration = (api: BacktrackSolverControlApi): void => {
    const { reportEachMs } = this.combinerOptions;

    if (reportEachMs && Date.now() > this.nextReport) {
      this.nextReport = Date.now() + reportEachMs;
      if (this.combinerOptions.onReport) {
        const snap = this.getSnapshot();

        // calculate the % progress from the open levels
        const { chosenChild } = snap.snap;
        const [total, current] = chosenChild.reduce(
          ([total, current], childIndex, depth) => {
            const options = this.available.length - depth;
            const completed =
              (childIndex - 1) *
              nOverM(options - 1, options - chosenChild.length);
            return [total * options, current + completed];
          },
          [1, 0]
        );
        this.completedRatio = Math.max(this.completedRatio, current / total);

        this.combinerOptions.onReport(snap, this.completedRatio, reportEachMs);
      }
      api.clearSolutions();
    }
  };

  public expand = (
    state: Readonly<WordCombinerState>,
    path: Readonly<WordCombinerState[]>
  ): readonly WordCombinerState[] => {
    const children = this.available.reduce((res, word) => {
      if (path.includes(word)) return res;

      if (this.isExpandableState(path, word)) {
        res.push(word);
      }

      return res;
    }, [] as WordCombinerState[]);

    return children;
  };

  public onGoBack = (
    state: Readonly<WordCombinerState>,
    path: Readonly<WordCombinerState[]>
  ): void => {
    // check by solution number of words
    const wordList = path.slice(1).sort();
    if (
      wordList.length < this.combinerOptions.solutionMinWords ||
      wordList.length > this.combinerOptions.solutionMaxWords
    ) {
      return;
    }

    // check by solution number of chars
    const chars = getWordsNeededChars(wordList);
    if (
      chars.length < this.combinerOptions.solutionMinChars ||
      chars.length > this.combinerOptions.solutionMaxChars
    ) {
      return;
    }

    // check for duplicated solutions
    const solution = wordList.join(',');
    if (
      this.solutions.some((existingSolution) =>
        existingSolution.includes(solution)
      )
    ) {
      return;
    }

    // add the solution
    this.addSolution(solution);
  };

  public isValid(): boolean {
    return true;
  }

  public isSolution(): boolean {
    return false;
  }

  /**
   * Check the state to be included as an expanded child
   */
  private isExpandableState(
    path: Readonly<WordCombinerState[]>,
    word: string
  ): boolean {
    // check the maximum words
    if (path.length + 1 > this.combinerOptions.solutionMaxWords) {
      return false;
    }

    // check the max required characters
    // (not the minimum because it still could grow)
    const chars = getWordsNeededChars([word, ...path]);
    if (chars.length > this.combinerOptions.solutionMaxChars) {
      return false;
    }

    return true;
  }
}

/**
 * Returns (n! / m!) being n > m
 */
function nOverM(n: number, m: number): number {
  if (n <= m) return 1;

  let res = m + 1;
  for (let x = m + 2; x <= n; x++) {
    res *= x;
  }
  return res;
}

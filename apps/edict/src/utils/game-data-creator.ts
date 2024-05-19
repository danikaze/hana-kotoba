import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import { open } from 'fs/promises';
import { basename } from 'path';

import { WordPosition, findMatrixWords } from '@game/find-matrix-words';
import { getWordsNeededChars } from '@game/get-word-chars';
import { EMPTY_CELL, serializeMatrixWords } from '@game/matrix-words';
import { WordAligner } from '@game/word-aligner';
import { JmDict } from '@jmdict/types';
import { permute } from '@utils/backtrack/permute';
import { Matrix2D } from '@utils/matrix-2d';

import { filterReadings } from './filter-readings';
import { formatNumber, formatPctg, formatSize, formatTime } from './format';
import { getCombinedLevel } from './get-combined-level';
import { ReadingMetaData } from './get-reading-meta';
import { getUsableReadingsMeta } from './get-usable-readings-meta';
import { removeDuplicatedLinesInFile } from './remove-duplicated-lines-in-file';

export interface GameDataCreatorOptions {
  jmDict: Required<JmDict>;
  sourceFile: string;
  progressFile: string;
  solutionsFile: string;
  minLevel: number;
  maxLevel: number;
  gameMinWords: number;
  gameMaxWords: number;
  gamesPerCharsSet: number;
  reportInterval: number;
  /** Options to pass to the Backtracker word aligner */
  wordAligner: {
    stopOnSolution: number;
    maxTime: number;
  };
}

type GameCreationData = {
  words: readonly string[];
  nChars: number;
  meta: Readonly<Map<string, ReadingMetaData>>;
};

type BestUsableMatrixResult = {
  matrix: Matrix2D<string>;
  chars: string;
  wordPositions: WordPosition[];
};

interface GameData {
  // normalized (sorted) chars
  chars: string;
  serializedMatrix: string;
  encodedMatrix: string;
  level: number;
  words: readonly string[];
}

interface ProgressData {
  processedLines: number;
  processedBytes: number;
  lastLine?: string;
  ellapsedTime: number;
}

interface LineData {
  rawLine: string;
  level: number;
  words: string[];
  chars: string;
  bytes: number;
}

export class GameDataCreator {
  private readonly options: GameDataCreatorOptions;
  private readonly progress: ProgressData;

  constructor(options: GameDataCreatorOptions) {
    this.options = options;
    this.progress = this.loadProgress();
  }

  public async run(): Promise<void> {
    const {
      sourceFile,
      reportInterval,
      jmDict,
      minLevel,
      maxLevel,
      gameMinWords,
      gameMaxWords,
    } = this.options;

    if (!existsSync(sourceFile)) {
      throw new Error(`Source file is not found in ${sourceFile}`);
    }

    const readingsMeta = getUsableReadingsMeta(jmDict);
    const meta = filterReadings(readingsMeta, minLevel, maxLevel);
    const totalBytes = statSync(sourceFile).size;
    let lastReport = Date.now();
    let nextReport = lastReport + reportInterval;
    let nGamesFound = 0;
    let lastProgress = 0;
    let gamesToSave: GameData[] = [];

    const processLine = async (data: LineData) => {
      // for each set of characters and list of words, permute them to
      // get a list of accepted words length (i.e. from 10 words we can get
      // several games with 5 words, 6 words, etc.)
      // const permutedWords = this.permuteWords(data.chars, data.words);

      // for (const words of permutedWords) {
      //   const games = this.createGameData({
      //     words,
      //     meta,
      //   });

      //   gamesToSave.push(...games);
      //   this.progress.processedBytes += data.bytes;
      //   this.progress.processedLines++;
      //   this.progress.lastLine = data.rawLine;
      //   nGamesFound += games.length;
      // }
      if (
        data.words.length >= gameMinWords ||
        data.words.length <= gameMaxWords
      ) {
        const games = this.createGameData({
          meta,
          words: data.words,
          nChars: data.chars.length,
        });
        gamesToSave.push(...games);
        nGamesFound += games.length;
      }
      this.progress.processedBytes += data.bytes;
      this.progress.processedLines++;
      this.progress.lastLine = data.rawLine;

      const now = Date.now();
      if (now < nextReport) return;
      const ellapsed = now - lastReport;
      nextReport = now + reportInterval;

      await this.appendSolutions(gamesToSave);
      gamesToSave = [];

      this.progress.ellapsedTime += ellapsed;
      this.saveProgress();

      const progress = this.progress.processedBytes - lastProgress;
      const eta =
        ((totalBytes - this.progress.processedBytes) / progress) * ellapsed;
      console.log(
        `  - ${formatNumber(nGamesFound)} games found in ${formatNumber(
          this.progress.processedLines
        )} lines (${formatPctg(
          this.progress.processedBytes / totalBytes
        )}) ETA: ${formatTime(eta)}`
      );
      lastProgress = this.progress.processedBytes;
      lastReport = now;
    };

    console.log(
      `Finding games from ${basename(sourceFile)} (${formatSize(totalBytes)})`
    );

    await this.readLines(processLine);

    // save the last found games and progress
    await this.appendSolutions(gamesToSave);
    this.saveProgress();

    // at the end, remove duplicated lines, just in case
    removeDuplicatedLinesInFile(this.options.solutionsFile);

    console.log(`Finished`);
  }

  private static usableMatrixSorter(
    a: BestUsableMatrixResult,
    b: BestUsableMatrixResult
  ): number {
    // given that 2 matrices will have the same words
    // the one with less empty spaces is better
    return (
      GameDataCreator.getEmptySpaces(a.matrix) -
      GameDataCreator.getEmptySpaces(b.matrix)
    );
  }

  private static getEmptySpaces(matrix: Matrix2D<string>): number {
    let empty = 0;

    matrix.iterateHorizontally((cell) => {
      if (cell === EMPTY_CELL) empty++;
    });

    return empty;
  }

  private permuteWords(chars: string, words: string[]): (readonly string[])[] {
    const permutedWords = permute({
      pool: words,
      minLength: this.options.gameMinWords,
      maxLength: this.options.gameMaxWords,
      orderInsensitive: true,
      withRepetitions: false,
    });

    // discard the permutations not using all the chars
    return permutedWords.filter(
      (list) => getWordsNeededChars(list).length !== chars.length
    );
  }

  private loadProgress(): ProgressData {
    const { progressFile } = this.options;

    if (!existsSync(progressFile)) {
      return {
        processedBytes: 0,
        processedLines: 0,
        ellapsedTime: 0,
      };
    }

    const str = readFileSync(progressFile).toString();
    return JSON.parse(str);
  }

  private saveProgress(): void {
    const { progressFile } = this.options;
    const str = JSON.stringify(this.progress, null, 2);
    writeFileSync(progressFile, str);
  }

  private async appendSolutions(games: GameData[]): Promise<void> {
    const { solutionsFile } = this.options;
    const fd = await open(solutionsFile, 'a');

    for (const game of games) {
      const data = JSON.stringify(game) + '\n';
      await fd.write(data);
    }

    await fd.close();
  }

  private async readLines(
    cb: (line: LineData) => Promise<void>
  ): Promise<void> {
    const { sourceFile } = this.options;
    const { processedLines, lastLine } = this.progress;

    const fd = await open(sourceFile, 'r');

    if (processedLines > 0) {
      console.log(`  - Skipping ${formatNumber(processedLines)} lines`);
    }

    let linesSkipped = 0;
    for await (const line of fd.readLines()) {
      if (linesSkipped < processedLines) {
        linesSkipped++;
        if (linesSkipped === processedLines) {
          console.log(`    - Done skipping`);
          if (line !== lastLine) {
            throw new Error(`Progress doesn't match`);
          }
        } else if (linesSkipped % 50_000 === 0) {
          console.log(
            `    - Skipped ${formatNumber(linesSkipped)} lines (${formatPctg(
              linesSkipped / processedLines
            )})`
          );
        }
        continue;
      }

      const data = JSON.parse(line) as Pick<
        LineData,
        'chars' | 'level' | 'words'
      >;
      await cb({
        ...data,
        rawLine: line,
        bytes: line.length,
      });
    }

    fd.close();
  }

  private createGameData({
    words,
    meta,
    nChars,
  }: GameCreationData): GameData[] {
    const matrices = this.alignWords(words);
    return this.chooseBestUsableMatrices(matrices, nChars).reduce(
      (res, { chars, wordPositions }) => {
        const serializedMatrix = serializeMatrixWords(wordPositions, false);
        const encodedMatrix = serializeMatrixWords(wordPositions, true);
        const level = getCombinedLevel(meta, words);

        res.push({
          chars,
          serializedMatrix,
          encodedMatrix,
          level,
          words,
        });

        return res;
      },
      [] as GameData[]
    );
  }

  /**
   * Since the words list might be two (or more) different subsets of words that
   * might not be combinable (i.e. AB+BC / DE+EF), filter that kind of matrices
   * first as we don't want them
   *
   * Then, for the usable matrices, choose the best ones (the more compact ones
   * which are the ones with less empty cells)
   */
  private chooseBestUsableMatrices(
    matrices: Matrix2D<string>[],
    nChars: number
  ): BestUsableMatrixResult[] {
    const { gamesPerCharsSet } = this.options;

    const filtered = matrices
      .map((matrix) => {
        const wordPositions = findMatrixWords(matrix);
        const chars = getWordsNeededChars(wordPositions).sort().join('');
        return {
          matrix,
          chars,
          wordPositions,
        };
      })
      .filter(({ chars }) => nChars === chars.length)
      .sort(GameDataCreator.usableMatrixSorter);

    return filtered.length <= gamesPerCharsSet
      ? filtered
      : filtered.slice(0, gamesPerCharsSet);
  }

  /**
   * Given a list of words, position them as in a cross-word
   * Returns an array with every possibility to position them in a matrix
   * If no solution could be found, it will return an empty array
   */
  private alignWords(words: Readonly<string[]>): Matrix2D<string>[] {
    const solver = new WordAligner(this.options.wordAligner);
    const result = solver.run({
      words,
      matrix: new Matrix2D<string>(0, 0),
    });

    const solutions =
      result.solutions.length > 0 ? result.solutions : solver.partialSolutions;

    return solutions.map((state) => state.matrix);
  }
}

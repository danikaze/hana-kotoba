import { basename } from 'path';
import { open } from 'fs/promises';
import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  writeFileSync,
  writeSync,
} from 'fs';

import { getWordsNeededChars } from '@game/get-word-chars';
import { BacktrackSolverSnapshot } from '@utils/backtrack';

import { formatNumber, formatPctg, formatSize, formatTime } from './format';
import { getCachePath } from './get-cache-path';
import { ReadingMetaData } from './get-reading-meta';
import {
  WordCombiner,
  WordCombinerSolution,
  WordCombinerState,
} from './word-combiner';

interface PlayableWords {
  chars: string;
  words: string[];
  level: number;
}

/**
 * Given a list of words, find playable combinations
 */
export async function combinePlayableWords(
  xmlDate: string,
  meta: Map<string, ReadingMetaData>,
  minLevel: number,
  maxLevel = minLevel
): Promise<PlayableWords[]> {
  const words = Array.from(meta.values()).reduce((words, entry) => {
    if (entry.level >= minLevel && entry.level <= maxLevel) {
      words.push(entry.reading);
    }
    return words;
  }, [] as string[]);

  const progressFile = getCachePath(
    xmlDate,
    `combine-progress-${minLevel}-${maxLevel}.json`
  );
  const solutionsFile = getCachePath(
    xmlDate,
    `combine-solutions-${minLevel}-${maxLevel}`
  );

  const onReport = (
    snap: Readonly<BacktrackSolverSnapshot<WordCombinerState>>,
    ratio: number
  ): void => {
    // report the progress
    const { visitedNodes, time } = snap.meta;
    let eta = '';
    if (!startRatio) {
      startRatio = ratio;
    } else if (ratio < 1 && startTime) {
      const remainingMs = (Date.now() - startTime) / (ratio - startRatio);
      eta = ` ~${formatTime(remainingMs)}`;
    }
    console.log(
      `  - ${formatNumber(visitedNodes)} nodes visited in ${formatTime(
        time
      )} (${formatPctg(ratio)}${eta})`
    );

    // save a snapshot
    saveProgress(progressFile, snap);

    // save the found solutions, if any
    if (snap.solutions.length === 0) return;
    appendSolutions(solutionsFile, snap);
  };

  const savedProgress = loadProgress(progressFile);

  let startRatio: number | undefined;
  const startTime = Date.now();
  const solver = new WordCombiner(words, {
    onReport,
    // reportEachMs: 5000,
  });
  const result = savedProgress
    ? solver.continue(savedProgress)
    : solver.run('');

  // save the last progress again, just in case
  onReport(solver.getSnapshot(), 1);

  return (await getAllSolutions(solutionsFile, result.solutions)).map(
    (line) => {
      const words = line.split(',');
      return {
        words,
        chars: getWordsNeededChars(words).join(''),
        level: getCombinedLevel(meta, words),
      };
    }
  );
}

/**
 * Save the JSON for the snapshot of the progress of the BacktrackSolver,
 * so it can be continued through multiple executions
 */
function saveProgress(
  filepath: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { solutions, ...snapshot }: Readonly<BacktrackSolverSnapshot<string>>
): void {
  try {
    const t0 = Date.now();
    const snapStr = JSON.stringify(snapshot, null, 2);
    writeFileSync(filepath, snapStr);
    console.log(
      `    - Progress saved to ${basename(filepath)} (${formatSize(
        snapStr.length
      )} in ${formatTime(Date.now() - t0)})`
    );
  } catch (e) {
    console.error('Error while saving progress', e);
  }
}

/**
 * Load the file return the snapshot of a previous saved progress for the
 * BacktrackSolver, if it exists.
 */
function loadProgress(
  filename: string
): BacktrackSolverSnapshot<WordCombinerState> | undefined {
  if (!existsSync(filename)) return;

  const t0 = Date.now();
  const json = readFileSync(filename).toString();
  const progress = JSON.parse(json);
  console.log(
    `Progress read from ${basename(filename)} (${formatSize(
      json.length
    )} in ${formatTime(Date.now() - t0)})`
  );

  return progress;
}

/**
 * Append the found solutions to the file on the given path.
 * One solution per line, just appended instead of rewritting the whole
 * file (which will delay everything once it has certain size)
 *
 * It doesn't remove duplicates but it's faster doing that later
 */
function appendSolutions(
  filepath: string,
  snap: Readonly<BacktrackSolverSnapshot<string>>
): void {
  try {
    const t0 = Date.now();
    const solutionsStr = snap.solutions.map((list) => `${list}\n`).join('');
    const fd = openSync(filepath, 'a');
    writeSync(fd, solutionsStr);
    closeSync(fd);
    console.log(
      `    - ${snap.solutions.length} solutions added to ${basename(
        filepath
      )} (${formatSize(solutionsStr.length)} in ${formatTime(Date.now() - t0)})`
    );
  } catch (e) {
    console.error('Error while saving solutions', e);
  }
}

/**
 * Given the list of words and the pre-processed metadata object,
 * calculate the level of a game with the given words
 * In this case is the average but each level weights exponentially
 */
function getCombinedLevel(
  meta: Map<string, ReadingMetaData>,
  words: string[]
): number {
  const levels = words.map((word) => meta.get(word)!.level);
  return (
    levels.reduce((total, level) => total + level * level, 0) / levels.length
  );
}

/**
 * Combines the last found solutions with the ones that have been being
 * appended to the solutions file, and remove the repeated ones in this case
 *
 * It also gets rid of subsets;
 * (i.e. `A,B,C` would be removed on favor of `A,B,C,D`)
 */
async function getAllSolutions(
  filename: string,
  solutions: Readonly<WordCombinerSolution[]>
): Promise<Readonly<WordCombinerSolution[]>> {
  if (!existsSync(filename)) return solutions;

  // Use `Set` to get rid of the repeated solutions...
  const unique = new Set<WordCombinerSolution>(solutions);
  const fd = await open(filename, 'r');
  for await (const line of fd.readLines()) {
    unique.add(line);
  }

  // Remove solutions "included" on bigger ones
  const res = Array.from(unique);
  for (let i = res.length - 1; i >= 0; i--) {
    const solution = res[i];

    for (const superset of res) {
      if (solution === superset) continue;
      if (superset.includes(solution)) {
        res.splice(i, 1);
        break;
      }
    }
  }

  return res;
}

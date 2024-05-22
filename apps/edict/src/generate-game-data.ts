import { join } from 'path';

import { getCachePath } from './utils/get-cache-path';
import { loadJmDictXml } from './utils/load-jmdict-xml';
import { GameDataCreator } from './utils/game-data-creator';

/* Execution config */
const XML_PATH = join(__dirname, 'assets', 'JMdict_e');
const MIN_LEVEL = 1;
const MAX_LEVEL = 1;
const REPORT_EACH_MS = 60_000;
const GAME_MIN_WORDS = 4;
const GAME_MAX_WORDS = Infinity;
const MATRICES_PER_CHARS = 2;

const STOP_ON_SOLUTION = 10;
const MAX_RUNNING_TIME = 60_000;

/**
 * Using the output from `find-combinable-words.ts`, create game data usable to
 * seed the database
 *
 * - Read the progress file
 * Loop:
 *   - Wait until the source file is modified:
 *   - read the source file
 *   - remove duplicated and already processed words
 *   - generate game data for the remaining entries
 *   - caches found solutions in `game-data`
 *   - update the progress file on `game-data-progress`
 *
 * Note that every cached file is stored in `.cache/${xml.creationDate}` so its
 * consistent with the XML version, and it's not added to the git repo
 */
async function run() {
  const jmDict = await loadJmDictXml(XML_PATH);

  if (!jmDict.creationDate) {
    throw new Error(`Couldn't find the creation date in "${XML_PATH}`);
  }

  const progressFile = getCachePath(
    jmDict.creationDate,
    `game-data-progress-${MIN_LEVEL}-${MAX_LEVEL}.json`
  );
  const solutionsFile = getCachePath(
    jmDict.creationDate,
    `game-data-solutions-${MIN_LEVEL}-${MAX_LEVEL}`
  );
  const sourceFile = getCachePath(
    jmDict.creationDate,
    `find-combinable-words-solutions-${MIN_LEVEL}-${MAX_LEVEL}`
  );

  const gameCreator = new GameDataCreator({
    jmDict,
    progressFile,
    solutionsFile,
    sourceFile,
    minLevel: MIN_LEVEL,
    maxLevel: MAX_LEVEL,
    gameMinWords: GAME_MIN_WORDS,
    gameMaxWords: GAME_MAX_WORDS,
    gamesPerCharsSet: MATRICES_PER_CHARS,
    reportInterval: REPORT_EACH_MS,
    wordAligner: {
      stopOnSolution: STOP_ON_SOLUTION,
      maxTime: MAX_RUNNING_TIME,
    },
  });

  await gameCreator.run();
}

run();

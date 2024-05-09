import { closeSync, openSync, writeSync } from 'fs';
import { join } from 'path';

import { filterReadings } from './utils/filter-readings';
import {
  CombinableWords,
  findCombinableWords,
} from './utils/find-combinable-words';
import { getCachePath } from './utils/get-cache-path';
import { getUsableReadingsMeta } from './utils/get-usable-readings-meta';
import { loadJmDictXml } from './utils/load-jmdict-xml';

/* Execution config */
const XML_PATH = join(__dirname, 'assets', 'JMdict_e');
const MAX_CHARS = 5;
const MIN_CHARS = 2;
const MIN_LEVEL = 1;
const MAX_LEVEL = 1;

/**
 * This is split in several parts that generates cached files to save the
 * progress enabling continuing it in several runs and allowing to start
 * creating game data from the found combinable words at the same time:
 * - loadJmDictXml
 *   - parse the JmDict XML file into a JSON
 *   - cached in `jmdict.json`
 * - getReadingsMeta
 *   - get the readings from the JmDict and assign some meta data
 * - filterReadings
 *   - only "well used words" and with proper length, etc. (fast, no cache needed)
 * - add metadata (level, etc.) to the readings (fast)
 * - combinePlayableWords
 *   - check which words could be used together to create board games
 *   - caches found solutions in `combine-solutions-MIN_LEVEL-MAX_LEVEL`
 *   - caches the progress in `combine-progress-MIN_LEVEL-MAX_LEVEL`
 *
 * Note that every cached file is stored in `.cache/${xml.creationDate}` so its
 * consistent with the XML version, and it's not added to the git repo
 */
async function run() {
  const xml = await loadJmDictXml(XML_PATH);
  const readingsMeta = getUsableReadingsMeta(xml);
  const meta = filterReadings(readingsMeta, MIN_LEVEL, MAX_LEVEL);

  const solutionsFile = getCachePath(
    xml.creationDate,
    `find-combinable-words-solutions-${MIN_LEVEL}-${MAX_LEVEL}`
  );

  const res = await findCombinableWords({
    meta,
    maxChars: MAX_CHARS,
    minChars: MIN_CHARS,
    reportInterval: 60_000,
  });

  console.log(
    `Finished combining words from levels ${MIN_LEVEL} to ${MAX_LEVEL} (${res.length} found)`
  );

  writeSolutions(res, solutionsFile);
}

/**
 * Write a line per solution
 */
function writeSolutions(solutions: CombinableWords[], filepath: string): void {
  const fd = openSync(filepath, 'w');
  for (const solution of solutions) {
    const line = stringifyCombinableWords(solution);
    writeSync(fd, line);
  }
  closeSync(fd);
}

function stringifyCombinableWords({
  level,
  chars,
  words,
}: CombinableWords): string {
  return `{ "level": ${level}, "chars": "${chars}", "words": [${words
    .map((w) => `"${w}"`)
    .join(', ')}] }`;
}

run();

import { writeFile } from 'fs/promises';
import { join } from 'path';

import { GameData } from './utils/create-game-data';
import { filterUsableReadings } from './utils/filter-usable-entries';
import { getCachePath } from './utils/get-cache-path';
import { loadJmDictXml } from './utils/load-jmdict-xml';
import { ReadingMetaData, getReadingMeta } from './utils/get-reading-meta';
import { combinePlayableWords } from './utils/combine-words-of-level';

export type SavedGameData = {
  source: string;
  lastChars: string;
  data: [
    GameData['chars'],
    GameData['level'],
    GameData['serializedMatrix'],
    GameData['encodedMatrix']
  ][];
};

const XML_PATH = join(__dirname, 'assets', 'JMdict_e');

/**
 * This is split in several parts that generates cached files to save the
 * progress enabling continuing it in several runs:
 * - loadJmDictXml
 *   - parse the JmDict XML file into a JSON
 *   - cached in `jmdict.json`
 * - filterUsableReadings
 *   - only "well used words" and with proper length, etc. (fast, no cache needed)
 * - add metadata (level, etc.) to the readings (fast)
 * - combinePlayableWords
 *   - check which words could be used together to create board games
 *   - caches found solutions in `combine-solutions-MIN_LEVEL-MAX_LEVEL`
 *   - caches the progress in `combine-progress-MIN_LEVEL-MAX_LEVEL`
 *   - stores the result in `combinable-words-MIN_LEVEL-MAX_LEVEL.json`
 *
 * TODO:
 * - createGameData
 *   - creates game data (matrix, metadata, etc.) entries for every playable board
 *   - caches the progress in
 * - TBD
 *   - seed the database with the generated data (resumes the progress from the
 *     total number of available entries vs the ones already in the database)
 *
 * Note that every cached file is stored in `.cache/${xml.creationDate}` so its
 * consistent with the XML version, and it's not added to the git repo
 */
async function run() {
  const xml = await loadJmDictXml(XML_PATH);

  if (!xml.creationDate) {
    throw new Error(`Couldn't find the creation date in the XML`);
  }

  // filter all usable entries
  const readings = filterUsableReadings(xml);

  // map the readings with extra metadata needed
  const { meta, levels } = readings.reduce(
    (res, { reading, pri }) => {
      const data = getReadingMeta(reading, pri);
      res.levels[data.level] = (res.levels[data.level] || 0) + 1;
      res.meta.set(reading, data);
      return res;
    },
    {
      meta: new Map<string, ReadingMetaData>(),
      levels: {} as Record<number, number>,
    }
  );
  console.log(`Words by level`, JSON.stringify(levels, null, 2));

  const MIN_LEVEL = 1;
  const MAX_LEVEL = 1;
  const result = await combinePlayableWords(
    xml.creationDate,
    meta,
    MIN_LEVEL,
    MAX_LEVEL
  );
  const level1Path = getCachePath(
    xml.creationDate,
    `combinable-words-${MIN_LEVEL}-${MAX_LEVEL}.json`
  );
  console.log(`Found ${result.length} games for level 1`);
  await writeFile(level1Path, JSON.stringify(result));
}

run();

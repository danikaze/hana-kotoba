import { join } from 'path';
import { filterUsableReadings } from './utils/filter-usable-entries';
import { findPlayableWords } from './utils/find-playable-words';
import { indexByChars } from './utils/index-by-chars';
import { loadJmDictXml } from './utils/load-jmdict-xml';

const XML_PATH = join(__dirname, 'assets', 'JMdict_e');

/**
 * This takes a JMdict dict file and generates a list of playable games
 * (char combination with a list of words)
 * but doesn't really create the game data itself because finding every
 * char combination takes a LONG time so what it does is generating a cache
 * file incrementally which can be consumed by another process in parallel
 * reading it and generating the final game data (in `generate-game-data.ts`)
 */
export async function run() {
  const xml = await loadJmDictXml(XML_PATH);

  if (!xml.creationDate) {
    throw new Error(`Couldn't find the creation date in the XML`);
  }

  // filter all usable entries
  const readings = filterUsableReadings(xml);

  // index the words before accessing
  const { index, chars } = indexByChars(readings.map((r) => r.reading));

  // find the playable chars that give combinable words (saved to disk)
  await findPlayableWords(xml.creationDate, chars, index);

  console.log(`Done! Ready to generate game data`);
}

run();

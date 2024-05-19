import { join } from 'path';
import { seedGames } from '@game/model/seed';
import { PrismaClient } from '@prisma/client';
import { formatNumber, formatTime } from '@utils/format';
import { getCachePath } from './utils/get-cache-path';
import { loadJmDictXml } from './utils/load-jmdict-xml';

/* Execution config */
const MIN_LEVEL = 1;
const MAX_LEVEL = 1;
const XML_PATH = join(__dirname, 'assets', 'JMdict_e');
const CLEAR_PREVIOUS_DATA = true;
const REPORT_EACH_MS = 15_000;
const LINES_PER_BATCH = 1000;

export async function run() {
  const prisma = new PrismaClient();
  const xml = await loadJmDictXml(XML_PATH);
  const sourceFile = getCachePath(
    xml.creationDate,
    `game-data-solutions-${MIN_LEVEL}-${MAX_LEVEL}`
  );

  console.log('- Start seeding games');
  const { ellapsedTime, nGames, nGameWords } = await seedGames({
    prisma,
    sourceFile,
    clear: CLEAR_PREVIOUS_DATA,
    reportInterval: REPORT_EACH_MS,
    linesPerBatch: LINES_PER_BATCH,
  });
  console.log(
    `- Finished processing ${formatNumber(nGames)} games (${formatNumber(
      nGameWords
    )} words) in ${formatTime(ellapsedTime)}`
  );
}

run();

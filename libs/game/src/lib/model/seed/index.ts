import { open } from 'fs/promises';
import { countFileLines } from '@utils/count-file-lines';
import { formatNumber, formatPctg, formatTime } from '@utils/format';
import { customAlphabet } from '@utils/nanoid';

import { Prisma, PrismaClient } from '@prisma/client';

export interface SeedGamesOptions {
  prisma: PrismaClient;
  sourceFile: string;
  reportInterval: number;
  linesPerBatch?: number;
  clear?: boolean;
}

export type GameData = {
  /** Normalized (sorted) chars */
  chars: string;
  serializedMatrix: string;
  encodedMatrix: string;
  level: number;
  words: readonly string[];
};

export type SeedGamesResult = {
  nGames: number;
  nGameWords: number;
  ellapsedTime: number;
};

/**
 * Function that generates the game ids
 */
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  16
);

/**
 * Seed the database from a source file with the list of game data:
 * 1 game entry per line in JSON format with the `GameData` interface
 */
export async function seedGames({
  prisma,
  sourceFile,
  reportInterval,
  linesPerBatch,
  clear,
}: SeedGamesOptions): Promise<SeedGamesResult> {
  const batchSize = linesPerBatch || 100;

  if (clear) {
    console.log('  - Clearing HanaGameWords');
    await clearGamesWords(prisma);
    console.log('  - Clearing HanaGames');
    await clearGames(prisma);
  }

  const totalLines = await countFileLines(sourceFile);
  const startTime = Date.now();
  console.log(
    `  - Start seeding ${formatNumber(totalLines)} games (${formatNumber(
      batchSize
    )} lines per batch)`
  );

  const fd = await open(sourceFile, 'r');
  let nextReport = startTime + reportInterval;
  let linesProcessed = 0;
  let lastLinesProcessed = 0;
  let lastReport = startTime;
  let batch: GameData[] = [];
  let n = await getHighestHanaGameN(prisma);
  for await (const line of fd.readLines()) {
    const data = JSON.parse(line) as GameData;
    batch.push(data);
    linesProcessed++;
    if (batch.length < batchSize) {
      continue;
    }

    await processBatch(prisma, batch, n);
    n += batch.length;
    batch = [];

    if (Date.now() > nextReport) {
      const ellapsed = Date.now() - lastReport;
      const linesPerSecond =
        (linesProcessed - lastLinesProcessed) / (ellapsed / 1000);
      const eta = (1000 * (totalLines - linesProcessed)) / linesPerSecond;
      console.log(
        `    - ${formatNumber(linesProcessed)} lines processed (${formatPctg(
          linesProcessed / totalLines
        )}) at ${formatNumber(
          Math.round(linesPerSecond)
        )} lines/s / ETA: ${formatTime(eta)}`
      );
      lastLinesProcessed = linesProcessed;
      lastReport = nextReport;
      nextReport = Date.now() + reportInterval;
    }
  }
  fd.close();

  if (batch.length > 0) {
    const t0 = Date.now();
    await processBatch(prisma, batch, n);
    const ellapsed = Date.now() - t0;
    console.log(
      `    - Last ${formatNumber(batch.length)} processed in ${formatTime(
        ellapsed
      )}`
    );
  } else {
    console.log(`   - No last batch to process`);
  }

  const ellapsedTime = Date.now() - startTime;
  const nGames = await prisma.hanaGame.count();
  const nGameWords = await prisma.hanaGameWords.count();

  return {
    nGames,
    nGameWords,
    ellapsedTime,
  };
}

async function processBatch(
  { hanaGame, hanaGameWords }: PrismaClient,
  batch: GameData[],
  firstN: number
): Promise<void> {
  // get the existing games
  const existingGames = await hanaGame.findMany({
    where: {
      serializedMatrix: {
        in: batch.map((data) => data.serializedMatrix),
      },
    },
  });

  const isNewGame = (game: GameData) =>
    !existingGames.some(
      (existingGame) => existingGame.serializedMatrix === game.serializedMatrix
    );

  // data to add
  const { gameData, wordData } = batch.filter(isNewGame).reduce(
    (res, { words, ...game }, i) => {
      const gameId = nanoid();
      res.gameData.push({ ...game, id: gameId, n: firstN + i });
      res.wordData.push(...words.map((word) => ({ word, gameId })));
      return res;
    },
    {
      gameData: [] as ({ id: string; n: number } & Omit<GameData, 'words'>)[],
      wordData: [] as { word: string; gameId: string }[],
    }
  );

  await hanaGame.createMany({ data: gameData });
  await hanaGameWords.createMany({ data: wordData });
}

async function clearGamesWords({ hanaGameWords }: PrismaClient): Promise<void> {
  await hanaGameWords.deleteMany({});
}

async function clearGames({ hanaGame }: PrismaClient): Promise<void> {
  await hanaGame.deleteMany({});
}

async function getHighestHanaGameN(prisma: PrismaClient): Promise<number> {
  const query = Prisma.sql(['SELECT MAX(n) as N FROM hanaGame;']);
  const res = (await prisma.$queryRaw(query)) as { N: number }[];

  return res[0].N || 1;
}

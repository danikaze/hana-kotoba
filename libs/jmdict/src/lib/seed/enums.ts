import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';

import {
  JM_DICT_DIALECT,
  JM_DICT_FIELD,
  JM_DICT_GLOSS_TYPE,
  JM_DICT_KANJI_INFO,
  JM_DICT_MISC,
  JM_DICT_READING_INFO,
  JM_DICT_SENSE_POS,
  JmDictLang,
} from '../types';

export async function clearJmDictEnums(prisma: PrismaClient): Promise<void> {
  console.log(' - Clearing enums...');
  await prisma.jmDictDialect.deleteMany({});
  await prisma.jmDictSenseField.deleteMany({});
  await prisma.jmDictKanjiInfo.deleteMany({});
  await prisma.jmDictMisc.deleteMany({});
  await prisma.jmDictSensePos.deleteMany({});
  await prisma.jmDictReadingInfo.deleteMany({});
  await prisma.jmDictLang.deleteMany({});
  await prisma.jmDictLanguageSourceType.deleteMany({});
  await prisma.jmDictPriority.deleteMany({});
  await prisma.jmDictGlossType.deleteMany({});
}

/**
 * Seed the database with "fixed values" for JmDict (such as available enums
 * like: languages, types, information, etc...)
 */
export async function seedJmDictEnums(prisma: PrismaClient): Promise<void> {
  console.log(' - Seeding Enums:');
  console.log('   - Seeding Dialect...');
  await seedDialect(prisma);
  console.log('   - Seeding Field...');
  await seedField(prisma);
  console.log('   - Seeding KanjiInfo...');
  await seedKanjiInfo(prisma);
  console.log('   - Seeding Misc...');
  await seedMisc(prisma);
  console.log('   - Seeding SensePos...');
  await seedSensePos(prisma);
  console.log('   - Seeding ReadingInfo...');
  await seedReadingInfo(prisma);
  console.log('   - Seeding Lang...');
  await seedLang(prisma);
  console.log('   - Seeding LanguageSourceType');
  await seedLsType(prisma);
  console.log('   - Seeding Priorities');
  await seedPriorities(prisma);
  console.log('   - Seeding GlossType');
  await seedGlossTypes(prisma);
}

async function ignoreDuplicates(cb: () => Promise<unknown>): Promise<boolean> {
  try {
    await cb();
    return true;
  } catch (e: unknown) {
    if (e instanceof PrismaClientKnownRequestError) {
      return false;
    }
    throw e;
  }
}

async function seedDialect({ jmDictDialect }: PrismaClient): Promise<void> {
  const entries = Object.entries(JM_DICT_DIALECT).map(([id, meaning]) => ({
    id,
    meaning,
  }));

  for (const entry of entries) {
    await ignoreDuplicates(() => jmDictDialect.create({ data: entry }));
  }
}

async function seedField({ jmDictSenseField }: PrismaClient): Promise<void> {
  const entries = Object.entries(JM_DICT_FIELD).map(([id, meaning]) => ({
    id,
    meaning,
  }));

  for (const entry of entries) {
    await ignoreDuplicates(() => jmDictSenseField.create({ data: entry }));
  }
}

async function seedKanjiInfo({ jmDictKanjiInfo }: PrismaClient): Promise<void> {
  const entries = Object.entries(JM_DICT_KANJI_INFO).map(([id, meaning]) => ({
    id,
    meaning,
  }));

  for (const entry of entries) {
    await ignoreDuplicates(() => jmDictKanjiInfo.create({ data: entry }));
  }
}

async function seedMisc({ jmDictMisc }: PrismaClient): Promise<void> {
  const entries = Object.entries(JM_DICT_MISC).map(([id, meaning]) => ({
    id,
    meaning,
  }));

  for (const entry of entries) {
    await ignoreDuplicates(() => jmDictMisc.create({ data: entry }));
  }
}

async function seedSensePos({ jmDictSensePos }: PrismaClient): Promise<void> {
  const entries = Object.entries(JM_DICT_SENSE_POS).map(([id, meaning]) => ({
    id,
    meaning,
  }));

  for (const entry of entries) {
    await ignoreDuplicates(() => jmDictSensePos.create({ data: entry }));
  }
}

async function seedReadingInfo({
  jmDictReadingInfo,
}: PrismaClient): Promise<void> {
  const entries = Object.entries(JM_DICT_READING_INFO).map(([id, meaning]) => ({
    id,
    meaning,
  }));

  for (const entry of entries) {
    await ignoreDuplicates(() => jmDictReadingInfo.create({ data: entry }));
  }
}

async function seedLang({ jmDictLang }: PrismaClient): Promise<void> {
  const entries = Object.entries(JmDictLang).map(([lang, id]) => ({
    id,
    englishName: lang[0].toUpperCase() + lang.substring(1).toLowerCase(),
  }));

  for (const entry of entries) {
    await ignoreDuplicates(() => jmDictLang.create({ data: entry }));
  }
}

async function seedLsType({
  jmDictLanguageSourceType,
}: PrismaClient): Promise<void> {
  const entries = [
    { id: 'full', meaning: 'Full' },
    { id: 'part', meaning: 'Partial' },
  ];

  for (const entry of entries) {
    await ignoreDuplicates(() =>
      jmDictLanguageSourceType.create({ data: entry })
    );
  }
}

async function seedPriorities({ jmDictPriority }: PrismaClient): Promise<void> {
  const entries = [
    {
      id: 'news1',
      meaning:
        'Appears in the "wordfreq" file by Alexandre Girardi from the Mainichi Shimbun',
    },
    {
      id: 'news2',
      meaning:
        'Appears in the "wordfreq" file by Alexandre Girardi from the Mainichi Shimbun',
    },
    { id: 'ichi1', meaning: 'Appears in the "Ichimango goi bunruishuu"' },
    {
      id: 'ichi2',
      meaning:
        'Appears in the "Ichimango goi bunruishuu" (demoted due to low frequencies in the WWW and newspapers)',
    },
    { id: 'spec1', meaning: 'Common words but not included in other lists' },
    { id: 'spec2', meaning: 'Common words but not included in other lists' },
    { id: 'gai1', meaning: 'Common loanwords based on the "wordfreq" file' },
    { id: 'gai2', meaning: 'Common loanwords based on the "wordfreq" file' },
  ];

  for (let i = 1; i < 50; i++) {
    entries.push({
      id: `nf${i.toString().padStart(2, '0')}`,
      meaning: `Most frequent words in the "wordfreq" file (${
        1 + (i - 1) * 500
      }-${i * 500})`,
    });
  }

  for (const entry of entries) {
    await ignoreDuplicates(() => jmDictPriority.create({ data: entry }));
  }
}

async function seedGlossTypes({
  jmDictGlossType,
}: PrismaClient): Promise<void> {
  const entries = Object.entries(JM_DICT_GLOSS_TYPE).map(([id, meaning]) => ({
    id,
    meaning,
  }));

  for (const entry of entries) {
    await ignoreDuplicates(() => jmDictGlossType.create({ data: entry }));
  }
}

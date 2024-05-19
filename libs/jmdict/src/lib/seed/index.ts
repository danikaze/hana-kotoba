import { PrismaClient } from '@prisma/client';
import { JmDict } from '../types';
import { clearJmDictEnums, seedJmDictEnums } from './enums';
import { clearJmDictEntries, seedJmDictEntries } from './entries';

export interface SeedJmDictOptions {
  xml?: JmDict;
  clearEnums?: boolean;
  clearEntries?: boolean;
  verbose?: boolean;
}

/**
 * Seed the database with values from JmDict
 */
export async function seedJmDict({
  xml,
  clearEnums,
  clearEntries,
}: SeedJmDictOptions = {}): Promise<void> {
  const prisma = new PrismaClient();

  if (clearEnums) {
    await clearJmDictEnums(prisma);
  }
  if (clearEntries) {
    await clearJmDictEntries(prisma);
  }

  await seedJmDictEnums(prisma);

  if (xml) {
    await seedJmDictEntries(prisma, xml);
  }
}

import { PrismaClient } from '@prisma/client';

import { META_CREATION_DATE } from './constants';

/**
 * Provide JmDict model access over the base model
 */
export class JmDictModel {
  protected readonly prisma: PrismaClient;

  public constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  public async dataCreationDate(): Promise<string | undefined> {
    const meta = await this.prisma.meta.findFirst({
      where: { name: META_CREATION_DATE },
    });
    return meta ? meta.value : undefined;
  }

  public async getHighestEntrySeq(): Promise<number> {
    const entry = await this.prisma.jmDictEntry.findFirst({
      orderBy: { entSeq: 'desc' },
    });
    return entry ? entry.entSeq : 0;
  }
}

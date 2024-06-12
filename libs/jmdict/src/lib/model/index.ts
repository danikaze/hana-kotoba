import { PrismaClient } from '@prisma/client';
import { JmDictSensePos } from '../types';

export interface JishoWord {
  readings: string[];
  kanjis: string[];
  senses: JishoWordSense[];
}

export interface JishoWordSense {
  pos: JmDictSensePos[];
  meanings: string[];
}

export class JishoModel {
  private prisma: PrismaClient;

  public constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Retrieve all the data needed to show the meanings of the given `word`
   */
  public async getWord(word: string): Promise<JishoWord[]> {
    // TODO: This might be much faster with JOINs instead of Prisma default
    // approach of multiple queries...
    const senses = await this.prisma.jmDictEntry.findMany({
      where: {
        readings: {
          some: {
            reading: word,
          },
        },
      },
      include: {
        kanjis: true,
        readings: {
          where: {
            reading: word,
          },
        },
        senses: {
          include: {
            pos: true,
            glosses: true,
          },
        },
      },
    });

    return senses.map(
      (entry) =>
        ({
          readings: entry.readings.map(({ reading }) => reading),
          kanjis: entry.kanjis.map(({ kanji }) => kanji),
          senses: entry.senses.map(({ pos, glosses }) => ({
            pos: pos.map(
              ({ jmDictSensePosId }) => jmDictSensePosId as JmDictSensePos
            ),
            meanings: glosses.map(({ text }) => text || ''),
          })),
        } as JishoWord)
    );
  }
}

import { PrismaClient, Prisma } from '@prisma/client';

export interface HanaGameData {
  id: string;
  level: number;
  chars: string;
  serializedMatrix: string;
  encodedMatrix: string;
}

export class HanaGameModel {
  private prisma: PrismaClient;
  // the highest HanaGame.n is cached when the model is created, as it's not going to change
  private maxHanaGameN: Promise<number>;

  public constructor() {
    this.prisma = new PrismaClient();
    this.maxHanaGameN = this.getMaxHanaGameN();
  }

  public async readGame(id: string) {
    return this.prisma.hanaGame.findUnique({
      where: { id },
    });
  }

  public async readRandomGame(level?: number): Promise<HanaGameData> {
    const maxN = await this.maxHanaGameN;

    const n = Math.random() * maxN + 1;
    const sql = level
      ? Prisma.sql`
        SELECT id, level, chars, serializedMatrix, encodedMatrix
          FROM hanaGame
          WHERE n <= ${n} AND level = ${level}
          ORDER BY n DESC
          LIMIT 1;`
      : Prisma.sql`
        SELECT id, level, chars, serializedMatrix, encodedMatrix
          FROM hanaGame
          WHERE n <= ${n}
          ORDER BY n DESC
          LIMIT 1;`;

    const res = await this.prisma.$queryRaw<HanaGameData[]>(sql);

    return res[0];
  }

  public async disconnect(): Promise<void> {
    this.prisma.$disconnect();
  }

  private async getMaxHanaGameN(): Promise<number> {
    const res = await this.prisma.$queryRaw<{ N: number }[]>(
      Prisma.sql`SELECT MAX(n) as N FROM hanaGame;`
    );

    // Prisma returns COUNT queries as BigInt
    // needs to be casted as number
    return Number(res[0].N);
  }
}

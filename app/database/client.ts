import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

export const connection = async (db: D1Database) => {
  const adapter = new PrismaD1(db);
  return new PrismaClient({ adapter });
};

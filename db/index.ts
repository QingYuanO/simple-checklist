import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

export function getPrisma(client: D1Database) {
  const adapter = new PrismaD1(client);

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({ adapter });
  } else {
    if (!global.cachedPrisma) {
      global.cachedPrisma = new PrismaClient({ adapter });
    }
    prisma = global.cachedPrisma;
  }
  return prisma;
}

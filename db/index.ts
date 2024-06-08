import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

export function getPrisma(env: Env) {
  const adapter = new PrismaD1(env.DB);

  if (env.ENV === 'prod' || env.ENV === 'test') {
    prisma = new PrismaClient({ adapter });
    prisma = global.cachedPrisma;
  } else {
    if (!global.cachedPrisma) {
      global.cachedPrisma = new PrismaClient({ adapter });
    }
  }
  return prisma;
}

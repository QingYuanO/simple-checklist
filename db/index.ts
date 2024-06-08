import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

export function getPrisma(env: Env) {
  const adapter = new PrismaD1(env.DB);
  console.log(env.ENVIRONMENT);
  
  if (env.ENVIRONMENT === 'dev') {
    if (!global.cachedPrisma) {
      global.cachedPrisma = new PrismaClient({ adapter });
    }
    prisma = global.cachedPrisma;
  } else {
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

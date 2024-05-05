import '@remix-run/cloudflare';
import { PrismaClient } from '@prisma/client';
declare module '@remix-run/cloudflare' {
  export interface AppLoadContext {
    db: PrismaClient<{
      adapter: PrismaD1;
    }>;
  }
}

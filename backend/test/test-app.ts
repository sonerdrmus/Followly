import type { INestApplication } from '@nestjs/common';

import { createApp } from '../src/app.factory';
import { PrismaService } from '../src/database/prisma.service';
import { RedisService } from '../src/redis/redis.service';

export async function startTestApp(): Promise<INestApplication> {
  if (!process.env.DATABASE_URL?.includes('/followly_test')) {
    throw new Error('Refusing to run tests outside the isolated followly_test database.');
  }
  const app = await createApp();
  await app.init();
  return app;
}

export async function resetTestData(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.instagramOAuthState.deleteMany();
  await prisma.instagramAccount.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const redis = app.get(RedisService);
  if (redis.client.options.db !== 1) {
    throw new Error('Refusing to flush Redis because the client is not using database 1.');
  }
  await redis.client.flushdb();
}

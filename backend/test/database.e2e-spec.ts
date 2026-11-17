import { createHash } from 'crypto';

import type { INestApplication } from '@nestjs/common';

import { PrismaService } from '../src/database/prisma.service';
import { resetTestData, startTestApp } from './test-app';

describe('Database', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await startTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetTestData(app);
  });

  it('connects and persists a user with a hashed refresh token', async () => {
    const prisma = app.get(PrismaService);
    const connected = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;
    expect(connected[0]?.ok).toBe(1);

    const user = await prisma.user.create({
      data: {
        email: 'db@example.com',
        passwordHash: '$argon2id$stored-hash',
        displayName: 'Database Test',
      },
    });

    const rawToken = 'raw-refresh-token-value';
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const stored = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    expect(stored.tokenHash).toBe(tokenHash);
    expect(stored.tokenHash).not.toBe(rawToken);
    expect(stored.tokenHash).toMatch(/^[a-f0-9]{64}$/);

    const reloaded = await prisma.user.findUnique({
      where: { id: user.id },
      include: { refreshTokens: true },
    });
    expect(reloaded?.refreshTokens).toHaveLength(1);
    expect(JSON.stringify(reloaded)).not.toContain(rawToken);
  });
});

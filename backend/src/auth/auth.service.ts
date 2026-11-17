import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import type { StringValue } from 'ms';
import type { User } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { toPublicUser } from '../users/users.presenter';
import { UsersService } from '../users/users.service';
import type { PublicUser } from '../users/users.types';
import {
  createRefreshToken,
  durationToMs,
  durationToSeconds,
  hashToken,
  tokenHashesMatch,
} from './auth.tokens';

export type AuthSession = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
};

function invalidCredentials(): UnauthorizedException {
  return new UnauthorizedException({
    message: 'Invalid email or password.',
    code: 'INVALID_CREDENTIALS',
  });
}

@Injectable()
export class AuthService {
  private dummyHash: Promise<string> | null = null;

  constructor(
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<PublicUser> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictException({
        message: 'An account with this email already exists.',
        code: 'EMAIL_TAKEN',
      });
    }
    return this.users.create(input);
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      await this.users.verifyPassword(await this.getDummyHash(), password);
      throw invalidCredentials();
    }

    const passwordMatches = await this.users.verifyPassword(user.passwordHash, password);
    if (!passwordMatches || !user.isActive) {
      throw invalidCredentials();
    }

    return this.issueSession(user);
  }

  async refresh(rawToken: string): Promise<AuthSession> {
    const tokenHash = hashToken(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing || !tokenHashesMatch(existing.tokenHash, tokenHash)) {
      throw new UnauthorizedException({
        message: 'Refresh token is invalid.',
        code: 'REFRESH_TOKEN_INVALID',
      });
    }

    if (existing.revokedAt) {
      await this.revokeActiveTokens(existing.userId);
      throw new UnauthorizedException({
        message: 'Refresh token is no longer valid.',
        code: 'REFRESH_TOKEN_REVOKED',
      });
    }

    if (existing.expiresAt.getTime() <= Date.now() || !existing.user.isActive) {
      throw new UnauthorizedException({
        message: existing.user.isActive
          ? 'Refresh token has expired.'
          : 'Refresh token is invalid.',
        code: existing.user.isActive ? 'REFRESH_TOKEN_EXPIRED' : 'REFRESH_TOKEN_INVALID',
      });
    }

    const next = createRefreshToken();
    const expiresAt = new Date(Date.now() + durationToMs(this.refreshTtl()));

    await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.refreshToken.updateMany({
        where: { id: existing.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (revoked.count !== 1) {
        await tx.refreshToken.updateMany({
          where: { userId: existing.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException({
          message: 'Refresh token is no longer valid.',
          code: 'REFRESH_TOKEN_REVOKED',
        });
      }
      await tx.refreshToken.create({
        data: {
          userId: existing.userId,
          tokenHash: next.tokenHash,
          expiresAt,
        },
      });
    });

    return this.buildSession(existing.user, next.raw);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueSession(user: User): Promise<AuthSession> {
    const refresh = createRefreshToken();
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refresh.tokenHash,
        expiresAt: new Date(Date.now() + durationToMs(this.refreshTtl())),
      },
    });
    return this.buildSession(user, refresh.raw);
  }

  private async buildSession(user: User, refreshToken: string): Promise<AuthSession> {
    const accessTtl = this.config.getOrThrow<string>('jwt.accessTtl');
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: accessTtl as StringValue },
    );
    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
      accessTokenExpiresIn: durationToSeconds(accessTtl),
    };
  }

  private refreshTtl(): string {
    return this.config.getOrThrow<string>('jwt.refreshTtl');
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= argon2.hash(randomBytes(32).toString('hex'), { type: argon2.argon2id });
    return this.dummyHash;
  }

  private revokeActiveTokens(userId: string): Promise<unknown> {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

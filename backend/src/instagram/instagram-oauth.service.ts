import { createHash, randomBytes } from 'crypto';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, type InstagramAuthMethod } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { InstagramCryptoService } from './instagram-crypto.service';
import {
  APP_RETURN_URL,
  INSTAGRAM_BASIC,
  INSTAGRAM_BUSINESS_BASIC,
  OAUTH_STATE_TTL_MS,
  type ReturnReason,
} from './instagram.constants';
import { MetaInstagramClient } from './meta-instagram.client';
import { MetaInstagramError, type InstagramProfile } from './meta-instagram.types';

type ConsumedState = { status: 'ok'; userId: string } | { status: 'missing' | 'used' | 'expired' };

@Injectable()
export class InstagramOAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly meta: MetaInstagramClient,
    private readonly crypto: InstagramCryptoService,
  ) {}

  async begin(userId: string): Promise<{ authorizationUrl: string; expiresAt: string }> {
    this.assertConfigured();
    const state = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + OAUTH_STATE_TTL_MS);
    await this.prisma.instagramOAuthState.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { userId, usedAt: { not: null } }] },
    });
    await this.prisma.instagramOAuthState.create({
      data: {
        userId,
        stateHash: hashState(state),
        expiresAt,
      },
    });
    return {
      authorizationUrl: this.meta.authorizationUrl(state),
      expiresAt: expiresAt.toISOString(),
    };
  }

  async complete(query: unknown): Promise<string> {
    const params = readCallbackQuery(query);
    if (params.error === 'access_denied' || params.errorReason === 'user_denied') {
      if (params.state) {
        await this.consume(params.state);
      }
      return appRedirect('cancelled');
    }
    if (params.error) {
      if (params.state) {
        await this.consume(params.state);
      }
      return appRedirect('error', 'permission_denied');
    }

    if (!params.state) {
      return appRedirect('error', 'state_invalid');
    }
    const consumed = await this.consume(params.state);
    if (consumed.status === 'expired') {
      return appRedirect('error', 'state_expired');
    }
    if (consumed.status !== 'ok') {
      return appRedirect('error', 'state_invalid');
    }
    if (!params.code) {
      return appRedirect('error', 'code_missing');
    }

    try {
      if (this.config.get<string>('instagram.loginMode') === 'unified_login') {
        await this.completeUnified(consumed.userId, params.code);
      } else {
        await this.completeInstagramLogin(consumed.userId, params.code);
      }
      return appRedirect('connected');
    } catch (error) {
      return appRedirect('error', reasonFor(error));
    }
  }

  private async completeInstagramLogin(userId: string, code: string): Promise<void> {
    const shortLived = await this.meta.exchangeCode(code);
    if (!shortLived.scopes.includes(INSTAGRAM_BUSINESS_BASIC)) {
      throw new MetaInstagramError('TOKEN_INVALID');
    }
    const longLived = await this.meta.exchangeLongLived(shortLived.accessToken);
    const profile = await this.meta.fetchProfile(longLived.accessToken, shortLived.instagramUserId);
    const issuedAt = new Date();
    await this.saveConnection({
      userId,
      profile,
      accessToken: longLived.accessToken,
      expiresAt: new Date(issuedAt.getTime() + longLived.expiresIn * 1000),
      issuedAt,
      scopes: shortLived.scopes,
      authMethod: 'instagram_login',
      clientBusinessId: null,
    });
  }

  private async completeUnified(userId: string, code: string): Promise<void> {
    const token = await this.meta.exchangeUnifiedCode(code);
    const scopes = await this.meta.fetchGrantedPermissions(token.accessToken);
    if (!scopes.includes(INSTAGRAM_BASIC)) {
      throw new MetaInstagramError('TOKEN_INVALID');
    }
    const assigned = await this.meta.fetchAssignedInstagramAccounts(token.accessToken);
    if (assigned.length === 0) {
      throw new MetaInstagramError('ACCOUNT_MISSING');
    }
    if (assigned.length > 1) {
      throw new MetaInstagramError('MULTIPLE_ACCOUNTS');
    }
    const account = assigned[0];
    if (!account) {
      throw new MetaInstagramError('PROFILE_FAILED');
    }
    const profile = await this.meta.fetchUnifiedProfile(token.accessToken, account.id);
    const clientBusinessId = await this.meta.fetchClientBusinessId(token.accessToken);
    const issuedAt = new Date();
    await this.saveConnection({
      userId,
      profile,
      accessToken: token.accessToken,
      expiresAt: token.expiresIn === null ? null : new Date(issuedAt.getTime() + token.expiresIn * 1000),
      issuedAt,
      scopes,
      authMethod: 'unified_login',
      clientBusinessId,
    });
  }

  private assertConfigured(): void {
    if (!this.config.get<boolean>('instagram.configured')) {
      throw new HttpException(
        {
          message: 'Instagram sign-in is not configured on this server.',
          code: 'INSTAGRAM_NOT_CONFIGURED',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private async consume(state: string): Promise<ConsumedState> {
    if (state.length < 32 || state.length > 200) {
      return { status: 'missing' };
    }
    const stateHash = hashState(state);
    const row = await this.prisma.instagramOAuthState.findUnique({ where: { stateHash } });
    if (!row) {
      return { status: 'missing' };
    }
    if (row.usedAt) {
      return { status: 'used' };
    }
    if (row.expiresAt.getTime() <= Date.now()) {
      return { status: 'expired' };
    }
    const updated = await this.prisma.instagramOAuthState.updateMany({
      where: { id: row.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (updated.count !== 1) {
      const again = await this.prisma.instagramOAuthState.findUnique({ where: { id: row.id } });
      return { status: again?.usedAt ? 'used' : 'expired' };
    }
    return { status: 'ok', userId: row.userId };
  }

  private async saveConnection(input: {
    userId: string;
    profile: InstagramProfile;
    accessToken: string;
    expiresAt: Date | null;
    issuedAt: Date;
    scopes: string[];
    authMethod: InstagramAuthMethod;
    clientBusinessId: string | null;
  }): Promise<void> {
    const encrypted = this.crypto.encrypt(input.accessToken);
    const data = {
      instagramUserId: input.profile.instagramUserId,
      username: input.profile.username,
      displayName: input.profile.displayName,
      profilePictureUrl: input.profile.profilePictureUrl,
      accountType: input.profile.accountType,
      followersCount: input.profile.followersCount,
      followsCount: input.profile.followsCount,
      mediaCount: input.profile.mediaCount,
      accessTokenEncrypted: encrypted,
      tokenExpiresAt: input.expiresAt,
      tokenIssuedAt: input.issuedAt,
      scopes: input.scopes.join(','),
      authMethod: input.authMethod,
      clientBusinessId: input.clientBusinessId,
      connectionStatus: 'connected' as const,
      lastSyncedAt: input.issuedAt,
      connectedAt: input.issuedAt,
      disconnectedAt: null,
    };

    try {
      await this.prisma.$transaction(async (tx) => {
        const other = await tx.instagramAccount.findFirst({
          where: {
            instagramUserId: input.profile.instagramUserId,
            connectionStatus: 'connected',
            userId: { not: input.userId },
          },
          select: { id: true },
        });
        if (other) {
          throw new DuplicateInstagramAccountError();
        }
        await tx.instagramAccount.upsert({
          where: { userId: input.userId },
          create: { userId: input.userId, ...data },
          update: data,
        });
      });
    } catch (error) {
      if (error instanceof DuplicateInstagramAccountError || isActiveAccountConflict(error)) {
        throw new DuplicateInstagramAccountError();
      }
      throw error;
    }
  }
}

class DuplicateInstagramAccountError extends Error {
  constructor() {
    super('DUPLICATE_INSTAGRAM_ACCOUNT');
    this.name = 'DuplicateInstagramAccountError';
  }
}

function hashState(state: string): string {
  return createHash('sha256').update(state).digest('hex');
}

function appRedirect(result: 'connected' | 'cancelled' | 'error', reason?: ReturnReason): string {
  const url = new URL(APP_RETURN_URL);
  url.searchParams.set('result', result);
  if (result === 'error' && reason) {
    url.searchParams.set('reason', reason);
  }
  return url.toString();
}

function reasonFor(error: unknown): ReturnReason {
  if (error instanceof DuplicateInstagramAccountError || isActiveAccountConflict(error)) {
    return 'duplicate_account';
  }
  if (!(error instanceof MetaInstagramError)) {
    return 'meta_unavailable';
  }
  switch (error.code) {
    case 'UNSUPPORTED_ACCOUNT':
      return 'unsupported_account';
    case 'TOKEN_EXCHANGE_FAILED':
    case 'UNEXPECTED_RESPONSE':
      return 'token_exchange_failed';
    case 'PROFILE_FAILED':
      return 'profile_failed';
    case 'ACCOUNT_MISSING':
      return 'account_missing';
    case 'MULTIPLE_ACCOUNTS':
      return 'multiple_accounts';
    case 'TOKEN_INVALID':
      return 'permission_denied';
    default:
      return 'meta_unavailable';
  }
}

function isActiveAccountConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

function readCallbackQuery(value: unknown): {
  code: string | null;
  state: string | null;
  error: string | null;
  errorReason: string | null;
} {
  const record =
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  return {
    code: normalizeCode(readQueryValue(record.code)),
    state: readQueryValue(record.state),
    error: readQueryValue(record.error),
    errorReason: readQueryValue(record.error_reason),
  };
}

function readQueryValue(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCode(code: string | null): string | null {
  if (!code) {
    return null;
  }
  const stripped = code.replace(/#_$/, '').trim();
  return stripped.length > 0 ? stripped : null;
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { InstagramCryptoService } from './instagram-crypto.service';
import {
  toPublicInstagramAccount,
  type PublicInstagramAccount,
} from './instagram-account.presenter';
import { InstagramTokenService } from './instagram-token.service';
import { MetaInstagramClient } from './meta-instagram.client';
import { MetaInstagramError } from './meta-instagram.types';

@Injectable()
export class InstagramAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: InstagramCryptoService,
    private readonly meta: MetaInstagramClient,
    private readonly tokens: InstagramTokenService,
  ) {}

  async list(userId: string): Promise<PublicInstagramAccount[]> {
    const accounts = await this.prisma.instagramAccount.findMany({
      where: { userId },
      orderBy: { connectedAt: 'desc' },
    });
    return accounts.map(toPublicInstagramAccount);
  }

  async get(userId: string, accountId: string): Promise<PublicInstagramAccount> {
    const account = await this.owned(userId, accountId);
    return toPublicInstagramAccount(account);
  }

  async disconnect(
    userId: string,
    accountId: string,
  ): Promise<{ disconnected: true; remoteAuthorizationRevoked: false }> {
    const account = await this.owned(userId, accountId);
    if (account.connectionStatus !== 'disconnected') {
      await this.prisma.instagramAccount.update({
        where: { id: account.id },
        data: {
          connectionStatus: 'disconnected',
          disconnectedAt: new Date(),
          accessTokenEncrypted: null,
          tokenExpiresAt: null,
          tokenIssuedAt: null,
        },
      });
    }
    return { disconnected: true, remoteAuthorizationRevoked: false };
  }

  async syncProfile(userId: string, accountId: string): Promise<PublicInstagramAccount> {
    const account = await this.owned(userId, accountId);
    if (account.connectionStatus === 'disconnected' || !account.accessTokenEncrypted) {
      throw instagramHttp(
        HttpStatus.CONFLICT,
        'INSTAGRAM_DISCONNECTED',
        'This Instagram account is disconnected.',
      );
    }
    if (account.tokenExpiresAt && account.tokenExpiresAt.getTime() <= Date.now()) {
      await this.prisma.instagramAccount.update({
        where: { id: account.id },
        data: { connectionStatus: 'expired', accessTokenEncrypted: null },
      });
      throw instagramHttp(
        HttpStatus.CONFLICT,
        'TOKEN_EXPIRED',
        'The Instagram connection has expired. Connect the account again.',
      );
    }

    let accessToken = this.crypto.decrypt(account.accessTokenEncrypted);
    let tokenExpiresAt = account.tokenExpiresAt;
    let tokenIssuedAt = account.tokenIssuedAt;
    let refreshed = false;

    if (
      account.authMethod === 'instagram_login' &&
      this.tokens.shouldRefresh(tokenIssuedAt, tokenExpiresAt)
    ) {
      try {
        const next = await this.tokens.refresh(accessToken);
        accessToken = next.accessToken;
        tokenExpiresAt = next.expiresAt;
        tokenIssuedAt = next.issuedAt;
        refreshed = true;
      } catch (error) {
        if (error instanceof MetaInstagramError && error.code === 'TOKEN_INVALID') {
          await this.markRevoked(account.id);
          throw instagramHttp(
            HttpStatus.CONFLICT,
            'TOKEN_REVOKED',
            'Instagram authorization is no longer valid. Connect the account again.',
          );
        }
        throw instagramHttp(
          HttpStatus.SERVICE_UNAVAILABLE,
          'META_UNAVAILABLE',
          'Instagram could not refresh this connection.',
        );
      }
    }

    try {
      const profile =
        account.authMethod === 'unified_login'
          ? await this.meta.fetchUnifiedProfile(accessToken, account.instagramUserId)
          : await this.meta.fetchProfile(accessToken, account.instagramUserId);
      const updated = await this.prisma.instagramAccount.update({
        where: { id: account.id },
        data: {
          instagramUserId: profile.instagramUserId,
          username: profile.username,
          displayName: profile.displayName,
          profilePictureUrl: profile.profilePictureUrl,
          accountType: profile.accountType,
          followersCount: profile.followersCount,
          followsCount: profile.followsCount,
          mediaCount: profile.mediaCount,
          connectionStatus: 'connected',
          lastSyncedAt: new Date(),
          disconnectedAt: null,
          ...(refreshed
            ? {
                accessTokenEncrypted: this.crypto.encrypt(accessToken),
                tokenExpiresAt,
                tokenIssuedAt,
              }
            : {}),
        },
      });
      return toPublicInstagramAccount(updated);
    } catch (error) {
      if (error instanceof MetaInstagramError && error.code === 'TOKEN_INVALID') {
        await this.markRevoked(account.id);
        throw instagramHttp(
          HttpStatus.CONFLICT,
          'TOKEN_REVOKED',
          'Instagram authorization is no longer valid. Connect the account again.',
        );
      }
      if (error instanceof MetaInstagramError && error.code === 'UNSUPPORTED_ACCOUNT') {
        throw instagramHttp(
          HttpStatus.UNPROCESSABLE_ENTITY,
          'UNSUPPORTED_ACCOUNT',
          'This Instagram account is not a Business or Creator account.',
        );
      }
      throw instagramHttp(
        HttpStatus.SERVICE_UNAVAILABLE,
        'META_UNAVAILABLE',
        'Instagram profile details could not be loaded.',
      );
    }
  }

  private async owned(userId: string, accountId: string) {
    const account = await this.prisma.instagramAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw instagramHttp(HttpStatus.NOT_FOUND, 'NOT_FOUND', 'Instagram account not found.');
    }
    return account;
  }

  private async markRevoked(accountId: string): Promise<void> {
    await this.prisma.instagramAccount.update({
      where: { id: accountId },
      data: {
        connectionStatus: 'revoked',
        accessTokenEncrypted: null,
        tokenExpiresAt: null,
        tokenIssuedAt: null,
      },
    });
  }
}

function instagramHttp(status: HttpStatus, code: string, message: string): HttpException {
  return new HttpException({ message, code }, status);
}

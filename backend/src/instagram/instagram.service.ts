import { Injectable, Logger } from '@nestjs/common';

import { InstagramAccountsService } from './instagram-accounts.service';
import type { PublicInstagramAccount } from './instagram-account.presenter';
import { InstagramOAuthService } from './instagram-oauth.service';
import { APP_RETURN_URL } from './instagram.constants';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(
    private readonly oauth: InstagramOAuthService,
    private readonly accounts: InstagramAccountsService,
  ) {}

  begin(userId: string): Promise<{ authorizationUrl: string; expiresAt: string }> {
    return this.oauth.begin(userId);
  }

  async complete(query: unknown): Promise<string> {
    try {
      return await this.oauth.complete(query);
    } catch (error) {
      this.logger.error(error instanceof Error ? error.name : 'InstagramCallbackError');
      const url = new URL(APP_RETURN_URL);
      url.searchParams.set('result', 'error');
      url.searchParams.set('reason', 'meta_unavailable');
      return url.toString();
    }
  }

  list(userId: string): Promise<PublicInstagramAccount[]> {
    return this.accounts.list(userId);
  }

  get(userId: string, accountId: string): Promise<PublicInstagramAccount> {
    return this.accounts.get(userId, accountId);
  }

  disconnect(
    userId: string,
    accountId: string,
  ): Promise<{ disconnected: true; remoteAuthorizationRevoked: false }> {
    return this.accounts.disconnect(userId, accountId);
  }

  syncProfile(userId: string, accountId: string): Promise<PublicInstagramAccount> {
    return this.accounts.syncProfile(userId, accountId);
  }
}

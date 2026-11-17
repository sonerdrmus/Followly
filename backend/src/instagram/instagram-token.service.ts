import { Injectable } from '@nestjs/common';

import { TOKEN_REFRESH_MIN_AGE_MS, TOKEN_REFRESH_WINDOW_MS } from './instagram.constants';
import { MetaInstagramClient } from './meta-instagram.client';

/**
 * Instagram long-lived tokens are not Followly refresh tokens.
 * Meta allows a refresh only after 24 hours, and only while the token is still valid.
 * A later worker can call `refresh` for tokens inside the refresh window.
 * This phase does not schedule that worker.
 */
@Injectable()
export class InstagramTokenService {
  constructor(private readonly meta: MetaInstagramClient) {}

  shouldRefresh(issuedAt: Date | null, expiresAt: Date | null, now = new Date()): boolean {
    if (!issuedAt || !expiresAt) {
      return false;
    }
    const nowMs = now.getTime();
    if (expiresAt.getTime() <= nowMs) {
      return false;
    }
    if (nowMs - issuedAt.getTime() < TOKEN_REFRESH_MIN_AGE_MS) {
      return false;
    }
    return expiresAt.getTime() - nowMs <= TOKEN_REFRESH_WINDOW_MS;
  }

  async refresh(
    accessToken: string,
  ): Promise<{ accessToken: string; expiresAt: Date; issuedAt: Date }> {
    const refreshed = await this.meta.refreshLongLived(accessToken);
    const issuedAt = new Date();
    return {
      accessToken: refreshed.accessToken,
      expiresAt: new Date(issuedAt.getTime() + refreshed.expiresIn * 1000),
      issuedAt,
    };
  }
}

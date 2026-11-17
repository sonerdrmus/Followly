import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AUTHORIZE_URL,
  CODE_EXCHANGE_URL,
  LONG_LIVED_URL,
  PROFILE_FIELDS,
  REFRESH_URL,
  UNIFIED_AUTHORIZE_URL,
  UNIFIED_PROFILE_FIELDS,
} from './instagram.constants';
import {
  parseAssignedInstagramAccounts,
  parseClientBusinessId,
  parseGrantedPermissions,
  parseLongLivedToken,
  parseProfile,
  parseShortLivedToken,
  parseUnifiedAccessToken,
} from './meta-instagram.parse';
import {
  MetaInstagramError,
  type AssignedInstagramAccount,
  type InstagramProfile,
  type LongLivedToken,
  type ShortLivedToken,
  type UnifiedAccessToken,
} from './meta-instagram.types';

const requestTimeoutMs = 15_000;

@Injectable()
export class MetaInstagramClient {
  constructor(private readonly config: ConfigService) {}

  authorizationUrl(state: string): string {
    if (this.loginMode() === 'unified_login') {
      const url = new URL(UNIFIED_AUTHORIZE_URL);
      url.searchParams.set('client_id', this.appId());
      url.searchParams.set('config_id', this.configId());
      url.searchParams.set('redirect_uri', this.redirectUri());
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('state', state);
      url.searchParams.set('prompt', 'login');
      return url.toString();
    }
    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set('client_id', this.appId());
    url.searchParams.set('redirect_uri', this.redirectUri());
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.scopes().join(','));
    url.searchParams.set('state', state);
    url.searchParams.set('enable_fb_login', 'false');
    return url.toString();
  }

  async exchangeCode(code: string): Promise<ShortLivedToken> {
    const body = new FormData();
    body.set('client_id', this.appId());
    body.set('client_secret', this.appSecret());
    body.set('grant_type', 'authorization_code');
    body.set('redirect_uri', this.redirectUri());
    body.set('code', code);
    const payload = await this.request(
      CODE_EXCHANGE_URL,
      { method: 'POST', body },
      'TOKEN_EXCHANGE_FAILED',
    );
    return parseShortLivedToken(payload);
  }

  async exchangeLongLived(shortLivedToken: string): Promise<LongLivedToken> {
    const url = new URL(LONG_LIVED_URL);
    url.searchParams.set('grant_type', 'ig_exchange_token');
    url.searchParams.set('client_secret', this.appSecret());
    url.searchParams.set('access_token', shortLivedToken);
    const payload = await this.request(url, { method: 'GET' }, 'TOKEN_EXCHANGE_FAILED');
    return parseLongLivedToken(payload);
  }

  async refreshLongLived(longLivedToken: string): Promise<LongLivedToken> {
    const url = new URL(REFRESH_URL);
    url.searchParams.set('grant_type', 'ig_refresh_token');
    url.searchParams.set('access_token', longLivedToken);
    const payload = await this.request(url, { method: 'GET' }, 'REFRESH_FAILED');
    return parseLongLivedToken(payload);
  }

  async exchangeUnifiedCode(code: string): Promise<UnifiedAccessToken> {
    const url = new URL(`https://graph.facebook.com/${this.apiVersion()}/oauth/access_token`);
    url.searchParams.set('client_id', this.appId());
    url.searchParams.set('client_secret', this.appSecret());
    url.searchParams.set('redirect_uri', this.redirectUri());
    url.searchParams.set('code', code);
    const payload = await this.request(url, { method: 'GET' }, 'TOKEN_EXCHANGE_FAILED');
    return parseUnifiedAccessToken(payload);
  }

  async fetchGrantedPermissions(accessToken: string): Promise<string[]> {
    const url = this.graphUrl('me/permissions', accessToken);
    const payload = await this.request(url, { method: 'GET' }, 'PROFILE_FAILED');
    return parseGrantedPermissions(payload);
  }

  async fetchAssignedInstagramAccounts(accessToken: string): Promise<AssignedInstagramAccount[]> {
    const url = this.graphUrl('me/assigned_instagram_accounts', accessToken);
    url.searchParams.set('fields', 'id,username');
    const payload = await this.request(url, { method: 'GET' }, 'PROFILE_FAILED');
    return parseAssignedInstagramAccounts(payload);
  }

  async fetchClientBusinessId(accessToken: string): Promise<string | null> {
    const url = this.graphUrl('me', accessToken);
    url.searchParams.set('fields', 'client_business_id');
    try {
      const payload = await this.request(url, { method: 'GET' }, 'PROFILE_FAILED');
      return parseClientBusinessId(payload);
    } catch (error) {
      if (error instanceof MetaInstagramError && error.code === 'PROFILE_FAILED') {
        return null;
      }
      throw error;
    }
  }

  async fetchUnifiedProfile(accessToken: string, instagramUserId: string): Promise<InstagramProfile> {
    const url = this.graphUrl(instagramUserId, accessToken);
    url.searchParams.set('fields', UNIFIED_PROFILE_FIELDS.join(','));
    const payload = await this.request(url, { method: 'GET' }, 'PROFILE_FAILED');
    return parseProfile(payload, instagramUserId);
  }

  async fetchProfile(accessToken: string, fallbackUserId: string): Promise<InstagramProfile> {
    const url = new URL(`https://graph.instagram.com/${this.apiVersion()}/me`);
    url.searchParams.set('fields', PROFILE_FIELDS.join(','));
    url.searchParams.set('access_token', accessToken);
    const payload = await this.request(url, { method: 'GET' }, 'PROFILE_FAILED');
    return parseProfile(payload, fallbackUserId);
  }

  private appId(): string {
    return this.config.getOrThrow<string>('instagram.appId');
  }

  private appSecret(): string {
    return this.config.getOrThrow<string>('instagram.appSecret');
  }

  private redirectUri(): string {
    return this.config.getOrThrow<string>('instagram.redirectUri');
  }

  private apiVersion(): string {
    return this.config.getOrThrow<string>('instagram.apiVersion');
  }

  private scopes(): string[] {
    return this.config.getOrThrow<string[]>('instagram.scopes');
  }

  private configId(): string {
    return this.config.getOrThrow<string>('instagram.configId');
  }

  private loginMode(): 'instagram_login' | 'unified_login' {
    return this.config.get<'instagram_login' | 'unified_login'>('instagram.loginMode') ?? 'instagram_login';
  }

  private graphUrl(path: string, accessToken: string): URL {
    const url = new URL(`https://graph.facebook.com/${this.apiVersion()}/${path}`);
    url.searchParams.set('access_token', accessToken);
    return url;
  }

  private async request(
    url: string | URL,
    init: RequestInit,
    failure: 'TOKEN_EXCHANGE_FAILED' | 'PROFILE_FAILED' | 'REFRESH_FAILED',
  ): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(requestTimeoutMs) });
    } catch {
      throw new MetaInstagramError('META_UNAVAILABLE');
    }

    const payload = await readJson(response);
    if (!response.ok) {
      if (metaErrorCode(payload) === 190 || response.status === 401) {
        throw new MetaInstagramError('TOKEN_INVALID');
      }
      if (response.status >= 500) {
        throw new MetaInstagramError('META_UNAVAILABLE');
      }
      throw new MetaInstagramError(failure);
    }
    return payload;
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function metaErrorCode(payload: unknown): number | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }
  const body = payload as { code?: unknown; error?: { code?: unknown } };
  if (typeof body.error?.code === 'number') {
    return body.error.code;
  }
  return typeof body.code === 'number' ? body.code : null;
}

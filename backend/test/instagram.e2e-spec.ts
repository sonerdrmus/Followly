import { createHash } from 'crypto';

import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';

import { PrismaService } from '../src/database/prisma.service';
import { InstagramCryptoService } from '../src/instagram/instagram-crypto.service';
import { resetTestData, startTestApp } from './test-app';

const password = 'Correct-Horse-1';
const longLivedToken = 'long-lived-instagram-token';
const rotatedToken = 'rotated-instagram-token';

type Profile = {
  user_id: string;
  username: string;
  name: string;
  account_type?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
};

const profile: Profile = {
  user_id: '17841400000000001',
  username: 'followly_studio',
  name: 'Followly Studio',
  account_type: 'Business',
  profile_picture_url: 'https://example.com/avatar.jpg',
  followers_count: 1200,
  follows_count: 180,
  media_count: 42,
};

const originalFetch = global.fetch;

describe('Instagram Login', () => {
  let app: INestApplication;
  let server: Server;
  let exchangeStatus = 200;
  let profileStatus = 200;
  let refreshStatus = 200;

  beforeAll(async () => {
    app = await startTestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetTestData(app);
    exchangeStatus = 200;
    profileStatus = 200;
    refreshStatus = 200;
    profile.account_type = 'Business';
    profile.followers_count = 1200;
    global.fetch = jest.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith('https://api.instagram.com/oauth/access_token')) {
        const code = init?.body instanceof FormData ? String(init.body.get('code') ?? '') : '';
        if (exchangeStatus !== 200 || code === 'used-code') {
          return json({ error_type: 'OAuthException', code: 400, error_message: 'Matching code was not found' }, 400);
        }
        return json({
          data: [
            {
              access_token: 'short-lived-instagram-token',
              user_id: '1020',
              permissions: 'instagram_business_basic',
            },
          ],
        });
      }
      if (url.startsWith('https://graph.instagram.com/access_token')) {
        return json({ access_token: longLivedToken, token_type: 'bearer', expires_in: 5_184_000 });
      }
      if (url.startsWith('https://graph.instagram.com/refresh_access_token')) {
        if (refreshStatus !== 200) {
          return json({ error: { code: 190 } }, 400);
        }
        return json({ access_token: rotatedToken, token_type: 'bearer', expires_in: 5_184_000 });
      }
      if (url.includes('/v27.0/me?')) {
        if (profileStatus !== 200) {
          return json({ error: { code: profileStatus === 401 ? 190 : 1 } }, profileStatus);
        }
        return json(profile);
      }
      return json({ error: { code: 1 } }, 500);
    }) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('builds an authorization URL without a secret or unsupported parameters', async () => {
    const token = await signIn('owner@example.com');
    const response = await request(server)
      .get('/api/v1/instagram/connect')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    const authorizationUrl = new URL(response.body.data.authorizationUrl as string);
    expect(authorizationUrl.origin + authorizationUrl.pathname).toBe('https://www.instagram.com/oauth/authorize');
    expect(authorizationUrl.searchParams.get('client_id')).toBe('123456789012345');
    expect(authorizationUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/api/v1/instagram/callback',
    );
    expect(authorizationUrl.searchParams.get('response_type')).toBe('code');
    expect(authorizationUrl.searchParams.get('scope')).toBe('instagram_business_basic');
    expect(authorizationUrl.searchParams.get('enable_fb_login')).toBe('false');
    expect(authorizationUrl.searchParams.get('code_challenge')).toBeNull();
    expect(authorizationUrl.searchParams.has('client_secret')).toBe(false);
    expect(response.body.data.authorizationUrl).not.toContain('test-instagram-app-secret');

    const state = authorizationUrl.searchParams.get('state') ?? '';
    const stored = await app.get(PrismaService).instagramOAuthState.findFirstOrThrow();
    expect(stored.stateHash).toBe(createHash('sha256').update(state).digest('hex'));
    expect(stored.stateHash).not.toBe(state);
    expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects a callback whose state is missing, reused, or expired', async () => {
    const token = await signIn('state@example.com');
    const { state } = await connect(token);

    const expired = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'fresh-code', state: 'not-a-real-state-value-0123456789' })
      .redirects(0);
    expect(expired.headers.location).toContain('reason=state_invalid');

    await app.get(PrismaService).instagramOAuthState.updateMany({
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
    const stale = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'fresh-code', state })
      .redirects(0);
    expect(stale.headers.location).toContain('reason=state_expired');

    await app.get(PrismaService).instagramOAuthState.updateMany({
      data: { expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    });
    const [first, second] = await Promise.all([
      request(server).get('/api/v1/instagram/callback').query({ code: 'fresh-code', state }).redirects(0),
      request(server).get('/api/v1/instagram/callback').query({ code: 'fresh-code', state }).redirects(0),
    ]);
    const locations = [first.headers.location, second.headers.location].join(' ');
    expect(locations).toContain('result=connected');
    expect(locations).toContain('reason=state_invalid');
    expect(locations).not.toContain(longLivedToken);

    const replay = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'fresh-code', state })
      .redirects(0);
    expect(replay.headers.location).toContain('reason=state_invalid');
  });

  it('treats a denied Instagram prompt as a cancellation and consumes the state', async () => {
    const token = await signIn('cancelled@example.com');
    const { state } = await connect(token);
    const cancelled = await request(server)
      .get('/api/v1/instagram/callback')
      .query({
        error: 'access_denied',
        error_reason: 'user_denied',
        error_description: 'The user denied your request',
        state,
      })
      .redirects(0);

    expect(cancelled.headers.location).toBe('followly://instagram-connect?result=cancelled');
    expect(cancelled.headers.location).not.toContain('denied your request');
    const replay = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'fresh-code', state })
      .redirects(0);
    expect(replay.headers.location).toContain('reason=state_invalid');
  });

  it('stores an encrypted account for the Followly user bound to the state', async () => {
    const owner = await signIn('owner-bound@example.com');
    const other = await signIn('other-bound@example.com');
    const { state } = await connect(owner);
    const callback = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'fresh-code', state })
      .redirects(0);

    expect(callback.status).toBe(302);
    expect(callback.headers.location).toBe('followly://instagram-connect?result=connected');
    expect(callback.headers.location).not.toContain(longLivedToken);

    const accounts = await request(server)
      .get('/api/v1/instagram/accounts')
      .set('Authorization', `Bearer ${owner}`);
    expect(accounts.status).toBe(200);
    expect(accounts.body.data).toMatchObject([
      {
        username: 'followly_studio',
        displayName: 'Followly Studio',
        accountType: 'Business',
        followersCount: 1200,
        followsCount: 180,
        mediaCount: 42,
        connectionStatus: 'connected',
        scopes: ['instagram_business_basic'],
      },
    ]);
    expect(JSON.stringify(accounts.body)).not.toContain(longLivedToken);
    expect(JSON.stringify(accounts.body)).not.toContain('short-lived-instagram-token');

    const row = await app.get(PrismaService).instagramAccount.findFirstOrThrow();
    expect(row.accessTokenEncrypted).not.toContain(longLivedToken);
    expect(app.get(InstagramCryptoService).decrypt(row.accessTokenEncrypted ?? '')).toBe(longLivedToken);

    const foreign = await request(server)
      .get('/api/v1/instagram/accounts')
      .set('Authorization', `Bearer ${other}`);
    expect(foreign.body.data).toEqual([]);
    const hidden = await request(server)
      .get(`/api/v1/instagram/accounts/${row.id}`)
      .set('Authorization', `Bearer ${other}`);
    expect(hidden.status).toBe(404);
  });

  it('does not store an account when token exchange or the account type fails', async () => {
    const token = await signIn('failed@example.com');
    exchangeStatus = 400;
    const denied = await connect(token);
    const exchange = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'used-code', state: denied.state })
      .redirects(0);
    expect(exchange.headers.location).toContain('reason=token_exchange_failed');
    expect(exchange.headers.location).not.toContain('Matching code');

    exchangeStatus = 200;
    profile.account_type = 'Personal';
    const next = await connect(token);
    const unsupported = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'fresh-code', state: next.state })
      .redirects(0);
    expect(unsupported.headers.location).toContain('reason=unsupported_account');
    expect(await app.get(PrismaService).instagramAccount.count()).toBe(0);
  });

  it('rejects a second Followly user connecting the same Instagram account', async () => {
    const first = await signIn('first@example.com');
    const second = await signIn('second@example.com');
    await complete(first);
    const { state } = await connect(second);
    const response = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'fresh-code', state })
      .redirects(0);

    expect(response.headers.location).toContain('reason=duplicate_account');
    expect(await app.get(PrismaService).instagramAccount.count()).toBe(1);
  });

  it('syncs profile fields, refreshes an aging token, and expires a dead token', async () => {
    const token = await signIn('sync@example.com');
    const accountId = await complete(token);
    profile.followers_count = 1300;

    const fresh = await request(server)
      .post(`/api/v1/instagram/accounts/${accountId}/sync-profile`)
      .set('Authorization', `Bearer ${token}`);
    expect(fresh.status).toBe(200);
    expect(fresh.body.data.followersCount).toBe(1300);
    expect(calledUrls().some((url) => url.includes('refresh_access_token'))).toBe(false);

    const issuedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await app.get(PrismaService).instagramAccount.update({
      where: { id: accountId },
      data: { tokenIssuedAt: issuedAt, tokenExpiresAt: expiresAt },
    });
    const refreshed = await request(server)
      .post(`/api/v1/instagram/accounts/${accountId}/sync-profile`)
      .set('Authorization', `Bearer ${token}`);
    expect(refreshed.status).toBe(200);
    expect(calledUrls().some((url) => url.includes('refresh_access_token'))).toBe(true);
    const row = await app.get(PrismaService).instagramAccount.findUniqueOrThrow({ where: { id: accountId } });
    expect(app.get(InstagramCryptoService).decrypt(row.accessTokenEncrypted ?? '')).toBe(rotatedToken);

    await app.get(PrismaService).instagramAccount.update({
      where: { id: accountId },
      data: { tokenExpiresAt: new Date(Date.now() - 1000) },
    });
    const expired = await request(server)
      .post(`/api/v1/instagram/accounts/${accountId}/sync-profile`)
      .set('Authorization', `Bearer ${token}`);
    expect(expired.body.code).toBe('TOKEN_EXPIRED');
    const expiredRow = await app.get(PrismaService).instagramAccount.findUniqueOrThrow({ where: { id: accountId } });
    expect(expiredRow.connectionStatus).toBe('expired');
    expect(expiredRow.accessTokenEncrypted).toBeNull();
  });

  it('clears the local token on disconnect and keeps the Followly session', async () => {
    const token = await signIn('disconnect@example.com');
    const accountId = await complete(token);
    const response = await request(server)
      .post(`/api/v1/instagram/accounts/${accountId}/disconnect`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ disconnected: true, remoteAuthorizationRevoked: false });
    const row = await app.get(PrismaService).instagramAccount.findUniqueOrThrow({ where: { id: accountId } });
    expect(row.connectionStatus).toBe('disconnected');
    expect(row.accessTokenEncrypted).toBeNull();

    const me = await request(server).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    const again = await request(server)
      .post(`/api/v1/instagram/accounts/${accountId}/disconnect`)
      .set('Authorization', `Bearer ${token}`);
    expect(again.status).toBe(200);
  });

  async function signIn(email: string): Promise<string> {
    await request(server).post('/api/v1/auth/register').send({
      email,
      displayName: 'Instagram Tester',
      password,
    });
    const response = await request(server).post('/api/v1/auth/login').send({ email, password });
    return response.body.data.accessToken as string;
  }

  async function connect(token: string): Promise<{ state: string }> {
    const response = await request(server)
      .get('/api/v1/instagram/connect')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    const state = new URL(response.body.data.authorizationUrl as string).searchParams.get('state');
    if (!state) {
      throw new Error('Authorization URL did not include state.');
    }
    return { state };
  }

  async function complete(token: string): Promise<string> {
    const { state } = await connect(token);
    const callback = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'fresh-code', state })
      .redirects(0);
    expect(callback.headers.location).toContain('result=connected');
    const accounts = await request(server)
      .get('/api/v1/instagram/accounts')
      .set('Authorization', `Bearer ${token}`);
    return accounts.body.data[0].id as string;
  }

  function calledUrls(): string[] {
    return (global.fetch as jest.Mock).mock.calls.map((call: unknown[]) => String(call[0]));
  }
});

describe('Instagram API with Unified Login', () => {
  const unifiedToken = 'unified-system-user-token';
  const redirectUri = 'https://tunnel.example/api/v1/instagram/callback';
  const previousConfigId = process.env.META_INSTAGRAM_CONFIG_ID;
  const previousRedirect = process.env.META_INSTAGRAM_REDIRECT_URI;
  let app: INestApplication;
  let server: Server;
  let granted: Array<{ permission: string; status: string }> = [
    { permission: 'instagram_basic', status: 'granted' },
    { permission: 'instagram_manage_messages', status: 'granted' },
  ];
  let assigned: Array<{ id: string; username: string }> = [
    { id: '17841400000000001', username: 'followly_studio' },
  ];

  beforeAll(async () => {
    process.env.META_INSTAGRAM_CONFIG_ID = '900000000000001';
    process.env.META_INSTAGRAM_REDIRECT_URI = redirectUri;
    app = await startTestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    process.env.META_INSTAGRAM_CONFIG_ID = previousConfigId;
    process.env.META_INSTAGRAM_REDIRECT_URI = previousRedirect;
    await app.close();
  });

  beforeEach(async () => {
    await resetTestData(app);
    granted = [
      { permission: 'instagram_basic', status: 'granted' },
      { permission: 'instagram_manage_messages', status: 'granted' },
    ];
    assigned = [{ id: '17841400000000001', username: 'followly_studio' }];
    global.fetch = jest.fn(async (input: string | URL) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/oauth/access_token')) {
        expect(url.searchParams.get('client_secret')).toBe('test-instagram-app-secret');
        expect(url.searchParams.get('redirect_uri')).toBe(redirectUri);
        return json({ access_token: unifiedToken, token_type: 'bearer' });
      }
      if (url.pathname.endsWith('/me/permissions')) {
        return json({ data: granted });
      }
      if (url.pathname.endsWith('/me/assigned_instagram_accounts')) {
        return json({ data: assigned });
      }
      if (url.pathname.endsWith('/me') && url.searchParams.get('fields') === 'client_business_id') {
        return json({ client_business_id: 'biz-100', id: 'system-user' });
      }
      if (url.pathname.endsWith('/17841400000000001')) {
        return json({
          id: '17841400000000001',
          username: 'followly_studio',
          name: 'Followly Studio',
          profile_picture_url: 'https://example.com/avatar.jpg',
          followers_count: 1200,
          follows_count: 180,
          media_count: 42,
        });
      }
      return json({ error: { code: 1 } }, 500);
    }) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('opens Facebook Login for Business with config_id and without a scope or secret', async () => {
    const token = await signIn('unified-owner@example.com');
    const response = await request(server)
      .get('/api/v1/instagram/connect')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    const authorizationUrl = new URL(response.body.data.authorizationUrl as string);
    expect(authorizationUrl.origin + authorizationUrl.pathname).toBe('https://www.facebook.com/dialog/oauth');
    expect(authorizationUrl.searchParams.get('client_id')).toBe('123456789012345');
    expect(authorizationUrl.searchParams.get('config_id')).toBe('900000000000001');
    expect(authorizationUrl.searchParams.get('redirect_uri')).toBe(redirectUri);
    expect(authorizationUrl.searchParams.get('response_type')).toBe('code');
    expect(authorizationUrl.searchParams.get('override_default_response_type')).toBe('true');
    expect(authorizationUrl.searchParams.get('prompt')).toBe('login');
    expect(authorizationUrl.searchParams.get('scope')).toBeNull();
    expect(authorizationUrl.searchParams.has('client_secret')).toBe(false);
    expect(response.body.data.authorizationUrl).not.toContain('test-instagram-app-secret');
  });

  it('stores the shared professional account without inventing an expiry', async () => {
    const token = await signIn('unified-connected@example.com');
    const state = await connect(token);
    const callback = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'unified-code', state })
      .redirects(0);

    expect(callback.headers.location).toBe('followly://instagram-connect?result=connected');
    expect(callback.headers.location).not.toContain(unifiedToken);
    const accounts = await request(server)
      .get('/api/v1/instagram/accounts')
      .set('Authorization', `Bearer ${token}`);
    expect(accounts.body.data).toMatchObject([
      {
        username: 'followly_studio',
        followersCount: 1200,
        followsCount: 180,
        mediaCount: 42,
        accountType: null,
        connectionStatus: 'connected',
        tokenExpiresAt: null,
        scopes: ['instagram_basic', 'instagram_manage_messages'],
      },
    ]);
    expect(JSON.stringify(accounts.body)).not.toContain(unifiedToken);
    const row = await app.get(PrismaService).instagramAccount.findFirstOrThrow();
    expect(row.authMethod).toBe('unified_login');
    expect(row.clientBusinessId).toBe('biz-100');
    expect(row.tokenExpiresAt).toBeNull();
    expect(app.get(InstagramCryptoService).decrypt(row.accessTokenEncrypted ?? '')).toBe(unifiedToken);

    const synced = await request(server)
      .post(`/api/v1/instagram/accounts/${row.id}/sync-profile`)
      .set('Authorization', `Bearer ${token}`);
    expect(synced.status).toBe(200);
    const urls = (global.fetch as jest.Mock).mock.calls.map((call: unknown[]) => String(call[0]));
    expect(urls.some((url) => url.includes('graph.facebook.com/v27.0/17841400000000001'))).toBe(true);
    expect(urls.some((url) => url.includes('graph.instagram.com'))).toBe(false);
  });

  it('does not save a token when instagram_basic was not granted', async () => {
    granted = [{ permission: 'instagram_manage_messages', status: 'granted' }];
    const token = await signIn('unified-permission@example.com');
    const state = await connect(token);
    const callback = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'unified-code', state })
      .redirects(0);

    expect(callback.headers.location).toContain('reason=permission_denied');
    expect(await app.get(PrismaService).instagramAccount.count()).toBe(0);
  });

  it('does not save a token when no account or more than one account is shared', async () => {
    assigned = [];
    const token = await signIn('unified-missing@example.com');
    const missingState = await connect(token);
    const missing = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'unified-code', state: missingState })
      .redirects(0);
    expect(missing.headers.location).toContain('reason=account_missing');

    assigned = [
      { id: '17841400000000001', username: 'followly_studio' },
      { id: '17841400000000002', username: 'followly_other' },
    ];
    const again = await connect(token);
    const multiple = await request(server)
      .get('/api/v1/instagram/callback')
      .query({ code: 'unified-code', state: again })
      .redirects(0);
    expect(multiple.headers.location).toContain('reason=multiple_accounts');
    expect(await app.get(PrismaService).instagramAccount.count()).toBe(0);
  });

  async function signIn(email: string): Promise<string> {
    await request(server).post('/api/v1/auth/register').send({
      email,
      displayName: 'Unified Tester',
      password,
    });
    const response = await request(server).post('/api/v1/auth/login').send({ email, password });
    return response.body.data.accessToken as string;
  }

  async function connect(token: string): Promise<string> {
    const response = await request(server)
      .get('/api/v1/instagram/connect')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    const state = new URL(response.body.data.authorizationUrl as string).searchParams.get('state');
    if (!state) {
      throw new Error('Authorization URL did not include state.');
    }
    return state;
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

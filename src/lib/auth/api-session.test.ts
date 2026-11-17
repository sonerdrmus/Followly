import assert from 'node:assert/strict';
import test from 'node:test';

const base = process.env.FOLLOWLY_API_URL ?? 'http://localhost:3000/api/v1';
const password = 'Correct-Horse-1';
const email = `phase7.${Date.now()}@example.com`;

type Envelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
};

type Session = {
  user: { id: string; email: string; displayName: string; avatarUrl: string | null };
  accessToken: string;
  refreshToken: string;
};

async function call<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; body: Envelope<T> }> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = (await response.json()) as Envelope<T>;
  return { status: response.status, body };
}

test('API is reachable', async () => {
  const health = await call<{ status: string }>('/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.success, true);
  assert.equal(health.body.data?.status, 'ok');
});

test('registration rejects an invalid email and a weak password', async () => {
  const invalid = await call('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email', displayName: 'Ada', password }),
  });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.code, 'VALIDATION_ERROR');

  const weak = await call('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, displayName: 'Ada', password: 'short' }),
  });
  assert.equal(weak.status, 400);
  assert.equal(weak.body.code, 'VALIDATION_ERROR');
  assert.match(weak.body.message ?? '', /uppercase letter/i);
});

test('registration, login, refresh rotation, and logout follow the mobile contract', async () => {
  const created = await call<Session['user']>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, displayName: 'Phase Seven', password }),
  });
  assert.equal(created.status, 200);
  assert.equal(created.body.data?.email, email);
  assert.equal('passwordHash' in (created.body.data ?? {}), false);
  assert.equal('accessToken' in (created.body.data ?? {}), false);

  const duplicate = await call('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: email.toUpperCase(), displayName: 'Phase Seven', password }),
  });
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.code, 'EMAIL_TAKEN');

  const wrong = await call('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'Wrong-Password-1' }),
  });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.code, 'INVALID_CREDENTIALS');

  const session = await call<Session>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  assert.equal(session.status, 200);
  const first = session.body.data;
  assert.ok(first?.accessToken);
  assert.ok(first?.refreshToken);
  assert.equal(first?.user.displayName, 'Phase Seven');

  const me = await call<Session['user']>('/auth/me', {
    headers: { Authorization: `Bearer ${first.accessToken}` },
  });
  assert.equal(me.status, 200);
  assert.equal(me.body.data?.email, email);

  const rotated = await call<Session>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: first.refreshToken }),
  });
  assert.equal(rotated.status, 200);
  const second = rotated.body.data;
  assert.ok(second);
  assert.notEqual(second.refreshToken, first.refreshToken);

  const replay = await call('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: first.refreshToken }),
  });
  assert.equal(replay.status, 401);
  assert.equal(replay.body.code, 'REFRESH_TOKEN_REVOKED');

  const newestAlsoRevoked = await call('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: second.refreshToken }),
  });
  assert.equal(newestAlsoRevoked.status, 401);
  assert.equal(newestAlsoRevoked.body.code, 'REFRESH_TOKEN_REVOKED');

  const signedInAgain = await call<Session>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const current = signedInAgain.body.data;
  assert.ok(current);

  const loggedOut = await call<{ revoked: true }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  assert.equal(loggedOut.status, 200);
  assert.equal(loggedOut.body.data?.revoked, true);

  const afterLogout = await call('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  assert.equal(afterLogout.status, 401);
});

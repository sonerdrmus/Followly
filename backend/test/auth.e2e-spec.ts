import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';

import { PrismaService } from '../src/database/prisma.service';
import { resetTestData, startTestApp } from './test-app';

const password = 'Correct-Horse-1';

type SessionBody = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: { email: string };
  };
  message: string;
};

describe('Authentication', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await startTestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetTestData(app);
  });

  it('registers a user and omits the password hash', async () => {
    const response = await request(server).post('/api/v1/auth/register').send({
      email: 'Person@Example.com',
      displayName: 'Person Example',
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('person@example.com');
    expect(response.body.data.displayName).toBe('Person Example');
    expect(response.body.data.passwordHash).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toContain(password);
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('rejects a duplicate email', async () => {
    await register('person@example.com');
    const response = await request(server).post('/api/v1/auth/register').send({
      email: 'person@example.com',
      displayName: 'Again',
      password,
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ success: false, code: 'EMAIL_TAKEN' });
  });

  it('rejects an invalid email', async () => {
    const response = await request(server).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      displayName: 'Person',
      password,
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a weak password', async () => {
    const response = await request(server).post('/api/v1/auth/register').send({
      email: 'person@example.com',
      displayName: 'Person',
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('logs in with the correct password and rejects the wrong one', async () => {
    await register('person@example.com');

    const denied = await request(server).post('/api/v1/auth/login').send({
      email: 'person@example.com',
      password: 'Wrong-Password-1',
    });
    expect(denied.status).toBe(401);
    expect(denied.body.code).toBe('INVALID_CREDENTIALS');

    const allowed = await request(server).post('/api/v1/auth/login').send({
      email: 'person@example.com',
      password,
    });
    expect(allowed.status).toBe(200);
    expect(allowed.body.data.accessToken).toEqual(expect.any(String));
    expect(allowed.body.data.refreshToken).toEqual(expect.any(String));
    expect(allowed.body.data.user.email).toBe('person@example.com');
    expect(JSON.stringify(allowed.body)).not.toContain('passwordHash');
  });

  it('rotates a refresh token and rejects reuse of the previous one', async () => {
    const session = await login('person@example.com');
    const rotated = await request(server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken });

    expect(rotated.status).toBe(200);
    expect(rotated.body.data.refreshToken).not.toBe(session.refreshToken);

    const next = await request(server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: rotated.body.data.refreshToken as string });
    expect(next.status).toBe(200);

    const reused = await request(server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken });
    expect(reused.status).toBe(401);
    expect(reused.body.code).toBe('REFRESH_TOKEN_REVOKED');

    const afterReuse = await request(server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: next.body.data.refreshToken as string });
    expect(afterReuse.status).toBe(401);
    expect(afterReuse.body.code).toBe('REFRESH_TOKEN_REVOKED');
  });

  it('rejects an expired refresh token', async () => {
    const session = await login('person@example.com');
    const prisma = app.get(PrismaService);
    await prisma.refreshToken.updateMany({
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });

    const response = await request(server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('REFRESH_TOKEN_EXPIRED');
  });

  it('revokes the refresh token on logout', async () => {
    const session = await login('person@example.com');
    const logout = await request(server)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: session.refreshToken });

    expect(logout.status).toBe(200);
    expect(logout.body.data.revoked).toBe(true);

    const refresh = await request(server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken });
    expect(refresh.status).toBe(401);
    expect(refresh.body.code).toBe('REFRESH_TOKEN_REVOKED');
  });

  it('protects the current-user endpoints', async () => {
    const anonymous = await request(server).get('/api/v1/auth/me');
    expect(anonymous.status).toBe(401);
    expect(anonymous.body.code).toBe('UNAUTHORIZED');

    const session = await login('person@example.com');
    const me = await request(server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${session.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe('person@example.com');

    const profile = await request(server)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${session.accessToken}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data.id).toBe(me.body.data.id);
  });

  async function register(email: string): Promise<void> {
    const response = await request(server).post('/api/v1/auth/register').send({
      email,
      displayName: 'Person Example',
      password,
    });
    expect(response.status).toBe(200);
  }

  async function login(email: string): Promise<SessionBody['data']> {
    await register(email);
    const response = await request(server).post('/api/v1/auth/login').send({ email, password });
    expect(response.status).toBe(200);
    return (response.body as SessionBody).data;
  }
});

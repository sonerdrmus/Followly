import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';

import { resetTestData, startTestApp } from './test-app';

describe('Health', () => {
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

  it('reports the API, database, and Redis as available', async () => {
    const response = await request(server).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.database).toBe('up');
    expect(response.body.data.redis).toBe('up');
    expect(response.body.data.timestamp).toEqual(expect.any(String));
    expect(JSON.stringify(response.body)).not.toMatch(/password|secret|postgresql:\/\//i);
  });
});

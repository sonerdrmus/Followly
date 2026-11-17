const databaseUrl =
  'postgresql://followly:followly_dev_only@localhost:5432/followly_test?schema=public';

if (!databaseUrl.includes('/followly_test')) {
  throw new Error('Refusing to run tests outside the isolated followly_test database.');
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = databaseUrl;
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.JWT_ACCESS_SECRET = 'test-only-access-secret-not-for-production-use';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '30d';
process.env.CORS_ORIGINS = 'http://localhost:8081';
process.env.THROTTLE_TTL = '60';
process.env.THROTTLE_LIMIT = '1000';
process.env.AUTH_THROTTLE_LIMIT = '1000';
process.env.INSTAGRAM_THROTTLE_LIMIT = '1000';
process.env.META_INSTAGRAM_APP_ID = '123456789012345';
process.env.META_INSTAGRAM_APP_SECRET = 'test-instagram-app-secret';
process.env.META_INSTAGRAM_REDIRECT_URI = 'http://localhost:3000/api/v1/instagram/callback';
process.env.META_INSTAGRAM_API_VERSION = 'v27.0';
process.env.META_INSTAGRAM_SCOPES = 'instagram_business_basic';
process.env.META_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
process.env.META_TOKEN_ENCRYPTION_KEY_PREVIOUS = '';
process.env.PORT = '0';

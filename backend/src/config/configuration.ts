export type AppConfig = {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwt: {
    accessSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  corsOrigins: string[];
  throttle: {
    ttl: number;
    limit: number;
    authLimit: number;
    instagramLimit: number;
  };
  instagram: {
    appId: string;
    appSecret: string;
    redirectUri: string;
    apiVersion: string;
    scopes: string[];
    configId: string;
    loginMode: 'instagram_login' | 'unified_login';
    configured: boolean;
    encryptionKey: string;
    previousEncryptionKey: string | null;
  };
};

export default function configuration(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL ?? '',
    redisUrl: process.env.REDIS_URL ?? '',
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
      accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
      refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
    },
    corsOrigins: (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    throttle: {
      ttl: Number(process.env.THROTTLE_TTL ?? 60),
      limit: Number(process.env.THROTTLE_LIMIT ?? 60),
      authLimit: Number(process.env.AUTH_THROTTLE_LIMIT ?? 8),
      instagramLimit: Number(process.env.INSTAGRAM_THROTTLE_LIMIT ?? 30),
    },
    instagram: readInstagramConfig(),
  };
}

function readInstagramConfig(): AppConfig['instagram'] {
  const appId = process.env.META_INSTAGRAM_APP_ID?.trim() ?? '';
  const appSecret = process.env.META_INSTAGRAM_APP_SECRET?.trim() ?? '';
  const redirectUri = process.env.META_INSTAGRAM_REDIRECT_URI?.trim() ?? '';
  const previous = process.env.META_TOKEN_ENCRYPTION_KEY_PREVIOUS?.trim() ?? '';
  const scopes = (process.env.META_INSTAGRAM_SCOPES ?? 'instagram_business_basic')
    .split(',')
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);
  const configId = process.env.META_INSTAGRAM_CONFIG_ID?.trim() ?? '';
  const placeholder = 'replace-with-instagram-app-secret';
  const credentialsReady =
    appId.length > 0 && appSecret.length > 0 && appSecret !== placeholder && redirectUri.length > 0;

  return {
    appId,
    appSecret,
    redirectUri,
    apiVersion: process.env.META_INSTAGRAM_API_VERSION?.trim() || 'v27.0',
    scopes,
    configId,
    loginMode: configId.length > 0 ? 'unified_login' : 'instagram_login',
    configured: credentialsReady,
    encryptionKey: process.env.META_TOKEN_ENCRYPTION_KEY?.trim() ?? '',
    previousEncryptionKey: previous.length > 0 ? previous : null,
  };
}

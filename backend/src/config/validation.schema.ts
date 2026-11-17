import Joi from 'joi';

const duration = Joi.string()
  .pattern(/^\d+(s|m|h|d)$/)
  .messages({ 'string.pattern.base': '{{#label}} must look like 15m, 12h, or 30d' });

const devSecret = 'replace-with-at-least-32-random-characters';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required()
    .custom((value: string, helpers) => {
      if (process.env.NODE_ENV === 'production' && value.includes('followly_dev_only')) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .required(),
  JWT_ACCESS_SECRET: Joi.string()
    .min(32)
    .required()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.string().min(32).invalid(devSecret),
    }),
  JWT_ACCESS_TTL: duration.default('15m'),
  JWT_REFRESH_TTL: duration.default('30d'),
  CORS_ORIGINS: Joi.string().allow('').default(''),
  THROTTLE_TTL: Joi.number().integer().min(1).default(60),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(60),
  AUTH_THROTTLE_LIMIT: Joi.number().integer().min(1).default(8),
  INSTAGRAM_THROTTLE_LIMIT: Joi.number().integer().min(1).default(30),
  META_INSTAGRAM_APP_ID: Joi.string().allow('').default(''),
  META_INSTAGRAM_APP_SECRET: Joi.string().allow('').default(''),
  META_INSTAGRAM_CONFIG_ID: Joi.string()
    .allow('')
    .default('')
    .custom((value: string, helpers) => {
      if (value === '' || /^\d{1,32}$/.test(value)) {
        return value;
      }
      return helpers.error('any.invalid');
    }),
  META_INSTAGRAM_REDIRECT_URI: Joi.string()
    .allow('')
    .default('')
    .custom((value: string, helpers) => {
      if (value === '') {
        return value;
      }
      return assertInstagramRedirect(value, helpers);
    }),
  META_INSTAGRAM_API_VERSION: Joi.string()
    .pattern(/^v\d+\.\d+$/)
    .default('v27.0'),
  META_INSTAGRAM_SCOPES: Joi.string()
    .default('instagram_business_basic')
    .custom((value: string, helpers) => {
      const scopes = value
        .split(',')
        .map((scope) => scope.trim())
        .filter((scope) => scope.length > 0);
      const allowed =
        scopes.length > 0 && scopes.every((scope) => scope === 'instagram_business_basic');
      if (!allowed) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  META_TOKEN_ENCRYPTION_KEY: Joi.string()
    .base64()
    .required()
    .custom((value: string, helpers) => {
      const parent = helpers.state.ancestors[0] as { JWT_ACCESS_SECRET?: string } | undefined;
      if (value === parent?.JWT_ACCESS_SECRET) {
        return helpers.error('any.invalid');
      }
      const key = Buffer.from(value, 'base64');
      if (key.length !== 32) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  META_TOKEN_ENCRYPTION_KEY_PREVIOUS: Joi.string()
    .allow('')
    .default('')
    .custom((value: string, helpers) => {
      if (value === '') {
        return value;
      }
      const parent = helpers.state.ancestors[0] as
        { META_TOKEN_ENCRYPTION_KEY?: string } | undefined;
      const key = Buffer.from(value, 'base64');
      if (key.length !== 32 || value === parent?.META_TOKEN_ENCRYPTION_KEY) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
});

function assertInstagramRedirect(
  value: string,
  helpers: Joi.CustomHelpers,
): string | Joi.ErrorReport {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return helpers.error('any.invalid');
  }
  const parent = helpers.state.ancestors[0] as { META_INSTAGRAM_CONFIG_ID?: string } | undefined;
  const unified = (parent?.META_INSTAGRAM_CONFIG_ID ?? '').trim().length > 0;
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const secure =
    url.protocol === 'https:' || (!unified && process.env.NODE_ENV !== 'production' && local);
  if (!secure || url.username || url.password || url.search || url.hash) {
    return helpers.error('any.invalid');
  }
  if (url.pathname !== '/api/v1/instagram/callback') {
    return helpers.error('any.invalid');
  }
  return value;
}

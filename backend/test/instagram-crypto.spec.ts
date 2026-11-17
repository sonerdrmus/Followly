import { validationSchema } from '../src/config/validation.schema';
import { decryptToken, encryptToken } from '../src/instagram/instagram-crypto';

const keyA = Buffer.alloc(32, 3);
const keyB = Buffer.alloc(32, 9);

describe('Instagram token encryption', () => {
  it('round-trips a token and uses a fresh nonce', () => {
    const first = encryptToken('ig-token-one', keyA);
    const second = encryptToken('ig-token-one', keyA);

    expect(first).not.toBe(second);
    expect(first).not.toContain('ig-token-one');
    expect(decryptToken(first, [keyA])).toBe('ig-token-one');
  });

  it('decrypts with the previous key and rejects a wrong key', () => {
    const payload = encryptToken('ig-token-two', keyA);

    expect(decryptToken(payload, [keyB, keyA])).toBe('ig-token-two');
    expect(() => decryptToken(payload, [keyB])).toThrow('could not be decrypted');
  });

  it('rejects an encryption key that is not 32 bytes', () => {
    expect(() => encryptToken('ig-token-three', Buffer.alloc(16, 1))).toThrow('32 bytes');
  });
});

describe('Instagram configuration', () => {
  const base = {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://followly:followly_dev_only@localhost:5432/followly_test?schema=public',
    REDIS_URL: 'redis://localhost:6379/1',
    JWT_ACCESS_SECRET: 'test-only-access-secret-not-for-production-use',
    META_INSTAGRAM_REDIRECT_URI: 'http://localhost:3000/api/v1/instagram/callback',
    META_TOKEN_ENCRYPTION_KEY: keyA.toString('base64'),
  };

  it('rejects a token key copied from the JWT secret', () => {
    const shared = keyA.toString('base64');
    const result = validationSchema.validate({
      ...base,
      JWT_ACCESS_SECRET: shared,
      META_TOKEN_ENCRYPTION_KEY: shared,
    });

    expect(result.error).toBeDefined();
  });

  it('rejects publishing, messaging, and comment permissions', () => {
    const result = validationSchema.validate({
      ...base,
      META_INSTAGRAM_SCOPES: 'instagram_business_basic,instagram_business_content_publish',
    });

    expect(result.error).toBeDefined();
  });

  it('rejects a redirect URI that is not the Instagram callback', () => {
    const result = validationSchema.validate({
      ...base,
      META_INSTAGRAM_REDIRECT_URI: 'https://example.com/steal',
    });

    expect(result.error).toBeDefined();
  });
});

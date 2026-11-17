import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const VERSION = 'v1';

export function assertAesKey(key: Buffer): void {
  if (key.length !== 32) {
    throw new Error('Instagram token encryption key must be 32 bytes.');
  }
}

export function encryptToken(plaintext: string, key: Buffer): string {
  assertAesKey(key);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

export function decryptToken(payload: string, keys: readonly Buffer[]): string {
  const parts = payload.split('.');
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error('Instagram token payload is not a supported encoding.');
  }
  const iv = Buffer.from(parts[1] ?? '', 'base64url');
  const tag = Buffer.from(parts[2] ?? '', 'base64url');
  const ciphertext = Buffer.from(parts[3] ?? '', 'base64url');
  if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) {
    throw new Error('Instagram token payload is incomplete.');
  }

  for (const key of keys) {
    assertAesKey(key);
    try {
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    } catch {
      // Try the previous key. Authentication failure must not reveal the token.
    }
  }

  throw new Error('Instagram token could not be decrypted.');
}

export function decodeAesKey(value: string): Buffer {
  const key = Buffer.from(value, 'base64');
  assertAesKey(key);
  return key;
}

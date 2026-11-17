import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { decryptToken, encryptToken, decodeAesKey } from './instagram-crypto';

@Injectable()
export class InstagramCryptoService {
  private readonly keys: Buffer[];

  constructor(config: ConfigService) {
    const current = decodeAesKey(config.getOrThrow<string>('instagram.encryptionKey'));
    const previous = config.get<string | null>('instagram.previousEncryptionKey');
    this.keys = previous ? [current, decodeAesKey(previous)] : [current];
  }

  encrypt(plaintext: string): string {
    const key = this.keys[0];
    if (!key) {
      throw new Error('Instagram token encryption key is missing.');
    }
    return encryptToken(plaintext, key);
  }

  decrypt(payload: string): string {
    return decryptToken(payload, this.keys);
  }
}

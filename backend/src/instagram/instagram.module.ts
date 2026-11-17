import { Module } from '@nestjs/common';

import { InstagramAccountsService } from './instagram-accounts.service';
import { InstagramCryptoService } from './instagram-crypto.service';
import { InstagramOAuthService } from './instagram-oauth.service';
import { InstagramTokenService } from './instagram-token.service';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { MetaInstagramClient } from './meta-instagram.client';

@Module({
  controllers: [InstagramController],
  providers: [
    InstagramService,
    InstagramOAuthService,
    InstagramAccountsService,
    InstagramTokenService,
    InstagramCryptoService,
    MetaInstagramClient,
  ],
})
export class InstagramModule {}

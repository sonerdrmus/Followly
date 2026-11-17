import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { toPublicUser } from '../../users/users.presenter';
import { UsersService } from '../../users/users.service';
import type { PublicUser } from '../../users/users.types';

type AccessPayload = {
  sub?: string;
  email?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: AccessPayload): Promise<PublicUser> {
    if (!payload.sub) {
      throw new UnauthorizedException({
        message: 'Authentication is required.',
        code: 'UNAUTHORIZED',
      });
    }

    const user = await this.users.findById(payload.sub);
    if (!user?.isActive) {
      throw new UnauthorizedException({
        message: 'Authentication is required.',
        code: 'UNAUTHORIZED',
      });
    }

    return toPublicUser(user);
  }
}

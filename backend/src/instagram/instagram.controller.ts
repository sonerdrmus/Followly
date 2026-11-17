import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { PublicUser } from '../users/users.types';
import { InstagramService } from './instagram.service';

const instagramThrottleLimit = Number(process.env.INSTAGRAM_THROTTLE_LIMIT ?? 30);
const instagramThrottleTtl = Number(process.env.THROTTLE_TTL ?? 60) * 1000;

@ApiTags('instagram')
@Controller('instagram')
@Throttle({ default: { limit: instagramThrottleLimit, ttl: instagramThrottleTtl } })
export class InstagramController {
  constructor(private readonly instagram: InstagramService) {}

  @Get('connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Start Instagram Login for the authenticated Followly user' })
  begin(@CurrentUser() user: PublicUser) {
    return this.instagram.begin(user.id);
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Instagram Login redirect. Requires the single-use state, not a bearer token.',
  })
  async callback(@Req() request: Request, @Res() response: Response): Promise<void> {
    const location = await this.instagram.complete(request.query);
    response.redirect(302, location);
  }

  @Get('accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Instagram accounts saved for the authenticated user' })
  list(@CurrentUser() user: PublicUser) {
    return this.instagram.list(user.id);
  }

  @Get('accounts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'One Instagram account owned by the authenticated user' })
  get(@CurrentUser() user: PublicUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.instagram.get(user.id, id);
  }

  @Post('accounts/:id/disconnect')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Disconnect an Instagram account without signing out of Followly' })
  disconnect(@CurrentUser() user: PublicUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.instagram.disconnect(user.id, id);
  }

  @Post('accounts/:id/sync-profile')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Refresh the stored professional profile from Instagram' })
  sync(@CurrentUser() user: PublicUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.instagram.syncProfile(user.id, id);
  }
}

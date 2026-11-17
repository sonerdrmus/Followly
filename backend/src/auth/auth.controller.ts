import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PublicUserDto } from '../users/dto/public-user.dto';
import type { PublicUser } from '../users/users.types';
import { AuthService } from './auth.service';
import { AuthSessionDto } from './dto/auth-session.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

const authThrottleLimit = Number(process.env.AUTH_THROTTLE_LIMIT ?? 8);
const authThrottleTtl = Number(process.env.THROTTLE_TTL ?? 60) * 1000;

@ApiTags('auth')
@Controller('auth')
@Throttle({ default: { limit: authThrottleLimit, ttl: authThrottleTtl } })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create an account' })
  @ApiOkResponse({ description: 'The new user. No password hash is returned.' })
  async register(
    @Body() body: RegisterDto,
  ): Promise<{ success: true; data: PublicUserDto; message: string }> {
    const user = await this.auth.register(body);
    return { success: true, data: user, message: 'Account created' };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiOkResponse({ description: 'Access token, refresh token, and the user profile.' })
  async login(
    @Body() body: LoginDto,
  ): Promise<{ success: true; data: AuthSessionDto; message: string }> {
    const session = await this.auth.login(body.email, body.password);
    return { success: true, data: session, message: 'Logged in' };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate a refresh token' })
  @ApiOkResponse({ description: 'A new access token and a new refresh token.' })
  async refresh(
    @Body() body: RefreshTokenDto,
  ): Promise<{ success: true; data: AuthSessionDto; message: string }> {
    const session = await this.auth.refresh(body.refreshToken);
    return { success: true, data: session, message: 'Token refreshed' };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revoke a refresh token' })
  async logout(
    @Body() body: RefreshTokenDto,
  ): Promise<{ success: true; data: { revoked: true }; message: string }> {
    await this.auth.logout(body.refreshToken);
    return { success: true, data: { revoked: true }, message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Current authenticated user' })
  me(@CurrentUser() user: PublicUser): { success: true; data: PublicUserDto; message: string } {
    return { success: true, data: user, message: 'Current user' };
  }
}

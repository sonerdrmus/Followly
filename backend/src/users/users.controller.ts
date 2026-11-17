import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PublicUserDto } from './dto/public-user.dto';
import type { PublicUser } from './users.types';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Current user profile' })
  @ApiOkResponse({ description: 'The authenticated user, without secrets.' })
  me(@CurrentUser() user: PublicUser): { success: true; data: PublicUserDto; message: string } {
    return {
      success: true,
      data: user,
      message: 'Current user',
    };
  }
}

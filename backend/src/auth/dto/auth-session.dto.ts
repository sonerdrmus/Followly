import { ApiProperty } from '@nestjs/swagger';

import { PublicUserDto } from '../../users/dto/public-user.dto';

export class AuthSessionDto {
  @ApiProperty({ type: PublicUserDto })
  user!: PublicUserDto;

  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ description: 'Shown once. Only its hash is stored.' })
  refreshToken!: string;

  @ApiProperty({ description: 'Access token lifetime in seconds.' })
  accessTokenExpiresIn!: number;
}

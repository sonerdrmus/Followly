import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The current refresh token. It is rotated or revoked by this call.' })
  @IsString()
  @MinLength(20)
  @MaxLength(512)
  refreshToken!: string;
}

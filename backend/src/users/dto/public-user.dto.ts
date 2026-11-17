import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'person@example.com' })
  email!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  displayName!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  emailVerifiedAt!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

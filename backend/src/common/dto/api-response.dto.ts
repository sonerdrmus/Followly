import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ example: 'A user-friendly error message' })
  message!: string;

  @ApiProperty({ example: 'ERROR_CODE' })
  code!: string;

  @ApiPropertyOptional()
  data?: unknown;
}

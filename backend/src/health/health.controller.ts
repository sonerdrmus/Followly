import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'API, database, and Redis status' })
  @ApiOkResponse({ description: 'Dependency status. No credentials are included.' })
  async check(@Res({ passthrough: true }) response: Response) {
    const report = await this.health.report();
    if (report.status !== 'ok') {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        success: false,
        message: 'One or more dependencies are unavailable.',
        code: 'SERVICE_UNAVAILABLE',
        data: report,
      };
    }

    return {
      success: true,
      data: report,
      message: 'Service is healthy',
    };
  }
}

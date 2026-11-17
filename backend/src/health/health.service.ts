import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';

export type DependencyStatus = 'up' | 'down';

export type HealthReport = {
  status: 'ok' | 'degraded';
  timestamp: string;
  database: DependencyStatus;
  redis: DependencyStatus;
};

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async report(): Promise<HealthReport> {
    const [database, redis] = await Promise.all([this.databaseStatus(), this.redis.ping()]);
    const databaseStatus: DependencyStatus = database ? 'up' : 'down';
    const redisStatus: DependencyStatus = redis ? 'up' : 'down';
    return {
      status: databaseStatus === 'up' && redisStatus === 'up' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      redis: redisStatus,
    };
  }

  private async databaseStatus(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

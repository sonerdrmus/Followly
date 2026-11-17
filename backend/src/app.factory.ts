import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { createValidationPipe } from './common/pipes/create-validation.pipe';

function isAllowedOrigin(
  origin: string | undefined,
  allowed: string[],
  nodeEnv: string | undefined,
): boolean {
  if (!origin || allowed.includes(origin)) {
    return true;
  }
  if (nodeEnv === 'production') {
    return false;
  }
  try {
    const url = new URL(origin);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    return local && (url.protocol === 'http:' || url.protocol === 'https:');
  } catch {
    return false;
  }
}

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: process.env.NODE_ENV === 'test' ? ['error'] : ['error', 'warn', 'log'],
  });
  const config = app.get(ConfigService);

  app.use(
    helmet({
      contentSecurityPolicy: config.get('nodeEnv') === 'production' ? undefined : false,
      // The Expo web app runs on a different localhost port than this API.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(json({ limit: '32kb' }));
  app.use(urlencoded({ extended: false, limit: '32kb' }));
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const allowed = config.getOrThrow<string[]>('corsOrigins');
      if (isAllowedOrigin(origin, allowed, config.get('nodeEnv'))) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  if (config.get('nodeEnv') !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Followly API')
        .setDescription('Authentication, Instagram account connection, and health endpoints.')
        .setVersion('1')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }

  return app;
}

export async function bootstrap(): Promise<void> {
  const app = await createApp();
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('port');
  await app.listen(port);
  Logger.log(`Followly API listening on port ${port}`, 'Bootstrap');
}

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

const DEFAULT_ENVS = {
  GLOBAL_PREFIX: 'api',
  CORS_ORIGIN: 'http://localhost:4200',
  PORT: 3000,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = process.env.GLOBAL_PREFIX || DEFAULT_ENVS.GLOBAL_PREFIX;
  const corsOrigin = process.env.CORS_ORIGIN || DEFAULT_ENVS.CORS_ORIGIN;
  const port = process.env.PORT || DEFAULT_ENVS.PORT;

  app.setGlobalPrefix(globalPrefix);
  app.enableCors({ origin: corsOrigin });
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();

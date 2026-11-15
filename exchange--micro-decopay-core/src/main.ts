import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('apiPrefix') || 'api/v1';
  const port = configService.get<number>('port') || 9017;

  app.setGlobalPrefix(apiPrefix);
  app.enableCors();
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(port);

  const { Logger } = await import('@nestjs/common');
  const logger = new Logger('Bootstrap');
  const mongoUri = process.env.MONGODB_URI;
  const redisUri = process.env.REDIS_URI || process.env.REDIS_URL;

  logger.log('══════════════════════════════════════════');
  logger.log('  MICRO-DECOPAY-CORE');
  logger.log('══════════════════════════════════════════');
  logger.log(`  Port:        ${port}`);
  logger.log(`  Prefix:      ${apiPrefix}`);
  logger.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`  MongoDB:     ${mongoUri ? '✅ configured' : '❌ NOT configured'}`);
  logger.log(`  Redis:       ${redisUri ? '✅ configured' : '❌ NOT configured'}`);
  logger.log('══════════════════════════════════════════');
}

bootstrap();
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.use(helmet());

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS: controlado por variable de entorno
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin) {
    const origins = corsOrigin === '*' ? true : corsOrigin.split(',').map(o => o.trim());
    app.enableCors({ origin: origins, credentials: true });
  } else if (process.env.NODE_ENV !== 'production') {
    app.enableCors({ origin: true, credentials: true });
  }

  app.enableShutdownHooks();

  const port = Number(process.env.PORT || 3006);
  await app.listen(port);

  const mongoUri = process.env.MONGODB_URI;
  const redisUri = process.env.REDIS_URI;

  logger.log('══════════════════════════════════════════');
  logger.log('  MICRO-INTERNAL-TRANSFERS');
  logger.log('══════════════════════════════════════════');
  logger.log(`  Port:        ${port}`);
  logger.log(`  Prefix:      ${apiPrefix}`);
  logger.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`  MongoDB:     ${mongoUri ? '✅ configured' : '❌ NOT configured'}`);
  logger.log(`  Redis:       ${redisUri ? '✅ configured' : '❌ NOT configured'}`);
  logger.log('══════════════════════════════════════════');
}

void bootstrap();

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 9003;
  await app.listen(port);

  const mongoUri = process.env.MONGODB_URI;
  const redisHost = process.env.REDIS_HOST;

  logger.log('══════════════════════════════════════════');
  logger.log('  MICRO-CUSTODY-CRYPTO');
  logger.log('══════════════════════════════════════════');
  logger.log(`  Port:        ${port}`);
  logger.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`  MongoDB:     ${mongoUri ? '✅ configured' : '❌ NOT configured'}`);
  logger.log(`  Redis:       ${redisHost ? '✅ ' + redisHost : '❌ NOT configured'}`);
  logger.log('══════════════════════════════════════════');
}

void bootstrap();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() { 
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 9013;
  await app.listen(port);

  const { Logger } = await import('@nestjs/common');
  const logger = new Logger('Bootstrap');
  const mongoUri = process.env.MONGODB_URI;

  logger.log('══════════════════════════════════════════');
  logger.log('  MICRO-LOANS-CORE');
  logger.log('══════════════════════════════════════════');
  logger.log(`  Port:        ${port}`);
  logger.log(`  Prefix:      api/v1`);
  logger.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`  MongoDB:     ${mongoUri ? '✅ configured' : '❌ NOT configured'}`);
  logger.log('══════════════════════════════════════════');
}
bootstrap();
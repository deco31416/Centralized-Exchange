import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  app.enableShutdownHooks();

  const port = Number(process.env.PORT || 3007);
  await app.listen(port);

  logger.log(`micro-signature-keys running on port ${port}`);
  logger.log(`API prefix: ${apiPrefix}`);
  logger.log(`Endpoints:`);
  logger.log(`  POST /${apiPrefix}/signature        → crear firma (PIN)`);
  logger.log(`  POST /${apiPrefix}/signature/verify  → verificar firma`);
  logger.log(`  PUT  /${apiPrefix}/signature        → cambiar firma`);
  logger.log(`  GET  /${apiPrefix}/signature/status  → estado de firma`);
  logger.log(`  POST /${apiPrefix}/dynamic-key/enable  → activar clave dinámica`);
  logger.log(`  GET  /${apiPrefix}/dynamic-key/current → clave dinámica actual`);
  logger.log(`  POST /${apiPrefix}/dynamic-key/verify  → verificar clave dinámica`);
}

void bootstrap();

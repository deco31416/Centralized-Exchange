import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ? Number(process.env.PORT) : 7015;
  const nodeEnv = process.env.NODE_ENV || 'development';
  const internalAuthToken = process.env.INTERNAL_AUTH_TOKEN;
  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' && nodeEnv !== 'production';

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Micro Withdrawal Orchestrator')
      .setDescription('Orquestador de retiros fiat y crypto — BlackCEX Exchange')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      'docs',
      app,
      SwaggerModule.createDocument(app, config),
    );
  }

  await app.listen(port);

  logger.log('══════════════════════════════════════════');
  logger.log('🟢 [BLACKCEX] MICRO-WITHDRAWAL-ORCHESTRATOR starting...');
  logger.log('🟢 [BLACKCEX] Developed by Deco31416');
  logger.log(`🔵 [BLACKCEX] Environment: ${nodeEnv}`);
  logger.log(`🔵 [BLACKCEX] Port: ${port}`);
  logger.log(`🟢 [BLACKCEX] MongoDB: ${process.env.MONGODB_URI ? 'configured' : '⛔ missing'}`);
  logger.log('⚪ [BLACKCEX] Redis: not required');
  logger.log(`🟢 [BLACKCEX] Internal API guard: ${internalAuthToken ? 'configured' : '⛔ missing'}`);
  logger.log(`🟢 [BLACKCEX] Auth service: ${process.env.MICRO_AUTH_BASE_URL || process.env.AUTH_BASE_URL || '⛔ missing'}`);
  logger.log(`🟡 [BLACKCEX] Withdrawals policy fail mode: ${process.env.WITHDRAWALS_POLICY_FAIL_MODE || 'closed (default)'}`);
  logger.log(`${enableSwagger ? '🟠' : '⚪'} [BLACKCEX] Swagger: ${enableSwagger ? `enabled at http://localhost:${port}/docs` : 'disabled'}`);
  logger.log(`🟢 [BLACKCEX] MICRO-WITHDRAWAL-ORCHESTRATOR ${internalAuthToken ? 'operational (skeleton)' : 'degraded — missing INTERNAL_AUTH_TOKEN'}`);
  logger.log('══════════════════════════════════════════');
}

void bootstrap();

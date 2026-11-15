import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 9012;
  const nodeEnv = process.env.NODE_ENV || 'development';
  const internalAuthToken = process.env.INTERNAL_AUTH_TOKEN;
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true' && nodeEnv !== 'production';

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ── Swagger ────────────────────────────────────────────────────────────────
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Micro Movements Core')
      .setDescription('API de movimientos y transacciones — BlackCEX Exchange')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);

  // ── Logs de arranque ───────────────────────────────────────────────────────
  logger.log('══════════════════════════════════════════');
  logger.log('🟢 [BLACKCEX] MICRO-MOVEMENTS-CORE starting...');
  logger.log('🟢 [BLACKCEX] Developed by Deco31416');
  logger.log(`🔵 [BLACKCEX] Environment: ${nodeEnv}`);
  logger.log(`🔵 [BLACKCEX] Port: ${port}`);
  logger.log('🟢 [BLACKCEX] MongoDB: not required (stateless)');
  logger.log('🟢 [BLACKCEX] Redis: not required (stateless)');
  logger.log(`🟢 [BLACKCEX] Internal API guard: ${internalAuthToken ? 'configured' : '⛔ missing'}`);
  logger.log(`${enableSwagger ? '🟠' : '⚪'} [BLACKCEX] Swagger: ${enableSwagger ? `enabled at http://localhost:${port}/docs` : 'disabled'}`);
  logger.log(`🟢 [BLACKCEX] MICRO-MOVEMENTS-CORE ${internalAuthToken ? 'operational' : 'degraded — missing INTERNAL_AUTH_TOKEN'}`);
  logger.log('══════════════════════════════════════════');
}
bootstrap();

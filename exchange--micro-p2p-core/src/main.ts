import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('apiPrefix') || 'api/v1';
  const port = configService.get<number>('port') || 3021;
  const corsOrigins = configService.get<string>('corsOrigins') || '*';

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: corsOrigins === '*' ? '*' : corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('P2P Core — BlackCEX Exchange')
    .setDescription(
      'Marketplace P2P: anuncios, órdenes, escrow crypto, métodos de pago externos, mensajes, disputas y estadísticas.\n\n' +
      '**REGLA CRÍTICA:** El fiat interno del usuario NO se usa como pago P2P. ' +
      'Solo fiat externo (banco, transferencia, móvil money, efectivo).',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-internal-auth', in: 'header' }, 'x-internal-auth')
    .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'x-user-id')
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  app.enableShutdownHooks();
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log('══════════════════════════════════════════════════════');
  logger.log('       MICRO-P2P-CORE — BlackCEX Exchange');
  logger.log(`  Port    : ${port}`);
  logger.log(`  Prefix  : ${apiPrefix}`);
  logger.log(`  Swagger : http://localhost:${port}/api/docs`);
  logger.log(`  MongoDB : ${process.env.MONGODB_URI ? '✅' : '❌ NO CONFIGURADO'}`);
  logger.warn('  ⚠️  REGLA: fiat interno NO se usa como pago P2P');
  logger.warn('  ⚠️  P2P-ESCROW-INTEGRATION-001: escrow wallet-ledger pendiente');
  logger.log('══════════════════════════════════════════════════════');
}
bootstrap();

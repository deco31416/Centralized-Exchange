import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerEnabled = configService.get<boolean>('app.swaggerEnabled') ?? true;

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Exchange - Funding Core')
      .setDescription('Microservicio de fondeo listo para integrar APIs y BD reales')
      .setVersion('1.0.0')
      .addApiKey(
        { type: 'apiKey', name: 'x-internal-auth', in: 'header' },
        'x-internal-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('app.port') ?? 9016;
  await app.listen(port);

  const { Logger } = await import('@nestjs/common');
  const logger = new Logger('Bootstrap');

  logger.log('══════════════════════════════════════════');
  logger.log('  MICRO-FUNDING-CORE');
  logger.log('══════════════════════════════════════════');
  logger.log(`  Port:        ${port}`);
  logger.log(`  Prefix:      api/v1`);
  logger.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`  Type:        Stateless (no DB/Redis)`);
  logger.log(`  Swagger:     ${swaggerEnabled ? '/api/docs' : 'disabled'}`);
  logger.log('══════════════════════════════════════════');
}

bootstrap();
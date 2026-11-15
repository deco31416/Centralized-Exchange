import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'log', 'fatal'],
    bodyParser: true,
    httpsOptions: undefined,
  });

  const server = app.getHttpServer();
  server.maxHeadersCount = 100;

  const configService = app.get(ConfigService);

  const nodeEnv =
    configService.get<string>('NODE_ENV') ||
    process.env.NODE_ENV ||
    'development';

  if (nodeEnv !== 'production') {
    app.use(helmet());
  }

  const corsOrigins =
    configService.get<string[]>('config.corsOrigins') ||
    configService.get<string>('CORS_ORIGINS')?.split(',') ||
    [];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Internal-Auth',
      'X-Internal-Auth-Token',
      'X-Internal-Token',
      'X-Device-Id',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  const config = new DocumentBuilder()
    .setTitle('User API Gateway')
    .setDescription('DECO EXCHANGE - User API Gateway for end-user operations')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('user')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 8081;
  await app.listen(port);

  console.log(`🚀 User API Gateway running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  console.log(
    `[GATEWAY][CONFIG] Environment: ${configService.get<string>('config.nodeEnv')}`,
  );
  console.log(`[GATEWAY][CONFIG] Services:`, {
    auth: configService.get<string>('config.services.auth'),
    notifications: configService.get<string>('config.services.notifications'),
    walletLedger: configService.get<string>('config.services.wallet-ledger'),
    payments: configService.get<string>('config.services.payments'),
    internalTransfers: configService.get<string>(
      'config.services.internal-transfers',
    ),
    send: configService.get<string>('config.services.send'),
    movements: configService.get<string>('config.services.movements'),
    remittances: configService.get<string>('config.services.remittances'),
    savings: configService.get<string>('config.services.savings'),
    loans: configService.get<string>('config.services.loans'),
  });
  console.log(
    `[GATEWAY][CONFIG] Has INTERNAL_AUTH_TOKEN: ${!!configService.get<string>(
      'config.internalAuthToken',
    )} (length: ${configService.get<string>('config.internalAuthToken')?.length || 0
    })`,
  );
}

bootstrap();

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { AppModule } from './app.module';

type RequestWithHeaders = {
  method?: string;
  originalUrl?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseWithHooks = {
  statusCode?: number;
  setHeader(name: string, value: string): void;
  on(event: string, listener: () => void): void;
};

async function bootstrap() {
  const logger = new Logger('PointsDecoCore');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 9042;
  const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.use(
    (
      request: RequestWithHeaders,
      response: ResponseWithHooks,
      next: () => void,
    ) => {
      const startedAt = Date.now();
      const incomingRequestId =
        request.headers?.['x-request-id'] ||
        request.headers?.['x-correlation-id'];
      const requestId = Array.isArray(incomingRequestId)
        ? incomingRequestId[0]
        : incomingRequestId || randomUUID();

      response.setHeader('x-request-id', requestId);
      response.on('finish', () => {
        logger.log(
          JSON.stringify({
            event: 'http_request',
            requestId,
            method: request.method,
            path: request.originalUrl || request.url,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          }),
        );
      });

      next();
    },
  );

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DECO EXCHANGE - Puntos Deco Core')
      .setDescription(
        'Internal API for Puntos Deco: verified cash points, orders, disputes and reports.',
      )
      .setVersion('0.1.2')
      .addBearerAuth()
      .addApiKey(
        { type: 'apiKey', name: 'x-internal-auth', in: 'header' },
        'internal-auth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('developer/docs', app, document, {
      jsonDocumentUrl: 'developer/docs-json',
    });
    logger.log('developer docs enabled at /developer/docs');
  }

  await app.listen(port);
  logger.log(`listening on :${port} with prefix /api/v1 (${nodeEnv})`);
}

void bootstrap();

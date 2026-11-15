import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.use(helmet());

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // CORS
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin) {
    const origins =
      corsOrigin === '*'
        ? true
        : corsOrigin.split(',').map((o) => o.trim());
    app.enableCors({ origin: origins, credentials: true });
  } else if (process.env.NODE_ENV !== 'production') {
    app.enableCors({ origin: true, credentials: true });
  }

  app.enableShutdownHooks();

  const port = Number(process.env.PORT || 3020);
  await app.listen(port);

  logger.log(`micro-p2p-tunnel running on port ${port}`);
  logger.log(`WebSocket namespace: /tunnel`);
  logger.log(`API prefix: ${apiPrefix}`);
  logger.log(`Health: http://localhost:${port}/${apiPrefix}/health`);
}

void bootstrap();

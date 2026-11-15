import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

    // CORS: controlado por variable de entorno
    const corsOrigin = process.env.CORS_ORIGIN;
    if (corsOrigin) {
        const origins = corsOrigin === '*' ? true : corsOrigin.split(',').map(o => o.trim());
        app.enableCors({ origin: origins, credentials: true });
    } else if (process.env.NODE_ENV !== 'production') {
        app.enableCors({ origin: true, credentials: true });
    }

    const port = process.env.PORT || 3013;
    await app.listen(port);

    const { Logger } = await import('@nestjs/common');
    const logger = new Logger('Bootstrap');
    const mongoUri = process.env.MONGODB_URI;
    const redisUri = process.env.REDIS_URI;

    logger.log('══════════════════════════════════════════');
    logger.log('  MICRO-PRICING-FEE-AGGREGATOR');
    logger.log('══════════════════════════════════════════');
    logger.log(`  Port:        ${port}`);
    logger.log(`  Prefix:      api/v1`);
    logger.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`  MongoDB:     ${mongoUri ? '✅ configured' : '❌ NOT configured'}`);
    logger.log(`  Redis:       ${redisUri ? '✅ configured' : '❌ NOT configured'}`);
    logger.log('══════════════════════════════════════════');
}

bootstrap();

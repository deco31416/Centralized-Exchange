import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, ConsoleLogger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

// ─── Read version from package.json at build time ────────────
const pkg = JSON.parse(
    readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const APP_VERSION: string = pkg.version || '0.0.0';

/** Silences the verbose RouterExplorer / RoutesResolver / InstanceLoader logs */
class CleanLogger extends ConsoleLogger {
    private static readonly MUTED = new Set([
        'RouterExplorer',
        'RoutesResolver',
        'InstanceLoader',
    ]);

    log(message: unknown, context?: string) {
        if (context && CleanLogger.MUTED.has(context)) return;
        super.log(message, context);
    }
}

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule, {
        logger: new CleanLogger(),
    });

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    // ─── CORS ────────────────────────────────────────────────────
    const corsOrigin = process.env.CORS_ORIGIN;
    app.enableCors(corsOrigin ? {
        origin: corsOrigin.split(',').map(o => o.trim()),
        credentials: true,
    } : undefined); // undefined = allow all (dev mode)

    // ─── Swagger / OpenAPI ───────────────────────────────────────
    const appName      = process.env.APP_NAME || 'DECO EXCHANGE';
    const swaggerDesc  = process.env.SWAGGER_DESCRIPTION
        || 'Microservicio de precios fiat con agregación multi-source, motor de entropía, bandas de precio (admin/auto), deltas por corredor, y sistema de alertas tipo semáforo.';
    const contactUrl   = process.env.CONTACT_URL || 'https://exchange.example.invalid';
    const contactEmail = process.env.CONTACT_EMAIL || 'contact@example.invalid';
    const licenseName  = process.env.LICENSE_NAME || 'MIT';
    const licenseUrl   = process.env.LICENSE_URL || 'https://opensource.org/licenses/MIT';

    const swaggerConfig = new DocumentBuilder()
        .setTitle(`${appName} — Fiat Pricing`)
        .setDescription(
            `${swaggerDesc}\n\n` +
            '**Autenticación**: Header `x-internal-auth` requerido en todos los endpoints internos.',
        )
        .setVersion(APP_VERSION)
        .addApiKey({ type: 'apiKey', name: 'x-internal-auth', in: 'header' }, 'x-internal-auth')
        .setContact(appName, contactUrl, contactEmail)
        .setLicense(licenseName, licenseUrl)
        .addServer(`http://localhost:${process.env.PORT || 3014}/api/v1`, 'Local Development')
        .addTag('Health', 'Health check endpoints')
        .addTag('Pricing', 'Core pricing engine — multi-source fiat rate aggregation, quotes, configurations')
        .addTag('Price Bands', 'Spread management — MANUAL/AUTO mode, entropy engine, traffic-light alerts')
        .addTag('Network Deltas', 'Corridor cost adjustments — manual deltas, emergency controls')
        .addTag('API Usage', 'API call tracking — rate limits, smart cron, usage history')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: `${appName} — Fiat Pricing API`,
        customfavIcon: 'https://nestjs.com/img/logo-small.svg',
        swaggerOptions: {
            persistAuthorization: true,
            filter: true,
            showRequestDuration: true,
        },
    });

    const port = process.env.PORT || 3014;
    await app.listen(port);

    // ─── Startup Banner ──────────────────────────────────────────
    logger.log('');
    logger.log('╔══════════════════════════════════════════════════════════════╗');
    logger.log('║                                                              ║');
    logger.log('║   ████████╗ ██╗    ██╗ ██╗ ███╗   ██╗                        ║');
    logger.log('║   ╚══██╔══╝ ██║    ██║ ██║ ████╗  ██║                        ║');
    logger.log('║      ██║    ██║ █╗ ██║ ██║ ██╔██╗ ██║                        ║');
    logger.log('║      ██║    ██║███╗██║ ██║ ██║╚██╗██║                        ║');
    logger.log('║      ██║    ╚███╔███╔╝ ██║ ██║ ╚████║                        ║');
    logger.log('║      ╚═╝     ╚══╝╚══╝  ╚═╝ ╚═╝  ╚═══╝                       ║');
    logger.log('║                                                              ║');
    logger.log(`║       Fiat Pricing Microservice ${APP_VERSION.padEnd(24)}║`);
    logger.log('║                                                              ║');
    logger.log('╚══════════════════════════════════════════════════════════════╝');
    logger.log('');
    logger.log(`🚀 Server:    http://localhost:${port}/api/v1`);
    logger.log(`📚 Swagger:   http://localhost:${port}/api/docs`);
    logger.log(`💊 Health:    http://localhost:${port}/api/v1/health`);
    if ((process.env.NODE_ENV || 'development') !== 'production') {
        logger.log(`📈 Dashboard: http://localhost:${port}/api/v1/dashboard`);
    }
    logger.log(`🌍 Env:       ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🔐 Auth:      x-internal-auth header ${process.env.INTERNAL_AUTH_TOKEN ? '(configured)' : '(disabled — dev mode)'}`);
    logger.log('');
}

bootstrap();

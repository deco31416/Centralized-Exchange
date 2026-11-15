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
        || 'Microservicio de pricing para tokens de launchpad: gestión de tokens custom, sistema de peg (fiat/crypto), motor de simulación algorítmica, entropía interna, bandas de precio y alertas semáforo.';
    const contactUrl   = process.env.CONTACT_URL || 'https://DECOEXCHANGE.com';
    const contactEmail = process.env.CONTACT_EMAIL || 'contact@example.invalid';
    const licenseName  = process.env.LICENSE_NAME || 'MIT';
    const licenseUrl   = process.env.LICENSE_URL || 'https://opensource.org/licenses/MIT';

    const swaggerConfig = new DocumentBuilder()
        .setTitle(`${appName} — Launchpad Pricing`)
        .setDescription(
            `${swaggerDesc}\n\n` +
            '**Modelos de pricing**: MANUAL, PEGGED, INTERNAL, SIMULATED\n\n' +
            '**Autenticación**: Header `x-internal-auth` requerido en todos los endpoints internos.',
        )
        .setVersion(APP_VERSION)
        .addApiKey({ type: 'apiKey', name: 'x-internal-auth', in: 'header' }, 'x-internal-auth')
        .setContact(appName, contactUrl, contactEmail)
        .setLicense(licenseName, licenseUrl)
        .addServer(`http://localhost:${process.env.PORT || 3016}/api/v1`, 'Local Development')
        .addTag('Health', 'Health check endpoints')
        .addTag('Custom Tokens', 'Token management — CRUD, price updates, peg sync, simulation control')
        .addTag('Pricing', 'Quote pipeline — base price + delta + spread → final BUY/SELL price')
        .addTag('Price Bands', 'Spread management — MANUAL/AUTO mode, entropy engine, traffic-light alerts')
        .addTag('Network Deltas', 'Network cost adjustments — manual deltas, emergency controls')
        .addTag('API Usage', 'API call tracking — peg sync rate limits, usage history')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: `${appName} — Launchpad Pricing API`,
        customfavIcon: 'https://nestjs.com/img/logo-small.svg',
        swaggerOptions: {
            persistAuthorization: true,
            filter: true,
            showRequestDuration: true,
        },
    });

    const port = process.env.PORT || 3016;
    await app.listen(port);

    // ─── Startup Banner ──────────────────────────────────────────
    logger.log('');
    logger.log('╔══════════════════════════════════════════════════════════════╗');
    logger.log('║                                                              ║');
    logger.log('║   ██╗      █████╗ ██╗   ██╗███╗   ██╗ ██████╗██╗  ██╗       ║');
    logger.log('║   ██║     ██╔══██╗██║   ██║████╗  ██║██╔════╝██║  ██║       ║');
    logger.log('║   ██║     ███████║██║   ██║██╔██╗ ██║██║     ███████║       ║');
    logger.log('║   ██║     ██╔══██║██║   ██║██║╚██╗██║██║     ██╔══██║       ║');
    logger.log('║   ███████╗██║  ██║╚██████╔╝██║ ╚████║╚██████╗██║  ██║       ║');
    logger.log('║   ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝       ║');
    logger.log('║                                                              ║');
    logger.log(`║       Launchpad Pricing Microservice ${APP_VERSION.padEnd(22)}║`);
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

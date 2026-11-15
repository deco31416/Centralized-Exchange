import { readSentryStatus } from './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function securityHeadersMiddleware(
  _req: unknown,
  res: { setHeader: (name: string, value: string) => void },
  next: () => void,
) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()',
  );
  next();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Enable CORS (configurable for production)
  const corsOriginRaw = config.get<string>('CORS_ORIGIN');
  const corsOrigins = corsOriginRaw
    ? corsOriginRaw.split(',').map((o: string) => o.trim()).filter(Boolean)
    : [];

  assertSafeCorsOrigins(corsOrigins);
  app.use(securityHeadersMiddleware);

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : process.env.NODE_ENV !== 'production',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Signature',
      'X-Timestamp',
      'X-Correlation-Id',
    ],
    exposedHeaders: ['x-correlation-id'],
    credentials: true,
  });

  // HTTPS redirect middleware (production only)
  const httpsRedirectEnabled = config.get<string>('HTTPS_REDIRECT_ENABLED') === 'true';
  if (httpsRedirectEnabled) {
    app.use((req: any, res: any, next: () => void) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, 'https://' + req.headers.host + req.url);
      }
      next();
    });
  }
  // Set unified API prefix for all routes
  app.setGlobalPrefix('api/v1');
  
  const swaggerEnabled =
    process.env.NODE_ENV !== 'production' &&
    config.get<string>('ENABLE_SWAGGER') !== 'false';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('User Notifications Microservice API')
      .setDescription('Email and SMS notification service for end users with queue management')
      .setVersion('0.0.2')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Service Token',
          description: 'Service-to-service authentication token',
        },
        'service-token',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-Signature',
          in: 'header',
          description: 'HMAC signature for request validation',
        },
        'hmac-signature',
      )
      .addTag('notifications', 'Send email and SMS notifications')
      .addTag('health', 'Health check endpoints')
      .addTag('queue', 'Queue status and monitoring')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Notifications API Docs',
    });
  }
  
  const port = Number(process.env.PORT ?? config.get<number>('port') ?? 7002);
  await app.listen(port);

  // Decorative startup logs
  const redisUri = config.get('redis.uri');
  const redisStatus = redisUri ? '✅ Connected' : '❌ Not configured';
  
  console.log('\n' + '='.repeat(70));
  console.log('🔔 DECO31416 ADMIN NOTIFICATIONS MICROSERVICE');
  console.log('='.repeat(70));
  console.log(`[OK] Server running on: http://localhost:${port}`);
  console.log(`[OK] API prefix: /api/v1`);
  console.log(`[INFO] Swagger docs: ${swaggerEnabled ? `http://localhost:${port}/api/docs` : 'disabled'}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[INFO] Version: ${require('../package.json').version}`);
  console.log(
    `[INFO] Sentry fallback: ${
      readSentryStatus() === 'enabled' ? 'enabled' : 'disabled (SENTRY_DSN empty)'
    }`,
  );
  console.log('');
  console.log('📧 PROVIDERS:');
  console.log('   • Email: Resend (Primary)');
  console.log('   • SMS: Twilio (Optional)');
  console.log('');
  console.log('🔗 ENDPOINTS:');
  console.log('   • POST   /api/v1/notifications/email');
  console.log('   • POST   /api/v1/notifications/sms');
  console.log('   • GET    /api/v1/notifications/queues/stats');
  console.log('   • GET    /api/v1/notifications/jobs/:queue/:jobId/status');
  console.log('   • GET    /api/v1/health');
  console.log('   • GET    /api/v1/ping');
  console.log('');
  console.log('🔒 SECURITY:');
  console.log('   • Service-to-Service Authentication (Bearer Token)');
  console.log('   • HMAC Signature Validation');
  console.log(`   • CORS: ${corsOrigins.length > 0 ? 'Allowlist' : 'Development Mode'}`);
  console.log('   • Rate Limiting: Enabled');
  console.log('');
  console.log('🗄️  INFRASTRUCTURE:');
  console.log(`   • Redis: ${redisStatus}`);
  console.log('   • Bull Queue: Email + SMS workers');
  console.log('   • Template Engine: Handlebars');
  console.log('='.repeat(70));
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[WARNING] Running in development mode');
    console.log('[WARNING] Set NODE_ENV=production for production deployment');
    console.log('='.repeat(70));
  }
  
  console.log('');
}
bootstrap();

function assertSafeCorsOrigins(origins: string[]) {
  if (process.env.NODE_ENV === 'production' && origins.length === 0) {
    throw new Error('CORS_ORIGIN must be configured in production.');
  }
  for (const origin of origins) {
    let url: URL;
    try {
      url = new URL(origin);
    } catch {
      throw new Error('CORS_ORIGIN contains an invalid origin.');
    }
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('CORS_ORIGIN must contain origins only.');
    }
    if (process.env.NODE_ENV === 'production') {
      if (url.protocol !== 'https:') {
        throw new Error('CORS_ORIGIN production origins must use HTTPS.');
      }
      if (isLocalOrPrivateHost(url.hostname)) {
        throw new Error('CORS_ORIGIN production origins cannot be local/private.');
      }
    }
  }
}

function isLocalOrPrivateHost(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

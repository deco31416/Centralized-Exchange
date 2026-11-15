import { readSentryStatus } from './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

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

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS with strict configuration
  const corsOriginRaw = configService.get<string>('CORS_ORIGIN');
  const corsOriginList = (corsOriginRaw || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  assertSafeCorsOrigins(corsOriginList);

  app.use(securityHeadersMiddleware);

  app.enableCors({
    origin:
      corsOriginList.length > 1
        ? corsOriginList
        : corsOriginList.length === 1
          ? corsOriginList[0]
          : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
  });

  // HTTPS redirect middleware (production only)
  const httpsRedirectEnabled = configService.get<string>('HTTPS_REDIRECT_ENABLED') === 'true';
  if (httpsRedirectEnabled) {
    app.use((req: any, res: any, next: () => void) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, 'https://' + req.headers.host + req.url);
      }
      next();
    });
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((e) =>
          Object.values(e.constraints || {}),
        );
        return new BadRequestException(messages);
      },
    }),
  );

  // Cookie parser for refresh tokens
  app.use(cookieParser());

  // JSON body parser (MUST BE BEFORE logging and routes)
  app.use(require('express').json());
  app.use(require('express').urlencoded({ extended: true }));

  // Request logging middleware (MUST BE BEFORE ROUTES)
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      console.log(
        `[HTTP] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${Date.now() - startedAt}ms`,
      );
    });
    next();
  });

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger is development-only by default.
  const swaggerEnabled =
    process.env.NODE_ENV !== 'production' &&
    configService.get<string>('ENABLE_SWAGGER') !== 'false';
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DECO31416 Admin Auth API')
      .setDescription('Administrative authentication service for DECO31416 with OTP 2FA')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refreshToken')
      .addTag('auth', 'Authentication endpoints (legacy)')
      .addTag('auth-v2', 'Step-based authentication with OTP')
      .addTag('oauth', 'OAuth 2.0 / OpenID Connect')
      .addTag('security', 'Session and device management')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Auth API Docs',
    });
  }

  const port = configService.get<number>('PORT') || 7001;
  await app.listen(port);

  // Decorative startup logs
  const otpEnabled = configService.get<boolean>('LOGIN_OTP_ENABLED');
  const redisUri = configService.get<string>('REDIS_URI');
  const mongoUri = configService.get<string>('MONGODB_URI');
  const notifService = configService.get<string>('NOTIFICATIONS_SERVICE_URL');
  
  console.log('\n' + '='.repeat(70));
  console.log('🔐 DECO31416 ADMIN AUTH MICROSERVICE');
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
  console.log('🔗 ENDPOINTS:');
  console.log('   • POST   /api/v1/auth/v2/login');
  console.log('   • POST   /api/v1/auth/v2/register');
  console.log('   • POST   /api/v1/auth/v2/login/verify-otp');
  console.log('   • POST   /api/v1/auth/v2/register/verify-otp');
  console.log('   • POST   /api/v1/auth/v2/otp/resend');
  console.log('   • POST   /api/v1/auth/refresh');
  console.log('   • POST   /api/v1/auth/logout');
  console.log('   • GET    /api/v1/auth/v2/sessions');
  console.log('');
  console.log('🔒 SECURITY:');
  console.log('   • Password hashing: Argon2id (OWASP recommended)');
  console.log('   • JWT: Access + Refresh tokens');
  console.log('   • Refresh token: HttpOnly cookie');
  console.log(`   • OTP 2FA: ${otpEnabled ? '✅ ENABLED' : '❌ Disabled'}`);
  console.log('   • CORS: Configured');
  console.log('   • Validation: STRICT (whitelist + forbidNonWhitelisted)');
  console.log('');
  console.log('🗄️  INFRASTRUCTURE:');
  console.log(`   • MongoDB: ${mongoUri ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`   • Redis: ${redisUri ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`   • Notifications Service: ${notifService || 'Not configured'}`);
  console.log('='.repeat(70));
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[WARNING] Running in development mode');
    console.log('[WARNING] Set NODE_ENV=production for production deployment');
    console.log('='.repeat(70));
  }
  
  console.log('');
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

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

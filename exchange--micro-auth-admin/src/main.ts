import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS with strict configuration
  const corsOriginRaw = configService.get<string>('CORS_ORIGIN');
  const corsOriginList = (corsOriginRaw || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

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
        console.error('[ValidationPipe] Validation failed:', JSON.stringify(errors, null, 2));
        return new Error(`Validation failed: ${JSON.stringify(errors)}`);
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
    console.log(`\n[HTTP] ${req.method} ${req.url}`);
    console.log(`[HTTP] Headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`[HTTP] Body:`, JSON.stringify(req.body, null, 2));
    next();
  });

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Admin Auth Microservice API')
    .setDescription('Authentication and authorization service for administrators with OTP 2FA')
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
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  const port = configService.get<number>('PORT') || 7002;
  await app.listen(port);

  // Decorative startup logs
  const otpEnabled = configService.get<boolean>('LOGIN_OTP_ENABLED');
  const redisUri = configService.get<string>('REDIS_URI');
  const mongoUri = configService.get<string>('MONGODB_URI');
  const notifService = configService.get<string>('NOTIFICATIONS_SERVICE_URL');
  
  console.log('\n' + '='.repeat(70));
  console.log('🔐 AUTH ADMIN MICROSERVICE');
  console.log('='.repeat(70));
  console.log(`[OK] Server running on: http://localhost:${port}`);
  console.log(`[OK] API prefix: /api/v1`);
  console.log(`[INFO] Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[INFO] Version: ${require('../package.json').version}`);
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

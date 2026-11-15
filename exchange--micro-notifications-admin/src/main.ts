import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Enable CORS (configurable for production)
  const corsOriginRaw = config.get<string>('CORS_ORIGIN');
  const corsOrigins = corsOriginRaw
    ? corsOriginRaw.split(',').map((o: string) => o.trim()).filter(Boolean)
    : [];

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true, // true = dev mode (allow all)
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
  
  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Admin Notifications Microservice API')
    .setDescription('Email and SMS notification service for administrators with queue management')
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
  
  const port = Number(process.env.PORT ?? config.get<number>('port') ?? 7003);
  await app.listen(port);

  // Decorative startup logs
  const redisUri = config.get('redis.uri');
  const redisStatus = redisUri ? '✅ Connected' : '❌ Not configured';
  
  console.log('\n' + '='.repeat(70));
  console.log('🔔 NOTIFICATIONS MICROSERVICE');
  console.log('='.repeat(70));
  console.log(`[OK] Server running on: http://localhost:${port}`);
  console.log(`[OK] API prefix: /api/v1`);
  console.log(`[INFO] Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[INFO] Version: ${require('../package.json').version}`);
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
  console.log('   • CORS: Development Mode');
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

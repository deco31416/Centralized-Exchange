import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  // CORS: controlado por variable de entorno
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin) {
    // CORS_ORIGIN puede ser una URL o "*" o varias separadas por coma
    const origins = corsOrigin === '*' ? true : corsOrigin.split(',').map(o => o.trim());
    app.enableCors({ origin: origins, credentials: true });
  } else if (process.env.NODE_ENV !== 'production') {
    // Dev: permitir todo
    app.enableCors({ origin: true, credentials: true });
  }

  const port = Number(process.env.PORT || 9001);
  await app.listen(port);

  // Decorative startup logs
  const mongoUri = process.env.MONGODB_URI;
  const redisUri = process.env.REDIS_URI || process.env.REDIS_URL;
  const notifBaseUrl = process.env.NOTIFICATIONS_BASE_URL;
  const ipWhitelistEnabled = process.env.IP_WHITELIST_ENABLED === 'true';
  const httpsRedirectEnabled = process.env.HTTPS_REDIRECT_ENABLED === 'true';

  console.log('\n' + '='.repeat(70));
  console.log('💰 WALLET LEDGER CORE MICROSERVICE');
  console.log('='.repeat(70));
  console.log(`[OK] Server running on: http://localhost:${port}`);
  console.log(`[OK] API prefix: /${apiPrefix}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('🔗 INTERNAL ENDPOINTS (x-internal-auth required):');
  console.log('   • POST   /' + apiPrefix + '/internal/accounts/ensure/:userId');
  console.log('   • GET    /' + apiPrefix + '/internal/accounts/by-user/:userId');
  console.log('   • POST   /' + apiPrefix + '/internal/wallets/ensure');
  console.log('   • GET    /' + apiPrefix + '/internal/wallets/:accountId/:currency');
  console.log('   • POST   /' + apiPrefix + '/internal/ledger/fiat-deposit-confirmed');
  console.log('   • POST   /' + apiPrefix + '/internal/transfers/p2p/request-otp');
  console.log('   • POST   /' + apiPrefix + '/internal/transfers/p2p');
  console.log('   • GET    /' + apiPrefix + '/health');
  console.log('');
  console.log('🔒 SECURITY:');
  console.log('   • Internal Auth: x-internal-auth header (service-to-service)');
  console.log(`   • IP Whitelist: ${ipWhitelistEnabled ? '✅ ENABLED' : '❌ Disabled (dev mode)'}`);
  console.log(`   • HTTPS Redirect: ${httpsRedirectEnabled ? '✅ ENABLED' : '❌ Disabled (dev mode)'}`);
  console.log('   • OTP Verification: P2P transfers + Withdrawals');
  console.log('   • Idempotency: Transaction-level protection');
  console.log('');
  console.log('🗄️  INFRASTRUCTURE:');
  console.log(`   • MongoDB: ${mongoUri ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`   • Redis (OTP): ${redisUri ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`   • Bull Queue: Outbox pattern enabled`);
  console.log(`   • Notifications: ${notifBaseUrl || 'Not configured'}`);
  console.log('');
  console.log('💸 FEATURES:');
  console.log(`   • P2P Transfers: ${process.env.P2P_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   • Withdrawals: ${process.env.WITHDRAWALS_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   • OTP TTL: ${process.env.OTP_TTL_SECONDS || '300'}s`);
  console.log(`   • OTP Bypass: ${process.env.OTP_BYPASS_CODE ? '✅ Configured' : '❌ Not set'}`);
  console.log('='.repeat(70));

  if (process.env.NODE_ENV !== 'production') {
    console.log('[WARNING] Running in development mode');
    console.log('[WARNING] Set NODE_ENV=production for production deployment');
    console.log('='.repeat(70));
  }

  console.log('');
}

void bootstrap();

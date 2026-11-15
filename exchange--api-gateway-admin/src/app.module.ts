import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import configuration from './config/configuration';
import { ProxyModule } from './proxy/proxy.module';
import { PricingFeesModule } from './pricing/pricing-fees.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
        limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
      },
    ]),
    HttpModule.register({
      timeout: parseInt(process.env.API_TIMEOUT, 10) || 30000,
      maxRedirects: 5,
    }),
    ProxyModule,
    PricingFeesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

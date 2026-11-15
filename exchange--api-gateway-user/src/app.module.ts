import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import * as http from 'http';
import * as https from 'https';
import configuration from './config/configuration';
import { ProxyModule } from './proxy/proxy.module';
import { HealthController } from './health/health.controller';
import { FundingModule } from './modules/funding/funding.module';
import { PublicModule } from './modules/public/public.module';

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
        limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 50,
      },
    ]),
    HttpModule.register({
      timeout: parseInt(process.env.API_TIMEOUT, 10) || 30000,
      maxRedirects: 5,
      httpAgent: new http.Agent({
        keepAlive: true,
      }),
      httpsAgent: new https.Agent({
        keepAlive: true,
      }),
    }),
    ProxyModule,
    FundingModule,
    PublicModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

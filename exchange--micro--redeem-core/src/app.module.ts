import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';

import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { ConsumersModule } from './consumers/consumers.module';
import { RedeemModule } from './domain/redeem/redeem.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
    }),

    HttpModule,

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: configService.get<string>('redisUrl') || 'redis://localhost:6379',
      }),
    }),

    HealthModule,
    ConsumersModule,
    RedeemModule,
  ],
})
export class AppModule {}

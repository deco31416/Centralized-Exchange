import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';

import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { ConsumersModule } from './consumers/consumers.module';
import { DECOPAYModule } from './domain/decopay/decopay.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
    }),

    HttpModule,

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('mongodbUri') ||
          'mongodb://localhost:27017/DECOPAY-core',
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis:
          configService.get<string>('redisUrl') || 'redis://localhost:6379',
      }),
    }),

    HealthModule,
    ConsumersModule,
    DECOPAYModule,
  ],
})
export class AppModule {}

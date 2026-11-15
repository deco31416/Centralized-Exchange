import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { HealthModule } from './health/health.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { OutboxModule } from './outbox/outbox.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { PricingClientModule } from './shared/pricing/pricing-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ??
          configService.get<string>('MONGODB_URL') ??
          configService.get<string>('MONGO_URL'),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get<string>('REDIS_URL') ?? configService.get<string>('REDIS_URI'),
      }),
    }),
    HealthModule,
    IdempotencyModule,
    OutboxModule,
    AccountsModule,
    WalletsModule,
    LedgerModule,
    TransfersModule,
    PricingClientModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './health/health.module';
import { AdsModule } from './domain/ads/ads.module';
import { EscrowModule } from './domain/escrow/escrow.module';
import { OrdersModule } from './domain/orders/orders.module';
import { PaymentMethodsModule } from './domain/payment-methods/payment-methods.module';
import { PaymentMethodCatalogModule } from './domain/payment-method-catalog/payment-method-catalog.module';
import { MessagesModule } from './domain/messages/messages.module';
import { DisputesModule } from './domain/disputes/disputes.module';
import { TraderStatsModule } from './domain/trader-stats/trader-stats.module';
import { AdminP2PModule } from './admin/admin-p2p.module';
import { InternalP2PModule } from './internal/internal-p2p.module';
import { P2PAssetCatalogModule } from './domain/p2p-asset-catalog/p2p-asset-catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUri'),
      }),
    }),
    SharedModule,
    HealthModule,
    AdsModule,
    EscrowModule,
    OrdersModule,
    PaymentMethodsModule,
    PaymentMethodCatalogModule,
    MessagesModule,
    DisputesModule,
    TraderStatsModule,
    AdminP2PModule,
    InternalP2PModule,
    P2PAssetCatalogModule,
  ],
})
export class AppModule {}

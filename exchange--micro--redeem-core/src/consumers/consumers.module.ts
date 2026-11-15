import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthClientService } from './clients/auth-client.service';
import { NotificationsClientService } from './clients/notifications-client.service';
import { WalletLedgerClientService } from './clients/wallet-ledger-client.service';
import { PricingFeeAggregatorClientService } from './clients/pricing-fee-aggregator-client.service';
import { AssetRegistryClientService } from './clients/asset-registry-client.service';

@Module({
  imports: [HttpModule],
  providers: [
    AuthClientService,
    NotificationsClientService,
    WalletLedgerClientService,
    PricingFeeAggregatorClientService,
    AssetRegistryClientService,
  ],
  exports: [
    AuthClientService,
    NotificationsClientService,
    WalletLedgerClientService,
    PricingFeeAggregatorClientService,
    AssetRegistryClientService,
  ],
})
export class ConsumersModule {}
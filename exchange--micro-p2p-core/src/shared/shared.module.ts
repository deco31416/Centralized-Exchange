import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PricingClient } from './clients/pricing.client';
import { CryptoEscrowClient } from './clients/crypto-escrow.client';
import { NotificationClient } from './clients/notification.client';
import { FiatWalletSettlementClient } from './clients/fiat-wallet-settlement.client';
import { InternalAuthGuard } from './guards/internal-auth.guard';
import { UserContextGuard } from './guards/user-context.guard';
import { FieldEncryptionService } from './crypto/field-encryption.service';

@Module({
  imports: [HttpModule],
  providers: [
    PricingClient,
    CryptoEscrowClient,
    NotificationClient,
    FiatWalletSettlementClient,
    InternalAuthGuard,
    UserContextGuard,
    FieldEncryptionService,
  ],
  exports: [
    PricingClient,
    CryptoEscrowClient,
    NotificationClient,
    FiatWalletSettlementClient,
    InternalAuthGuard,
    UserContextGuard,
    HttpModule,
    FieldEncryptionService,
  ],
})
export class SharedModule {}

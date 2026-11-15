import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InternalAuthGuard } from '../../common/guards/internal-auth.guard';
import {
  CARD_VAULT_PORT,
  FUNDING_METHODS_PORT,
  PAYMENT_GATEWAY_PORT,
  WALLET_LEDGER_PORT,
} from './application/tokens';
import { ConfirmFundingUseCase } from './application/use-cases/confirm-funding.use-case';
import { CreateFundingIntentUseCase } from './application/use-cases/create-funding-intent.use-case';
import { GetFundingMethodsUseCase } from './application/use-cases/get-funding-methods.use-case';
import { GetSavedCardsUseCase } from './application/use-cases/get-saved-cards.use-case';
import { QuoteFundingUseCase } from './application/use-cases/quote-funding.use-case';
import { SaveCardUseCase } from './application/use-cases/save-card.use-case';
import { BlcDepositRequestsStore } from './infrastructure/adapters/blc-deposit-requests.store';
import { MockFundingMethodsAdapter } from './infrastructure/adapters/mock-funding-methods.adapter';
import { FundingController } from './infrastructure/controllers/funding.controller';
import { StripeCardVaultAdapter } from './infrastructure/adapters/stripe-card-vault.adapter';
import { StripePaymentGatewayAdapter } from './infrastructure/adapters/stripe-payment-gateway.adapter';
import { WalletLedgerAdapter } from './infrastructure/adapters/wallet-ledger.adapter';
import {
  FundingMethodSchemaClass,
  FundingMethodSchema,
} from './infrastructure/schemas/funding-method.schema';
import { MongoFundingMethodsRepository } from './infrastructure/repositories/mongo-funding-methods.repository';
import { FundingMethodsSeedService } from './infrastructure/services/funding-methods-seed.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    MongooseModule.forFeature([
      { name: FundingMethodSchemaClass.name, schema: FundingMethodSchema },
    ]),
  ],
  controllers: [FundingController],
  providers: [
    InternalAuthGuard,

    GetFundingMethodsUseCase,
    CreateFundingIntentUseCase,
    QuoteFundingUseCase,
    ConfirmFundingUseCase,
    SaveCardUseCase,
    GetSavedCardsUseCase,
    BlcDepositRequestsStore,

    // Mock adapter se mantiene solo para ser inyectado por el seed service
    MockFundingMethodsAdapter,
    MongoFundingMethodsRepository,
    FundingMethodsSeedService,

    {
      provide: FUNDING_METHODS_PORT,
      useClass: MongoFundingMethodsRepository,
    },
    {
      provide: PAYMENT_GATEWAY_PORT,
      useClass: StripePaymentGatewayAdapter,
    },
    {
      provide: WALLET_LEDGER_PORT,
      useClass: WalletLedgerAdapter,
    },
    {
      provide: CARD_VAULT_PORT,
      useClass: StripeCardVaultAdapter,
    },
  ],
})
export class FundingModule {}

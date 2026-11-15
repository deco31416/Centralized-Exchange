import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

import { Beneficiary, BeneficiarySchema } from './infrastructure/schemas/beneficiary.schema';
import { BeneficiaryService } from './infrastructure/services/beneficiary.service';
import { SendFacadeService } from './infrastructure/services/send-facade.service';
import { SendQueryService } from './infrastructure/services/send-query.service';
import { BaseHttpClientService } from './infrastructure/services/base-http-client.service';

import { QuoteDecoUseCase } from './application/use-cases/quote-deco.use-case';
import { ExecuteDecoUseCase } from './application/use-cases/execute-deco.use-case';
import { QuoteBankUseCase } from './application/use-cases/quote-bank.use-case';
import { ExecuteBankUseCase } from './application/use-cases/execute-bank.use-case';
import { QuoteSpeiUseCase } from './application/use-cases/quote-spei.use-case';
import { ExecuteSpeiUseCase } from './application/use-cases/execute-spei.use-case';
import { QuoteWalletUseCase } from './application/use-cases/quote-wallet.use-case';
import { ExecuteWalletUseCase } from './application/use-cases/execute-wallet.use-case';

import { AuthClient } from './infrastructure/clients/auth.client';
import { InternalTransfersClient } from './infrastructure/clients/internal-transfers.client';
import { CustodyFiatClient } from './infrastructure/clients/custody-fiat.client';
import { NotificationsClient } from './infrastructure/clients/notifications.client';
import { WalletLedgerClient } from './infrastructure/clients/wallet-ledger.client';

import {
  AUTH_PORT,
  CUSTODY_FIAT_PORT,
  INTERNAL_TRANSFERS_PORT,
  NOTIFICATIONS_PORT,
} from './application/ports/port-tokens';
import { SendController } from './infrastructure/controllers/send.controller';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Beneficiary.name, schema: BeneficiarySchema },
    ]),
  ],
  controllers: [SendController],
  providers: [
    BaseHttpClientService,
    BeneficiaryService,
    SendFacadeService,
    SendQueryService,
    WalletLedgerClient,

    QuoteDecoUseCase,
    ExecuteDecoUseCase,
    QuoteBankUseCase,
    ExecuteBankUseCase,
    QuoteSpeiUseCase,
    ExecuteSpeiUseCase,
    QuoteWalletUseCase,
    ExecuteWalletUseCase,

    AuthClient,
    InternalTransfersClient,
    CustodyFiatClient,
    NotificationsClient,

    {
      provide: AUTH_PORT,
      useExisting: AuthClient,
    },
    {
      provide: INTERNAL_TRANSFERS_PORT,
      useExisting: InternalTransfersClient,
    },
    {
      provide: CUSTODY_FIAT_PORT,
      useExisting: CustodyFiatClient,
    },
    {
      provide: NOTIFICATIONS_PORT,
      useExisting: NotificationsClient,
    },
  ],
  exports: [SendFacadeService],
})
export class SendModule {}
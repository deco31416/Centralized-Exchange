import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { CancelRemittanceUseCase } from './application/use-cases/cancel-remittance.use-case';
import { ConfirmRemittanceUseCase } from './application/use-cases/confirm-remittance.use-case';
import { CreateRemittanceUseCase } from './application/use-cases/create-remittance.use-case';
import { GetIncomingRemittancesUseCase } from './application/use-cases/get-incoming-remittances.use-case';
import { GetRemittanceByIdUseCase } from './application/use-cases/get-remittance-by-id.use-case';
import { GetRemittanceQuoteUseCase } from './application/use-cases/get-remittance-quote.use-case';
import { GetRemittanceSummaryUseCase } from './application/use-cases/get-remittance-summary.use-case';
import { GetUserRemittancesUseCase } from './application/use-cases/get-user-remittances.use-case';
import { ReceiveRemittanceUseCase } from './application/use-cases/receive-remittance.use-case';
import { SearchRecipientUseCase } from './application/use-cases/search-recipient.use-case';
import { SendRemittanceUseCase } from './application/use-cases/send-remittance.use-case';
import { UpdateRemittanceStatusUseCase } from './application/use-cases/update-remittance-status.use-case';
import { AUTH_CLIENT } from './domain/ports/auth-client.port';
import { NOTIFICATIONS_CLIENT } from './domain/ports/notifications-client.port';
import { PRICING_AGGREGATOR_CLIENT } from './domain/ports/pricing-aggregator-client.port';
import { REMITTANCE_REPOSITORY } from './domain/ports/remittance-repository.port';
import { WALLET_LEDGER_CLIENT } from './domain/ports/wallet-ledger-client.port';
import { AuthClient } from './infrastructure/clients/auth.client';
import { NotificationsClient } from './infrastructure/clients/notifications.client';
import { PricingAggregatorClient } from './infrastructure/clients/pricing-aggregator.client';
import { WalletLedgerClient } from './infrastructure/clients/wallet-ledger.client';
import { MongoRemittanceRepository } from './infrastructure/repositories/mongo-remittance.repository';
import {
  RemittanceModel,
  RemittanceSchema,
} from './infrastructure/repositories/remittance.schema';
import { RemittancesController } from './interfaces/http/controllers/remittances.controller';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: RemittanceModel.name,
        schema: RemittanceSchema,
      },
    ]),
  ],
  controllers: [RemittancesController],
  providers: [
    CreateRemittanceUseCase,
    GetRemittanceByIdUseCase,
    GetUserRemittancesUseCase,
    UpdateRemittanceStatusUseCase,
    ConfirmRemittanceUseCase,
    CancelRemittanceUseCase,
    SendRemittanceUseCase,
    GetRemittanceSummaryUseCase,
    GetRemittanceQuoteUseCase,
    SearchRecipientUseCase,
    GetIncomingRemittancesUseCase,
    ReceiveRemittanceUseCase,
    {
      provide: REMITTANCE_REPOSITORY,
      useClass: MongoRemittanceRepository,
    },
    {
      provide: AUTH_CLIENT,
      useClass: AuthClient,
    },
    {
      provide: WALLET_LEDGER_CLIENT,
      useClass: WalletLedgerClient,
    },
    {
      provide: PRICING_AGGREGATOR_CLIENT,
      useClass: PricingAggregatorClient,
    },
    {
      provide: NOTIFICATIONS_CLIENT,
      useClass: NotificationsClient,
    },
  ],
})
export class RemittancesModule {}
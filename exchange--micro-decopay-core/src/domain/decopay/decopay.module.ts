import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

import { DECOPAYController } from './controllers/decopay.controller';
import { DECOPAYService } from './services/decopay.service';
import { WalletLedgerClient } from './clients/wallet-ledger.client';
import { SignatureKeysClient } from './clients/signature-keys.client';
import { NotificationsClient } from './clients/notifications.client';
import {
  DECOPAYRequestEntity,
  DECOPAYRequestSchema,
} from './schemas/decopay-request.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: DECOPAYRequestEntity.name,
        schema: DECOPAYRequestSchema,
      },
    ]),
  ],
  controllers: [DECOPAYController],
  providers: [
    DECOPAYService,
    WalletLedgerClient,
    SignatureKeysClient,
    NotificationsClient,
  ],
})
export class DECOPAYModule {}

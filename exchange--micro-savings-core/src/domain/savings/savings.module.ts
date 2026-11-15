import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';
import {
  SavingAccount,
  SavingAccountSchema,
} from './schemas/saving-account.schema';
import { SignatureKeysClientService } from '../../shared/clients/signature-keys-client.service';
import { NotificationsClientService } from '../../shared/clients/notifications-client.service';
import { WalletLedgerClientService } from '../../shared/clients/wallet-ledger-client.service';
import { AuthClientService } from '../../shared/clients/auth-client.service';


@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: SavingAccount.name, schema: SavingAccountSchema },
    ]),
  ],
  controllers: [SavingsController],
  providers: [
    SavingsService,
    AuthClientService,
    SignatureKeysClientService,
    WalletLedgerClientService,
    NotificationsClientService,
  ],
  exports: [SavingsService],
})
export class SavingsModule {}
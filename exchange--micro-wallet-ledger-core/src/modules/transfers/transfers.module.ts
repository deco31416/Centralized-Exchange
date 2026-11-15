import { Module } from '@nestjs/common';
import { TransfersController } from './transfers.controller';
import { SecurityModule } from '../../shared/security/security.module';
import { NotificationsClientModule } from '../../shared/notifications/notifications-client.module';
import { AccountsModule } from '../accounts/accounts.module';
import { WalletsModule } from '../wallets/wallets.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [SecurityModule, NotificationsClientModule, AccountsModule, WalletsModule, LedgerModule],
  controllers: [TransfersController],
})
export class TransfersModule {}

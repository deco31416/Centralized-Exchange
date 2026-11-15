import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LedgerTx, LedgerTxSchema } from './ledger-tx.schema';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { OutboxModule } from '../../outbox/outbox.module';
import { IdempotencyModule } from '../../idempotency/idempotency.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LedgerTx.name, schema: LedgerTxSchema }]),
    forwardRef(() => WalletsModule),
    OutboxModule,
    IdempotencyModule,
    AccountsModule,
  ],
  providers: [LedgerService],
  controllers: [LedgerController],
  exports: [LedgerService],
})
export class LedgerModule {}

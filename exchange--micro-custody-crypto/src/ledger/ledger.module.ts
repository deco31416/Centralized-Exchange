import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './models/account.schema';
import {
  JournalEntry,
  JournalEntrySchema,
} from './models/journal-entry.schema';
import { JournalLine, JournalLineSchema } from './models/journal-line.schema';
import { Hold, HoldSchema } from './models/hold.schema';
import { AccountService } from './services/account.service';
import { BalanceService } from './services/balance.service';
import { HoldService } from './services/hold.service';
import { PostingService } from './services/posting.service';
import { LedgerController } from './controllers/ledger.controller';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

/**
 * Ledger module providing double-entry bookkeeping functionality.
 * Manages accounts, journal entries, holds, and balances.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: JournalEntry.name, schema: JournalEntrySchema },
      { name: JournalLine.name, schema: JournalLineSchema },
      { name: Hold.name, schema: HoldSchema },
    ]),
  ],
  controllers: [LedgerController],
  providers: [AccountService, BalanceService, HoldService, PostingService, InternalAuthGuard],
  exports: [AccountService, BalanceService, HoldService, PostingService],
})
export class LedgerModule {}

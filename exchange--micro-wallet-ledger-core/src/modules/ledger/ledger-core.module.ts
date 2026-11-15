import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LedgerCoreService } from './ledger-core.service';
import { LedgerEntryV2, LedgerEntryV2Schema } from './schemas/ledger-entry-v2.schema';
import { SystemAccount, SystemAccountSchema } from '../accounts/schemas/system-account.schema';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: LedgerEntryV2.name, schema: LedgerEntryV2Schema },
            { name: SystemAccount.name, schema: SystemAccountSchema }
        ]),
        WalletsModule
    ],
    providers: [LedgerCoreService],
    exports: [LedgerCoreService]
})
export class LedgerCoreModule { }

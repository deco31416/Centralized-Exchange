import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, ClientSession, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { LedgerEntryV2, AccountType } from './schemas/ledger-entry-v2.schema';
import { SystemAccount, SystemAccountType } from '../accounts/schemas/system-account.schema';
import { WalletsService } from '../wallets/wallets.service'; // Assuming exists

export interface LedgerLine {
    accountId: string;
    accountType: AccountType;
    amount: string; // Minor units
    direction: 'DEBIT' | 'CREDIT';
}

@Injectable()
export class LedgerCoreService {
    private readonly logger = new Logger(LedgerCoreService.name);

    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(LedgerEntryV2.name) private entryModel: Model<LedgerEntryV2>,
        @InjectModel(SystemAccount.name) private systemAccountModel: Model<SystemAccount>,
        private readonly walletsService: WalletsService,
    ) { }

    /**
     * Commit a Double-Entry Transaction Group
     * ENFORCES: Sum(Debits) == Sum(Credits)
     */
    async commitTransactionGroup(
        assetSymbol: string,
        lines: LedgerLine[],
        metadata: any = {}
    ): Promise<string> { // Returns txGroupId

        // 1. Validate Accounting Invariant (Sum Zero)
        this.validateDoubleEntry(lines);

        const session = await this.connection.startSession();
        const txGroupId = uuidv4();

        try {
            await session.withTransaction(async () => {
                // Process each line
                for (const [index, line] of lines.entries()) {
                    await this.processLine(txGroupId, assetSymbol, line, index, session);
                }
            });

            this.logger.log(`Transaction Group ${txGroupId} committed successfully.`);
            return txGroupId;

        } catch (error) {
            this.logger.error(`Failed to commit tx group ${txGroupId}`, error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    private validateDoubleEntry(lines: LedgerLine[]) {
        let balance = BigInt(0);

        for (const line of lines) {
            const amount = BigInt(line.amount);
            if (line.direction === 'CREDIT') {
                balance += amount; // Liability/Equity increases on Credit? 
                // Standard Accounting: 
                // Asset Dr+ Cr-
                // Liability Dr- Cr+
                // For simple sum check: Total Debits must equal Total Credits.
            } else {
                // DEBIT
            }
        }

        // Easier check: Sum(Debits) == Sum(Credits)
        const totalDebits = lines.filter(l => l.direction === 'DEBIT').reduce((acc, l) => acc + BigInt(l.amount), BigInt(0));
        const totalCredits = lines.filter(l => l.direction === 'CREDIT').reduce((acc, l) => acc + BigInt(l.amount), BigInt(0));

        if (totalDebits !== totalCredits) {
            throw new BadRequestException(`Accounting Imbalance: Debits ${totalDebits} != Credits ${totalCredits}`);
        }
    }

    private async processLine(
        txGroupId: string,
        asset: string,
        line: LedgerLine,
        sequence: number,
        session: ClientSession
    ) {
        let newBalance = '0';

        if (line.accountType === AccountType.USER) {
            // Update User Wallet (Mutable Cache)
            if (line.direction === 'CREDIT') {
                const result = await this.walletsService.creditAvailable(
                    { accountId: line.accountId, currency: asset, amountMinorUnits: line.amount },
                    session,
                );
                newBalance = result.after;
            } else {
                const result = await this.walletsService.debitAvailable(
                    { accountId: line.accountId, currency: asset, amountMinorUnits: line.amount },
                    session,
                );
                newBalance = result.after;
            }
        } else {
            // Update System Account
            const account = await this.systemAccountModel.findOneAndUpdate(
                { code: line.accountId, currency: asset },
                { $inc: { balanceMinorUnits: line.direction === 'DEBIT' ? Number(line.amount) : -Number(line.amount) } }, // Simplification for now
                { new: true, session: session, upsert: true } // Upsert for robustness
            );
            newBalance = account.balanceMinorUnits;
        }

        // Record Immutable Entry
        const entry = new this.entryModel({
            txGroupId,
            accountId: line.accountId,
            accountType: line.accountType,
            assetSymbol: asset,
            amountMinorUnits: line.amount,
            direction: line.direction,
            balanceAfter: newBalance,
            sequence,
            idempotencyKey: `${txGroupId}_${sequence}`
        });

        await entry.save({ session });
    }
}

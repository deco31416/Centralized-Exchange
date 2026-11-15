import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  JournalEntry,
  JournalEntryStatus,
} from '../models/journal-entry.schema';
import { JournalLine, LineDirection } from '../models/journal-line.schema';
import { CreateJournalEntryDto } from '../models/create-journal-entry.dto';
import { AccountService } from './account.service';
import { BalanceService } from './balance.service';

/**
 * Service responsible for posting journal entries.
 * Ensures double-entry bookkeeping principles and atomicity.
 */
@Injectable()
export class PostingService {
  constructor(
    @InjectModel(JournalEntry.name)
    private readonly journalEntryModel: Model<JournalEntry>,
    @InjectModel(JournalLine.name)
    private readonly journalLineModel: Model<JournalLine>,
    private readonly accountService: AccountService,
    private readonly balanceService: BalanceService,
  ) {}

  /**
   * Posts a new journal entry with idempotency support.
   * Validates balance, double-entry rules, and atomicity.
   */
  async postJournalEntry(dto: CreateJournalEntryDto): Promise<JournalEntry> {
    const existingEntry = await this.findEntryByIdempotencyKey(
      dto.externalIdempotencyKey,
    );
    if (existingEntry) {
      return existingEntry;
    }
    await this.validateEntry(dto);
    const entry = new this.journalEntryModel({
      externalIdempotencyKey: dto.externalIdempotencyKey,
      narration: dto.narration,
      correlationId: dto.correlationId,
      batchId: dto.batchId,
      status: JournalEntryStatus.PENDING,
      metadata: dto.metadata || {},
    });
    const savedEntry = await entry.save();
    const lines = dto.lines.map((line) => ({
      entryId: savedEntry._id,
      accountId: new Types.ObjectId(line.accountId),
      direction: line.direction,
      amountMinor: line.amountMinor,
      assetCode: line.assetCode,
    }));
    await this.journalLineModel.insertMany(lines);
    savedEntry.status = JournalEntryStatus.POSTED;
    savedEntry.bookedAt = new Date();
    return savedEntry.save();
  }

  /**
   * Validates a journal entry before posting.
   */
  private async validateEntry(dto: CreateJournalEntryDto): Promise<void> {
    this.validateDoubleEntry(dto);
    await this.validateAccountsExist(dto);
    await this.validateAccountsActive(dto);
    await this.validateSufficientBalance(dto);
  }

  /**
   * Validates double-entry bookkeeping rule: debits = credits per asset.
   */
  private validateDoubleEntry(dto: CreateJournalEntryDto): void {
    const assetTotals = new Map<string, { debits: number; credits: number }>();
    for (const line of dto.lines) {
      if (!assetTotals.has(line.assetCode)) {
        assetTotals.set(line.assetCode, { debits: 0, credits: 0 });
      }
      const totals = assetTotals.get(line.assetCode)!;
      if (line.direction === LineDirection.DEBIT) {
        totals.debits += line.amountMinor;
      } else {
        totals.credits += line.amountMinor;
      }
    }
    for (const [assetCode, totals] of assetTotals) {
      if (totals.debits !== totals.credits) {
        throw new BadRequestException(
          `Entry is not balanced for asset ${assetCode}: debits=${totals.debits}, credits=${totals.credits}`,
        );
      }
    }
  }

  /**
   * Validates that all accounts exist.
   */
  private async validateAccountsExist(
    dto: CreateJournalEntryDto,
  ): Promise<void> {
    for (const line of dto.lines) {
      await this.accountService.findAccountById(line.accountId);
    }
  }

  /**
   * Validates that all accounts are active.
   */
  private async validateAccountsActive(
    dto: CreateJournalEntryDto,
  ): Promise<void> {
    for (const line of dto.lines) {
      const isActive = await this.accountService.isAccountActive(
        line.accountId,
      );
      if (!isActive) {
        throw new BadRequestException(
          `Account ${line.accountId} is not active`,
        );
      }
    }
  }

  /**
   * Validates sufficient balance for debit operations.
   * 
   * This system uses INVERTED accounting convention:
   * - CREDIT = increases balance (for ALL account types)
   * - DEBIT = decreases balance (for ALL account types)
   * 
   * Skip validation for EQUITY, INCOME, and EXPENSE accounts (can have negative balances).
   */
  private async validateSufficientBalance(
    dto: CreateJournalEntryDto,
  ): Promise<void> {
    const debitsByAccount = new Map<string, number>();
    for (const line of dto.lines) {
      if (line.direction === LineDirection.DEBIT) {
        const currentAmount = debitsByAccount.get(line.accountId) || 0;
        debitsByAccount.set(line.accountId, currentAmount + line.amountMinor);
      }
    }
    for (const [accountId, amount] of debitsByAccount) {
      // Get account to check its type
      const account = await this.accountService.findAccountById(accountId);
      
      // Skip balance validation for LIABILITY, EQUITY, INCOME, and EXPENSE accounts
      // These account types can have negative balances
      const skipValidationTypes = [
        'liability' as const,
        'equity' as const,
        'income' as const,
        'expense' as const,
      ];
      
      if (skipValidationTypes.includes(account.accountType as any)) {
        continue;
      }
      
      const hasSufficient = await this.balanceService.hasSufficientBalance({
        accountId,
        requiredAmount: amount,
      });
      if (!hasSufficient) {
        throw new BadRequestException(
          `Insufficient balance in account ${accountId}`,
        );
      }
    }
  }

  /**
   * Finds an entry by its idempotency key.
   */
  async findEntryByIdempotencyKey(key: string): Promise<JournalEntry | null> {
    return this.journalEntryModel
      .findOne({ externalIdempotencyKey: key })
      .exec();
  }

  /**
   * Reverses a journal entry by creating an inverse entry.
   */
  async reverseEntry(params: {
    entryId: string;
    reason: string;
  }): Promise<JournalEntry> {
    if (!Types.ObjectId.isValid(params.entryId)) {
      throw new BadRequestException('Invalid entry ID format');
    }
    const originalEntry = await this.journalEntryModel
      .findById(params.entryId)
      .exec();
    if (!originalEntry) {
      throw new BadRequestException('Original entry not found');
    }
    if (originalEntry.status === JournalEntryStatus.REVERSED) {
      throw new ConflictException('Entry already reversed');
    }
    const originalLines = await this.journalLineModel
      .find({ entryId: originalEntry._id })
      .exec();
    const reversalLines = originalLines.map((line) => ({
      accountId: line.accountId.toString(),
      direction:
        line.direction === LineDirection.DEBIT
          ? LineDirection.CREDIT
          : LineDirection.DEBIT,
      amountMinor: line.amountMinor,
      assetCode: line.assetCode,
    }));
    const reversalDto: CreateJournalEntryDto = {
      externalIdempotencyKey: `reversal_${String(originalEntry._id)}_${Date.now()}`,
      narration: `Reversal: ${params.reason}`,
      lines: reversalLines,
      correlationId: originalEntry.correlationId,
      metadata: {
        reversedEntryId: String(originalEntry._id),
        reason: params.reason,
      },
    };
    const reversalEntry = await this.postJournalEntry(reversalDto);
    originalEntry.status = JournalEntryStatus.REVERSED;
    originalEntry.reversedEntryId = String(reversalEntry._id);
    await originalEntry.save();
    return reversalEntry;
  }

  /**
   * Gets journal lines for an entry.
   */
  async getEntryLines(entryId: string): Promise<JournalLine[]> {
    if (!Types.ObjectId.isValid(entryId)) {
      return [];
    }
    return this.journalLineModel
      .find({ entryId: new Types.ObjectId(entryId) })
      .exec();
  }
}

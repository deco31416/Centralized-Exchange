import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JournalLine, LineDirection } from '../models/journal-line.schema';
import { Hold, HoldState } from '../models/hold.schema';
import { BalanceResponseDto } from '../models/balance-response.dto';
import {
  JournalEntry,
  JournalEntryStatus,
} from '../models/journal-entry.schema';

/**
 * Service responsible for calculating account balances.
 * Balances are derived from journal lines, not stored directly.
 */
@Injectable()
export class BalanceService {
  constructor(
    @InjectModel(JournalLine.name)
    private readonly journalLineModel: Model<JournalLine>,
    @InjectModel(JournalEntry.name)
    private readonly journalEntryModel: Model<JournalEntry>,
    @InjectModel(Hold.name)
    private readonly holdModel: Model<Hold>,
  ) {}

  /**
   * Calculates the total balance for an account.
   * Balance = sum(credits) - sum(debits) for the account.
   */
  async calculateTotalBalance(accountId: string): Promise<number> {
    if (!Types.ObjectId.isValid(accountId)) {
      return 0;
    }
    const accountObjectId = new Types.ObjectId(accountId);
    const postedEntries = await this.journalEntryModel
      .find({ status: JournalEntryStatus.POSTED })
      .select('_id')
      .exec();
    const postedEntryIds = postedEntries.map((entry) => entry._id);
    const lines = await this.journalLineModel
      .find({
        accountId: accountObjectId,
        entryId: { $in: postedEntryIds },
      })
      .exec();
    let balance = 0;
    for (const line of lines) {
      if (line.direction === LineDirection.CREDIT) {
        balance += line.amountMinor;
      } else {
        balance -= line.amountMinor;
      }
    }
    return balance;
  }

  /**
   * Calculates the total amount held (locked) for an account.
   */
  async calculateHeldBalance(accountId: string): Promise<number> {
    if (!Types.ObjectId.isValid(accountId)) {
      return 0;
    }
    const accountObjectId = new Types.ObjectId(accountId);
    const holds = await this.holdModel
      .find({
        accountId: accountObjectId,
        state: HoldState.ACTIVE,
      })
      .exec();
    return holds.reduce((sum, hold) => sum + hold.amountMinor, 0);
  }

  /**
   * Gets complete balance information for an account.
   */
  async getAccountBalance(params: {
    accountId: string;
    assetCode: string;
  }): Promise<BalanceResponseDto> {
    const totalBalance = await this.calculateTotalBalance(params.accountId);
    const heldBalance = await this.calculateHeldBalance(params.accountId);
    return {
      accountId: params.accountId,
      assetCode: params.assetCode,
      balanceMinor: totalBalance,
      availableMinor: totalBalance - heldBalance,
      heldMinor: heldBalance,
    };
  }

  /**
   * Checks if an account has sufficient available balance.
   */
  async hasSufficientBalance(params: {
    accountId: string;
    requiredAmount: number;
  }): Promise<boolean> {
    const totalBalance = await this.calculateTotalBalance(params.accountId);
    const heldBalance = await this.calculateHeldBalance(params.accountId);
    const availableBalance = totalBalance - heldBalance;
    return availableBalance >= params.requiredAmount;
  }
}

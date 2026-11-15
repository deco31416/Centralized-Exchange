import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { randomUUID } from 'crypto';
import { Wallet, WalletDocument } from './wallet.schema';
import { addMinor, isNegativeMinor, subMinor } from '../../shared/money/money';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name)
    public readonly model: Model<WalletDocument>,
  ) {}

  async ensureWallet(accountId: string, currency: string, session?: ClientSession): Promise<Wallet> {
    const wallet = await this.model
      .findOneAndUpdate(
        { accountId, currency },
        {
          $setOnInsert: {
            walletId: randomUUID(),
            accountId,
            currency,
            availableMinorUnits: '0',
            lockedMinorUnits: '0',
            status: 'ACTIVE',
            version: 0,
          },
        },
        { upsert: true, new: true, session: session ?? null },
      )
      .exec();

    if (!wallet) {
      throw new Error('Failed to ensure wallet');
    }

    return wallet;
  }

  async getWallet(accountId: string, currency: string): Promise<Wallet | null> {
    return this.model.findOne({ accountId, currency }).exec();
  }

  async creditAvailable(
    input: { accountId: string; currency: string; amountMinorUnits: string },
    session?: ClientSession,
  ): Promise<{ before: string; after: string; walletId: string }> {
    const wallet = await this.model
      .findOne({ accountId: input.accountId, currency: input.currency })
      .session(session ?? null)
      .exec();

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const before = wallet.availableMinorUnits;
    const after = addMinor(before, input.amountMinorUnits);

    if (isNegativeMinor(after)) {
      throw new Error('Invariant violation: negative available');
    }

    wallet.availableMinorUnits = after;
    wallet.version = (wallet.version ?? 0) + 1;
    await wallet.save({ session });

    return { before, after, walletId: wallet.walletId };
  }

  async debitAvailable(
    input: { accountId: string; currency: string; amountMinorUnits: string },
    session?: ClientSession,
    options?: { allowNegative?: boolean },
  ): Promise<{ before: string; after: string; walletId: string }> {
    const wallet = await this.model
      .findOne({ accountId: input.accountId, currency: input.currency })
      .session(session ?? null)
      .exec();

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const before = wallet.availableMinorUnits;
    const after = subMinor(before, input.amountMinorUnits);

    if (isNegativeMinor(after) && !options?.allowNegative) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    wallet.availableMinorUnits = after;
    wallet.version = (wallet.version ?? 0) + 1;
    await wallet.save({ session });

    return { before, after, walletId: wallet.walletId };
  }
}

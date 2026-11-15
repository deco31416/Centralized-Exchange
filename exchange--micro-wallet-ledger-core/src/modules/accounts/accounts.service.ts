import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Account, AccountDocument } from './account.schema';

function computeLuhnCheckDigit(nineDigits: string): string {
  let sum = 0;
  for (let i = 0; i < nineDigits.length; i++) {
    let digit = Number(nineDigits[nineDigits.length - 1 - i]);
    if (Number.isNaN(digit)) digit = 0;
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const mod = sum % 10;
  const check = (10 - mod) % 10;
  return String(check);
}

function generateAccountNumber(): string {
  const nine = String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, '0');
  return `${nine}${computeLuhnCheckDigit(nine)}`;
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private readonly model: Model<AccountDocument>,
  ) {}

  async ensureAccountForUser(userId: string): Promise<Account> {
    const existing = await this.model.findOne({ userId }).exec();
    if (existing) return existing;

    // accountId opaco e inmutable
    const accountId = randomUUID();

    // accountNumber público (9 + check digit). Reintento por colisión.
    for (let attempt = 0; attempt < 10; attempt++) {
      const accountNumber = generateAccountNumber();
      try {
        return await this.model.create({
          accountId,
          userId,
          accountNumber,
          type: 'USER',
          status: 'ACTIVE',
        });
      } catch (error: any) {
        if (error?.code === 11000) continue;
        throw error;
      }
    }

    throw new Error('Failed to allocate unique accountNumber');
  }

  async ensureSystemAccount(systemKey: string): Promise<Account> {
    const accountId = `SYSTEM:${systemKey}`;
    const existing = await this.model.findOne({ accountId }).exec();
    if (existing) return existing;

    return this.model.create({
      accountId,
      type: 'SYSTEM',
      status: 'ACTIVE',
    });
  }

  async getByUserId(userId: string): Promise<Account | null> {
    return this.model.findOne({ userId }).exec();
  }

  async getByAccountId(accountId: string): Promise<Account | null> {
    return this.model.findOne({ accountId }).exec();
  }
}

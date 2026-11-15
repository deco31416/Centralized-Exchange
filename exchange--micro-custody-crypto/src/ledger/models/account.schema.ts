import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum OwnerType {
  USER = 'user',
  PLATFORM = 'platform',
  TRADER = 'trader',
  STORE = 'store',
}

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  INCOME = 'income',
  EXPENSE = 'expense',
  EQUITY = 'equity',
}

export enum AccountStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

/**
 * Account entity representing a ledger account for users, platform, traders, or stores.
 * Each account holds a specific asset and tracks balances through journal entries.
 */
@Schema({ timestamps: true, collection: 'accounts' })
export class Account extends Document {
  @Prop({ required: true, unique: true, default: () => crypto.randomUUID() })
  accountId: string;

  @Prop({ required: true, enum: OwnerType })
  ownerType: OwnerType;

  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop({ required: true, index: true })
  assetCode: string;

  @Prop({ required: true, enum: AccountType })
  accountType: AccountType;

  @Prop({ required: true, enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

AccountSchema.index({ ownerId: 1, assetCode: 1 }, { unique: true });
AccountSchema.index({ ownerType: 1, status: 1 });

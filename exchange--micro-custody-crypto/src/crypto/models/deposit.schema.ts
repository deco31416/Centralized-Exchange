import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { SupportedBlockchain } from './user-address.schema';

export type DepositStatus =
  | 'pending'
  | 'confirmed'
  | 'credited'
  | 'failed'
  | 'duplicate';

/**
 * Deposit schema for tracking cryptocurrency deposits
 */
@Schema({ timestamps: true })
export class Deposit extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true, type: String })
  blockchain: SupportedBlockchain;

  @Prop({ required: true, index: true })
  assetCode: string;

  @Prop({ required: true, unique: true, index: true })
  txHash: string;

  @Prop({ required: true })
  fromAddress: string;

  @Prop({ required: true })
  toAddress: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  amountMinor: number;

  @Prop({ required: true, default: 'pending', index: true })
  status: DepositStatus;

  @Prop({ required: true, default: 0 })
  confirmations: number;

  @Prop({ required: true })
  requiredConfirmations: number;

  @Prop({ type: String })
  ledgerEntryId?: string;

  @Prop({ type: Date })
  creditedAt?: Date;

  @Prop({ required: true })
  detectedAt: Date;

  @Prop({ type: Date })
  confirmedAt?: Date;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: String })
  errorMessage?: string;
}

export const DepositSchema = SchemaFactory.createForClass(Deposit);

DepositSchema.index({ userId: 1, createdAt: -1 });
DepositSchema.index({ status: 1, createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { SupportedBlockchain } from './user-address.schema';

export type WithdrawalStatus =
  | 'pending_approval'
  | 'processing'
  | 'pending_signatures'
  | 'broadcasted'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface MultiSigSignature {
  signerId: string;
  signature: string;
  signedAt: Date;
}

/**
 * Withdrawal schema for tracking cryptocurrency withdrawals
 */
@Schema({ timestamps: true })
export class Withdrawal extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true, type: String })
  blockchain: SupportedBlockchain;

  @Prop({ required: true, index: true })
  assetCode: string;

  @Prop({ type: String, index: true })
  txHash?: string;

  @Prop({ required: true })
  destinationAddress: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  amountMinor: number;

  @Prop({ type: Number })
  gasFee?: number;

  @Prop({ type: String })
  gasFeeAsset?: string;

  @Prop({ required: true, default: 'pending_approval', index: true })
  status: WithdrawalStatus;

  @Prop({ default: 0 })
  confirmations: number;

  @Prop({ type: String })
  holdId?: string;

  @Prop({ default: false })
  requiresMultiSig: boolean;

  @Prop({ type: Array })
  signatures?: MultiSigSignature[];

  @Prop({ type: String })
  ledgerEntryId?: string;

  @Prop({ type: Date })
  debitedAt?: Date;

  @Prop({ required: true })
  requestedAt: Date;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  broadcastedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ required: true, unique: true, index: true })
  idempotencyKey: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: String })
  errorMessage?: string;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);

WithdrawalSchema.index({ userId: 1, createdAt: -1 });
WithdrawalSchema.index({ status: 1, createdAt: -1 });

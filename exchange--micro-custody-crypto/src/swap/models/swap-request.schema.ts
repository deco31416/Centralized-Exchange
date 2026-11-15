import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SwapStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

/**
 * Swap Request entity representing a currency exchange between user and platform.
 * All swaps use virtual money in the ledger system.
 */
@Schema({ timestamps: true, collection: 'swap_requests' })
export class SwapRequest extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  fromAsset: string;

  @Prop({ required: true })
  toAsset: string;

  @Prop({ required: true, type: Number })
  fromAmount: number;

  @Prop({ required: true, type: Number })
  toAmount: number;

  @Prop({ required: true, type: Number })
  executedRate: number;

  @Prop({ required: true, type: Number })
  spread: number;

  @Prop({ required: true })
  pricingBand: string;

  @Prop({ required: true, enum: SwapStatus, default: SwapStatus.PENDING })
  status: SwapStatus;

  @Prop({ index: true })
  ledgerEntryId: string;

  @Prop({ required: true, unique: true, index: true })
  externalIdempotencyKey: string;

  @Prop()
  executedAt: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SwapRequestSchema = SchemaFactory.createForClass(SwapRequest);

SwapRequestSchema.index({ userId: 1, createdAt: -1 });
SwapRequestSchema.index({ status: 1, createdAt: -1 });

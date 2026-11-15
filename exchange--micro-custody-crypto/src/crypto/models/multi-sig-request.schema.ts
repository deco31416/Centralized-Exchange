import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MultiSigSignature } from './withdrawal.schema';

export type MultiSigStatus = 'pending' | 'approved' | 'rejected' | 'expired';

/**
 * Multi-sig request schema for withdrawal approvals
 */
@Schema({ timestamps: true })
export class MultiSigRequest extends Document {
  @Prop({ required: true, index: true })
  withdrawalId: string;

  @Prop({ required: true, type: Object })
  unsignedTx: Record<string, any>;

  @Prop({ required: true })
  requiredSignatures: number;

  @Prop({ type: Array, default: [] })
  signatures: MultiSigSignature[];

  @Prop({ required: true, default: 'pending', index: true })
  status: MultiSigStatus;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const MultiSigRequestSchema = SchemaFactory.createForClass(MultiSigRequest);

MultiSigRequestSchema.index({ withdrawalId: 1 });
MultiSigRequestSchema.index({ status: 1, createdAt: -1 });

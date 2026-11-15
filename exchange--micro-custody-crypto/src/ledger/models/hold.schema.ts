import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum HoldState {
  ACTIVE = 'active',
  RELEASED = 'released',
  CANCELED = 'canceled',
}

/**
 * Hold represents a temporary lock on funds in an account.
 * Used for escrow and pending transactions.
 */
@Schema({ timestamps: true, collection: 'holds' })
export class Hold extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Account', index: true })
  accountId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amountMinor: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, enum: HoldState, default: HoldState.ACTIVE })
  state: HoldState;

  @Prop()
  expiresAt: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const HoldSchema = SchemaFactory.createForClass(Hold);

HoldSchema.index({ accountId: 1, state: 1 });
HoldSchema.index({ expiresAt: 1 });

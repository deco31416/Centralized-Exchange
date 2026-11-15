import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Swap Limit tracks daily usage limits per user and asset pair.
 */
@Schema({ timestamps: true, collection: 'swap_limits' })
export class SwapLimit extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  assetPair: string;

  @Prop({ required: true, type: Number })
  dailyLimit: number;

  @Prop({ required: true, type: Number, default: 0 })
  dailyUsed: number;

  @Prop({ required: true })
  lastResetDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SwapLimitSchema = SchemaFactory.createForClass(SwapLimit);

SwapLimitSchema.index({ userId: 1, assetPair: 1 }, { unique: true });

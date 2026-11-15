import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type P2PTraderStatsDocument = P2PTraderStats & Document;

@Schema({ timestamps: true })
export class P2PTraderStats {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ default: 0 })
  completedOrders: number;

  @Prop({ default: 0 })
  cancelledOrders: number;

  @Prop({ default: 0 })
  disputeCount: number;

  @Prop({ default: 0 })
  disputeWon: number;

  @Prop({ default: 0 })
  totalVolumeUsd: number;

  @Prop({ default: 0 })
  positiveRatings: number;

  @Prop({ default: 0 })
  negativeRatings: number;

  @Prop()
  lastOrderAt: Date;
}

export const P2PTraderStatsSchema = SchemaFactory.createForClass(P2PTraderStats);

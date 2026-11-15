import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DisputeStatus } from '../../../shared/enums/p2p.enums';

export type P2PDisputeDocument = P2PDispute & Document;

@Schema({ timestamps: true })
export class P2PDispute {
  @Prop({ required: true, unique: true })
  disputeId: string;

  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ required: true, index: true })
  openedByUserId: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, enum: Object.values(DisputeStatus), default: DisputeStatus.OPEN })
  status: string;

  @Prop()
  resolvedByAdminId: string;

  @Prop()
  resolution: string;

  @Prop()
  resolvedAt: Date;
}

export const P2PDisputeSchema = SchemaFactory.createForClass(P2PDispute);

P2PDisputeSchema.index({ orderId: 1 });
P2PDisputeSchema.index({ status: 1 });

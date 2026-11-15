import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type P2PChatMessageDocument = P2PChatMessage & Document;

@Schema({ timestamps: true })
export class P2PChatMessage {
  @Prop({ required: true, unique: true })
  messageId: string;

  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ required: true, index: true })
  senderId: string;

  @Prop({ required: true })
  text: string;

  // P2P-CHAT-REALTIME-001: solo persistencia. WebSocket realtime pendiente.
  @Prop({ default: false })
  seenBySeller: boolean;

  @Prop({ default: false })
  seenByBuyer: boolean;
}

export const P2PChatMessageSchema = SchemaFactory.createForClass(P2PChatMessage);

P2PChatMessageSchema.index({ orderId: 1, createdAt: 1 });

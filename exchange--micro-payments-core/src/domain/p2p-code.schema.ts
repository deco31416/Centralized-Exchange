import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type P2PCodeDocument = HydratedDocument<P2PCode>;

@Schema({
  collection: 'p2p_codes',
  timestamps: true,
})
export class P2PCode {
  @Prop({ required: true, unique: true })
  code!: string; // 6-digit code

  @Prop({ required: true, index: true })
  fromUserId!: string;

  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true })
  amountMinorUnits!: string;

  @Prop({ required: true })
  status!: 'PENDING' | 'USED' | 'EXPIRED';

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  usedBy?: string; // userId who claimed it

  @Prop()
  usedAt?: Date;

  @Prop()
  qrData?: string; // JSON string with transfer data
}

export const P2PCodeSchema = SchemaFactory.createForClass(P2PCode);

// TTL index para auto-delete expired codes
P2PCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

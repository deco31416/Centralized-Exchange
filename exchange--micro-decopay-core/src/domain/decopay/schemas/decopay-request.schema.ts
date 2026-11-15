import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DECOPAYRequestDocument = HydratedDocument<DECOPAYRequestEntity>;

@Schema({
  collection: 'DECOPAY_requests',
  timestamps: true,
  versionKey: false,
})
export class DECOPAYRequestEntity {
  @Prop({ type: String, required: true, unique: true, index: true })
  requestId!: string;

  @Prop({ type: String, required: true, index: true })
  payerUserId!: string;

  @Prop({ type: String, required: true, index: true })
  collectorUserId!: string;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: String, required: true })
  amountMinorUnits!: string;

  @Prop({
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true,
  })
  currency!: string;

  @Prop({ type: String })
  concept?: string;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  imageUrl?: string;

  @Prop({ type: String })
  payerEmail?: string;

  @Prop({ type: String })
  collectorEmail?: string;

  @Prop({
    type: String,
    required: true,
    enum: ['PENDING', 'PAID', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  })
  status!: 'PENDING' | 'PAID' | 'CANCELLED';

  @Prop({ type: Object, default: null })
  metadata?: Record<string, unknown> | null;

  // union => type explícito
  @Prop({ type: String, default: null })
  paidAt!: string | null;

  @Prop({ type: String, default: null })
  cancelledAt!: string | null;

  @Prop({ type: String, default: null })
  cancelReason!: string | null;

  @Prop({ type: String, default: null })
  transferTxId!: string | null;

  @Prop({ type: String, default: null })
  receiptId!: string | null;

  @Prop({
    type: String,
    enum: ['SKIPPED', 'ENQUEUED', 'FAILED'],
    default: 'SKIPPED',
  })
  notificationStatus!: 'SKIPPED' | 'ENQUEUED' | 'FAILED';
}

export const DECOPAYRequestSchema =
  SchemaFactory.createForClass(DECOPAYRequestEntity);
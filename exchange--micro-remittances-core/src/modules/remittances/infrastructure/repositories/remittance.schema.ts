import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RemittanceStatus } from '../../domain/enums/remittance-status.enum';

export type RemittanceDocument = HydratedDocument<RemittanceModel>;

@Schema({
  collection: 'remittances',
  timestamps: false,
  versionKey: false,
})
export class RemittanceModel {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  senderUserId: string;

  @Prop({ required: true })
  senderWalletId: string;

  @Prop()
  senderName?: string;

  @Prop()
  senderEmail?: string;

  @Prop({ required: true, enum: ['DECOX', 'EXTERNAL'] })
  receiverType: 'DECOX' | 'EXTERNAL';

  @Prop()
  receiverUserId?: string;

  @Prop({ required: true, index: true })
  receiverIdentifier: string;

  @Prop()
  receiverName?: string;

  @Prop()
  receiverEmail?: string;

  @Prop()
  receiverPhone?: string;

  @Prop({ required: true })
  amountdeco: number;

  @Prop({ required: true })
  sourceCurrency: string;

  @Prop({ required: true })
  targetCurrency: string;

  @Prop()
  targetAmount?: number;

  @Prop()
  fxRate?: number;

  @Prop()
  fee?: number;

  @Prop()
  concept?: string;

  @Prop({ required: true, enum: RemittanceStatus })
  status: RemittanceStatus;

  @Prop()
  reservationId?: string;

  @Prop()
  captureId?: string;

  @Prop()
  receiveCurrency?: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;

  @Prop()
  receivedAt?: string;

  @Prop()
  cancelledAt?: string;
}

export const RemittanceSchema = SchemaFactory.createForClass(RemittanceModel);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PaymentMethodStatus, PaymentMethodType } from '../../../shared/enums/p2p.enums';

export type P2PPaymentMethodDocument = P2PPaymentMethod & Document;

@Schema({ timestamps: true })
export class P2PPaymentMethod {
  @Prop({ required: true, unique: true })
  paymentMethodId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: Object.values(PaymentMethodType) })
  type: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  label: string;

  /**
   * Datos sensibles del método de pago cifrados con AES-256-GCM.
   * Estructura: { algorithm, iv, authTag, ciphertext, keyVersion }
   * NUNCA exponer en listados — usar maskedDetails en GET.
   * P2P-PAYMENTMETHOD-ENCRYPTION-001: implementado.
   */
  @Prop({ type: MongooseSchema.Types.Mixed })
  detailsEncrypted: Record<string, unknown>;

  @Prop({ required: true, enum: Object.values(PaymentMethodStatus), default: PaymentMethodStatus.PENDING_REVIEW })
  status: string;

  @Prop({ default: false })
  adminApproved: boolean;

  @Prop()
  adminNotes: string;
}

export const P2PPaymentMethodSchema = SchemaFactory.createForClass(P2PPaymentMethod);

P2PPaymentMethodSchema.index({ userId: 1, status: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AdSide, AdStatus, PaymentRail, PriceType } from '../../../shared/enums/p2p.enums';

export type P2PAdDocument = P2PAd & Document;

@Schema({ timestamps: true })
export class P2PAd {
  @Prop({ required: true, unique: true })
  adId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: Object.values(AdSide) })
  side: string;

  @Prop({ required: true })
  assetCode: string;

  @Prop({ required: true })
  fiatCode: string;

  @Prop({ required: true, enum: Object.values(PriceType) })
  priceType: string;

  @Prop()
  fixedPrice: number;

  @Prop()
  marketMarginPercent: number;

  @Prop({ required: true })
  minFiatAmount: number;

  @Prop({ required: true })
  maxFiatAmount: number;

  @Prop({ required: true })
  availableCryptoAmount: number;

  /** Amount original publicado al crear el Ad — inmutable tras creación */
  @Prop({ default: 0 })
  totalCryptoAmount: number;

  /** Suma de cryptoAmount de órdenes activas (PAYMENT_PENDING → RELEASE_PENDING) */
  @Prop({ default: 0 })
  reservedCryptoAmount: number;

  /** Suma de cryptoAmount de órdenes completadas (RELEASED) */
  @Prop({ default: 0 })
  releasedCryptoAmount: number;

  @Prop({ type: [String], default: [] })
  paymentMethodIds: string[];

  @Prop()
  terms: string;

  @Prop({ required: true, enum: Object.values(AdStatus), default: AdStatus.PAUSED })
  status: string;

  @Prop()
  escrowId: string;

  /**
   * Rails de pago que el vendedor acepta en este anuncio.
   * Por defecto solo EXTERNAL_FIAT_PAYMENT.
   * INTERNAL_FIAT_WALLET solo puede activarse cuando P2P-FIAT-HOLD-INTEGRATION-001 esté resuelto
   * y el feature flag P2P_ENABLE_INTERNAL_FIAT_WALLET=true.
   */
  @Prop({ type: [String], enum: Object.values(PaymentRail), default: [PaymentRail.EXTERNAL_FIAT_PAYMENT] })
  acceptedPaymentRails: string[];
}

export const P2PAdSchema = SchemaFactory.createForClass(P2PAd);

P2PAdSchema.index({ status: 1, side: 1, assetCode: 1, fiatCode: 1 });
P2PAdSchema.index({ userId: 1, status: 1 });

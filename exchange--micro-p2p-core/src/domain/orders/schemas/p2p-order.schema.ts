import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FiatSettlementStatus, OrderStatus, PaymentRail, PaymentStatus } from '../../../shared/enums/p2p.enums';

export type P2POrderDocument = P2POrder & Document;

@Schema({ timestamps: true })
export class P2POrder {
  @Prop({ required: true, unique: true })
  orderId: string;

  @Prop({ required: true, index: true })
  adId: string;

  @Prop({ required: true, index: true })
  buyerId: string;

  @Prop({ required: true, index: true })
  sellerId: string;

  @Prop({ required: true })
  assetCode: string;

  @Prop({ required: true })
  fiatCode: string;

  @Prop({ required: true })
  cryptoAmount: number;

  @Prop({ required: true })
  fiatAmount: number;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  feeAmount: number;

  @Prop()
  feeAsset: string;

  @Prop({ default: 0 })
  feeRate: number;

  @Prop({ default: 'not_configured' })
  feeSource: string;

  @Prop({ required: true })
  paymentMethodId: string;

  @Prop({ required: true, enum: Object.values(PaymentStatus), default: PaymentStatus.NOT_PAID })
  paymentStatus: string;

  @Prop({ required: true, enum: Object.values(OrderStatus), default: OrderStatus.CREATED })
  status: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  escrowId: string;

  @Prop({ type: [String], default: [] })
  ledgerTxIds: string[];

  @Prop()
  buyerNote: string;

  @Prop()
  sellerNote: string;

  /**
   * Rail de pago de la orden.
   * EXTERNAL_FIAT_PAYMENT: el comprador paga al vendedor fuera de BlackCEX (default, flujo actual).
   * INTERNAL_FIAT_WALLET: el comprador usa su saldo fiat interno — BLOQUEADO hasta P2P-FIAT-HOLD-INTEGRATION-001.
   */
  @Prop({ required: true, enum: Object.values(PaymentRail), default: PaymentRail.EXTERNAL_FIAT_PAYMENT })
  paymentRail: string;

  /**
   * Estado del settlement fiat interno. Solo relevante para INTERNAL_FIAT_WALLET rail.
   * Para EXTERNAL_FIAT_PAYMENT siempre es NOT_APPLICABLE.
   */
  @Prop({ required: true, enum: Object.values(FiatSettlementStatus), default: FiatSettlementStatus.NOT_APPLICABLE })
  fiatSettlementStatus: string;

  /** ID del hold fiat en wallet-ledger. Solo para INTERNAL_FIAT_WALLET rail. */
  @Prop()
  fiatHoldId: string;

  /** IDs de transacciones del ledger fiat asociadas a esta orden. */
  @Prop({ type: [String], default: [] })
  fiatLedgerTxIds: string[];

  /** Código de moneda fiat bloqueada (p.ej. 'MXN', 'COP'). Solo para INTERNAL_FIAT_WALLET rail. */
  @Prop()
  fiatWalletCurrency: string;
}

export const P2POrderSchema = SchemaFactory.createForClass(P2POrder);

P2POrderSchema.index({ buyerId: 1, status: 1 });
P2POrderSchema.index({ sellerId: 1, status: 1 });
// adId ya tiene index:true en @Prop — no duplicar aquí
P2POrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

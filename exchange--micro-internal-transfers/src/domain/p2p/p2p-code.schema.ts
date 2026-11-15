import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type P2PCodeDocument = HydratedDocument<P2PCode>;

/**
 * Schema para códigos P2P de transferencias internas.
 *
 * Ciclo de vida:
 *   PENDING → USED     (cuando el pagador reclama el pago)
 *   PENDING → EXPIRED  (cuando expira el TTL)
 *   PENDING → CANCELLED (cuando el cobrador cancela)
 *
 * MongoDB TTL index limpia automáticamente los documentos expirados.
 */
@Schema({
  collection: 'p2p_codes',
  timestamps: true,
})
export class P2PCode {
  /** Código de 6 dígitos único (ej: "482917") */
  @Prop({ required: true, unique: true })
  code!: string;

  /** ID del usuario que genera el código (cobrador/emisor) */
  @Prop({ required: true, index: true })
  fromUserId!: string;

  /** Moneda: MXN, USD, BTC, ETH, etc. */
  @Prop({ required: true })
  currency!: string;

  /** Monto en unidades menores (centavos, satoshis, etc.) */
  @Prop({ required: true })
  amountMinorUnits!: string;

  /** Estado del código */
  @Prop({ required: true, index: true })
  status!: 'PENDING' | 'USED' | 'EXPIRED' | 'CANCELLED';

  /** Fecha de expiración */
  @Prop({ required: true })
  expiresAt!: Date;

  /** Concepto o descripción del cobro */
  @Prop()
  concept?: string;

  /** JSON stringificado con datos para el QR */
  @Prop()
  qrData?: string;

  /** ID del usuario que reclamó el pago */
  @Prop()
  usedBy?: string;

  /** Fecha en que fue reclamado */
  @Prop()
  usedAt?: Date;

  /** ID de la transacción en wallet-ledger (una vez ejecutada) */
  @Prop()
  ledgerTxId?: string;

  /** Tipo de operación interna */
  @Prop({ default: 'P2P_QR' })
  transferType?: 'P2P_QR' | 'P2P_CODE' | 'COLLECT_QR' | 'DECOPAY';
}

export const P2PCodeSchema = SchemaFactory.createForClass(P2PCode);

// TTL index — MongoDB auto-deletes expired documents
P2PCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient lookups
P2PCodeSchema.index({ code: 1, status: 1 });

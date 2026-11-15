import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LedgerTxDocument = HydratedDocument<LedgerTx>;

export type LedgerTxType = 'FIAT_DEPOSIT_CONFIRMED' | 'P2P_TRANSFER' | 'ADJUSTMENT';

@Schema({
  collection: 'ledger_txs',
  timestamps: true,
})
export class LedgerTx {
  @Prop({ required: true, unique: true, index: true })
  txId!: string;

  @Prop({ required: true, index: true })
  type!: LedgerTxType;

  @Prop({ required: true, index: true })
  accountId!: string;

  @Prop({ required: true, index: true })
  currency!: string;

  // Minor units (base-10 integer string)
  @Prop({ required: true })
  amountMinorUnits!: string;

  @Prop({ required: true })
  balanceBeforeMinorUnits!: string;

  @Prop({ required: true })
  balanceAfterMinorUnits!: string;

  @Prop({ required: true, index: true })
  correlationId!: string;

  // Used to ensure exactly-once application (e.g. eventId)
  @Prop({ required: true, unique: true, index: true })
  idempotencyKey!: string;

  @Prop()
  concept?: string;

  @Prop({ type: Object })
  externalRef?: Record<string, unknown>;
}

export const LedgerTxSchema = SchemaFactory.createForClass(LedgerTx);

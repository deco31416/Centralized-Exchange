import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LedgerEntryDocument = HydratedDocument<LedgerEntry>;

@Schema({
  collection: 'ledger_entries',
  timestamps: true,
})
export class LedgerEntry {
  @Prop({ required: true, index: true })
  txId!: string;

  @Prop({ required: true, index: true })
  accountId!: string;

  @Prop({ required: true })
  walletId!: string;

  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true })
  direction!: 'CREDIT' | 'DEBIT';

  @Prop({ required: true })
  amountMinorUnits!: string;

  @Prop({ required: true })
  balanceBeforeMinorUnits!: string;

  @Prop({ required: true })
  balanceAfterMinorUnits!: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const LedgerEntrySchema = SchemaFactory.createForClass(LedgerEntry);

LedgerEntrySchema.index({ accountId: 1, createdAt: -1 });
LedgerEntrySchema.index({ walletId: 1, createdAt: -1 });

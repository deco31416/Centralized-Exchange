import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({
  collection: 'wallets',
  timestamps: true,
})
export class Wallet {
  @Prop({ required: true, unique: true, index: true })
  walletId!: string;

  @Prop({ required: true, index: true })
  accountId!: string;

  @Prop({ required: true, index: true })
  currency!: string;

  // Minor units as base-10 integer string
  @Prop({ required: true, default: '0' })
  availableMinorUnits!: string;

  @Prop({ required: true, default: '0' })
  lockedMinorUnits!: string;

  @Prop({ default: 'ACTIVE', index: true })
  status!: 'ACTIVE' | 'FROZEN';

  @Prop({ default: 0 })
  version!: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.index({ accountId: 1, currency: 1 }, { unique: true });

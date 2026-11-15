import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupportedBlockchain = 'bitcoin' | 'bsc' | 'ethereum' | 'stellar' | 'tron';

/**
 * User address schema for blockchain deposit addresses
 */
@Schema({ timestamps: true })
export class UserAddress extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true, type: String })
  blockchain: SupportedBlockchain;

  @Prop({ required: true, index: true })
  assetCode: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  derivationPath: string;

  @Prop({ required: true })
  addressIndex: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isWatched: boolean;

  @Prop({ type: Date })
  firstDepositAt?: Date;

  @Prop({ type: Date })
  lastDepositAt?: Date;

  @Prop({ default: 0 })
  totalDepositsReceived: number;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);

// Compound index for unique address per user per blockchain
UserAddressSchema.index({ userId: 1, blockchain: 1, assetCode: 1 }, { unique: true });

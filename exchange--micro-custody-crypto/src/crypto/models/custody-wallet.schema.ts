import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { SupportedBlockchain } from './user-address.schema';

/**
 * Custody wallet schema for managing hot wallets
 */
@Schema({ timestamps: true })
export class CustodyWallet extends Document {
  @Prop({ required: true, unique: true, index: true })
  assetCode: string;

  @Prop({ required: true, index: true, type: String })
  blockchain: SupportedBlockchain;

  @Prop({ required: true, unique: true })
  mainAddress: string;

  @Prop({ type: [String], default: [] })
  backupAddresses?: string[];

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({ required: true, default: 0 })
  balanceMinor: number;

  @Prop({ required: true })
  maxWithdrawalPerTx: number;

  @Prop({ required: true })
  maxWithdrawalPerHour: number;

  @Prop({ required: true })
  maxWithdrawalPerDay: number;

  @Prop({ required: true })
  minOperationalBalance: number;

  @Prop({ required: true })
  alertThresholdPercentage: number;

  @Prop({ default: false })
  requiresMultiSig: boolean;

  @Prop({ required: true })
  multiSigThreshold: number;

  @Prop({ required: true, default: 2 })
  signaturesRequired: number;

  @Prop({ required: true })
  kmsKeyId: string;

  @Prop({ default: '6-months' })
  keyRotationPolicy: string;

  @Prop({ type: Date })
  lastKeyRotation: Date;

  @Prop({ type: Date })
  lastBalanceCheck: Date;

  @Prop({ default: 0 })
  currentHourWithdrawals: number;

  @Prop({ default: 0 })
  currentDayWithdrawals: number;

  @Prop({ type: Date })
  withdrawalWindowReset: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isLocked: boolean;
}

export const CustodyWalletSchema = SchemaFactory.createForClass(CustodyWallet);

CustodyWalletSchema.index({ blockchain: 1, assetCode: 1 });

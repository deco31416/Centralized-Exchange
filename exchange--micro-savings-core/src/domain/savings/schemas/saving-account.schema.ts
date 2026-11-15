import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SavingAccountDocument = HydratedDocument<SavingAccount>;

@Schema({ _id: false, versionKey: false })
export class SavingMovement {
  @Prop({ required: true, trim: true })
  id: string;

  @Prop({ required: true, trim: true, uppercase: true })
  type: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, trim: true, uppercase: true })
  currency: string;

  @Prop({ trim: true, default: null })
  note?: string | null;

  @Prop({ required: true, min: 0 })
  balanceAfter: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: Object, default: null })
  metadata?: Record<string, unknown> | null;
}

export const SavingMovementSchema = SchemaFactory.createForClass(SavingMovement);

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'saving_accounts',
})
export class SavingAccount {
  @Prop({ required: true, trim: true })
  userId: string;

  @Prop({ required: true, trim: true })
  holderName: string;

  @Prop({ required: true, trim: true, uppercase: true })
  currency: string;

  @Prop({ required: true, min: 0, default: 0 })
  principalAmount: number;

  @Prop({ required: true, min: 0, default: 0 })
  earnedAmount: number;

  @Prop({ required: true, min: 0, default: 0 })
  totalBalance: number;

  @Prop({ required: true, trim: true, uppercase: true, default: 'ACTIVE' })
  status: string;

  @Prop({ required: true, min: 0, default: 1.5 })
  monthlyRate: number;

  @Prop({ trim: true, default: null })
  goalName?: string | null;

  @Prop({ default: null })
  goalAmount?: number | null;

  @Prop({ trim: true, default: null })
  description?: string | null;

  @Prop({ default: null })
  lastContributionAt?: Date | null;

  @Prop({ default: null })
  lastWithdrawalAt?: Date | null;

  @Prop({ type: [SavingMovementSchema], default: [] })
  movements: SavingMovement[];
}

export const SavingAccountSchema = SchemaFactory.createForClass(SavingAccount);
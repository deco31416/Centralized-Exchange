import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LoanStatusEnum } from '../models/loan-status.enum';

export type LoanDocument = HydratedDocument<Loan>;

@Schema({ _id: false })
export class LoanInstallment {
  @Prop({ required: true })
  installmentNumber: number;

  @Prop({ required: true })
  dueDate: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  principal: number;

  @Prop({ required: true })
  interest: number;

  @Prop({ required: true, default: 'pending' })
  status: 'pending' | 'paid' | 'partial';

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ default: null })
  paidAt?: string | null;
}

export const LoanInstallmentSchema =
  SchemaFactory.createForClass(LoanInstallment);

@Schema({ _id: false })
export class LoanPayment {
  @Prop({ required: true })
  paymentId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ default: 'wallet' })
  paymentMethod: string;

  @Prop({ default: null })
  externalReference?: string | null;

  @Prop({ required: true })
  registeredAt: string;

  @Prop({ default: 'validated_only' })
  settlementStatus: 'validated_only' | 'pending_wallet_movement' | 'settled';
}

export const LoanPaymentSchema = SchemaFactory.createForClass(LoanPayment);

@Schema({
  timestamps: true,
  collection: 'loans',
})
export class Loan {
  @Prop({ required: true, unique: true, index: true })
  loanId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  applicantFullName: string;

  @Prop({ required: true })
  documentNumber: string;

  @Prop()
  email?: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  balance: number;

  @Prop({ required: true, default: 'MXN' })
  currency: string;

  @Prop({
    required: true,
    enum: LoanStatusEnum,
    default: LoanStatusEnum.PENDING,
  })
  status: LoanStatusEnum;

  @Prop({ required: true })
  interestRate: number;

  @Prop({ required: true })
  termMonths: number;

  @Prop({ default: null })
  openingFee?: number | null;

  @Prop({ default: null })
  purpose?: string | null;

  @Prop({ default: null })
  acceptedAt?: string | null;

  @Prop({ default: null })
  acceptedBy?: string | null;

  @Prop({ default: null })
  disbursedAt?: string | null;

  @Prop({ type: [LoanInstallmentSchema], default: [] })
  schedule: LoanInstallment[];

  @Prop({ type: [LoanPaymentSchema], default: [] })
  payments: LoanPayment[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);
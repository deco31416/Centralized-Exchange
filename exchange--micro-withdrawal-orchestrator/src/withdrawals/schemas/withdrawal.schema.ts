import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WithdrawalDocument = Withdrawal & Document;

export enum WithdrawalStatus {
    REQUESTED = 'REQUESTED',   // Initial state
    RISK_PENDING = 'RISK_PENDING',
    RISK_REJECTED = 'RISK_REJECTED',
    SECURITY_HOLD = 'SECURITY_HOLD',
    RESERVED = 'RESERVED',     // Funds locked in Ledger (User -> Clearing)
    BROADCASTED = 'BROADCASTED', // Sent to Blockchain/Bank
    CONFIRMED = 'CONFIRMED',   // Final settlement (Clearing -> Hot Wallet)
    FAILED = 'FAILED'          // Rollback needed (Clearing -> User)
}

@Schema({ timestamps: true, collection: 'withdrawals' })
export class Withdrawal {
    @Prop({ required: true, unique: true })
    withdrawalId: string; // UUID

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    assetSymbol: string;

    @Prop({ required: true })
    network: string; // ERC20, TRC20, SPEI

    @Prop({ required: true })
    destinationAddress: string;

    @Prop({ required: true })
    amountMinorUnits: string;

    @Prop({ required: true, enum: WithdrawalStatus, default: WithdrawalStatus.REQUESTED })
    status: WithdrawalStatus;

    @Prop()
    txHash: string; // Blockchain Tx Hash

    @Prop()
    ledgerTxGroupId_Reserve: string; // Ref to Reserve Tx

    @Prop()
    ledgerTxGroupId_Settle: string; // Ref to Settlement Tx

    @Prop({ type: Object })
    riskAnalysis: any;

    @Prop()
    errorReason: string;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
WithdrawalSchema.index({ userId: 1, createdAt: -1 });
WithdrawalSchema.index({ status: 1 });

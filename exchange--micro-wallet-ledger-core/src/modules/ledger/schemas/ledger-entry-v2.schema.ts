import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AccountType {
    USER = 'USER',
    SYSTEM = 'SYSTEM'
}

@Schema({ timestamps: true, collection: 'ledger_v2_entries' })
export class LedgerEntryV2 extends Document {
    @Prop({ required: true, index: true })
    txGroupId: string; // Links all debit/credit lines of a single atomic operation

    @Prop({ required: true })
    accountId: string; // User ID or System Account Code

    @Prop({ required: true, enum: AccountType })
    accountType: AccountType;

    @Prop({ required: true })
    assetSymbol: string;

    @Prop({ required: true, type: String }) // BigInt logic
    amountMinorUnits: string; // Always positive

    @Prop({ required: true, enum: ['DEBIT', 'CREDIT'] })
    direction: string;

    @Prop({ required: true })
    balanceAfter: string; // Snapshot for quick read

    @Prop({ required: true })
    sequence: number; // Order within the group

    // Unique index to prevent duplicate application of same correlation
    @Prop({ index: true })
    idempotencyKey: string;
}

export const LedgerEntryV2Schema = SchemaFactory.createForClass(LedgerEntryV2);

// Indices
LedgerEntryV2Schema.index({ txGroupId: 1 });
LedgerEntryV2Schema.index({ accountId: 1, createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum FeeScope {
    GLOBAL = 'GLOBAL',
    NETWORK = 'NETWORK',
    ASSET = 'ASSET',
    PAIR = 'PAIR',
}

export enum FeeType {
    FIXED = 'FIXED',
    PERCENTAGE = 'PERCENTAGE',
}

export enum OperationType {
    BUY = 'BUY',
    SELL = 'SELL',
    WITHDRAW = 'WITHDRAW',
    DEPOSIT = 'DEPOSIT',
    SWAP = 'SWAP',
}

@Schema({ timestamps: true, collection: 'fee_schedules' })
export class FeeSchedule extends Document {
    @Prop({ required: true, enum: FeeScope })
    scope: FeeScope;

    @Prop({ type: [String], default: [] })
    refIds: string[]; // e.g., ['BTC'] for ASSET, ['BTC', 'USD'] for PAIR

    @Prop({ required: true, enum: OperationType })
    operation: OperationType;

    @Prop({ required: true, enum: FeeType })
    feeType: FeeType;

    @Prop({ required: true, type: Number })
    value: number; // 0.5 for 0.5%, 100 for 1.00 fixed

    // Hierarchy Priority (Lower number = Higher priority)
    // PAIR=1, ASSET=2, NETWORK=3, GLOBAL=4
    @Prop({ required: true, type: Number })
    priority: number;

    @Prop()
    effectiveFrom: Date;

    @Prop()
    effectiveUntil: Date;

    @Prop({ default: true })
    enabled: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const FeeScheduleSchema = SchemaFactory.createForClass(FeeSchedule);

FeeScheduleSchema.index({ scope: 1, priority: 1 });
FeeScheduleSchema.index({ operation: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'quotes' })
export class Quote extends Document {
    @Prop({ required: true, unique: true })
    quoteId: string; // UUID

    @Prop()
    userId: string;

    @Prop({ required: true })
    operation: string; // BUY, SELL, etc.

    // Inputs
    @Prop({ required: true })
    fromAsset: string;

    @Prop({ required: true })
    toAsset: string;

    @Prop({ required: true, type: Number })
    fromAmount: number; // Minor units

    // Pricing
    @Prop({ required: true, type: Number })
    exchangeRate: number;

    @Prop({ required: true, type: Number })
    toAmountBeforeFees: number;

    // Fees Breakdown
    @Prop({ type: Object })
    fees: {
        networkFee?: { value: number; type: string };
        platformFee?: { value: number; type: string };
        total: number; // Total fee in minor units
    };

    // Result
    @Prop({ required: true, type: Number })
    toAmountAfterFees: number;

    // Metadata
    @Prop()
    pricingSource: string;

    @Prop()
    feeScheduleId: string;

    // Expiration
    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false })
    used: boolean;

    @Prop()
    usedAt: Date;

    @Prop()
    createdAt: Date;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);

// quoteId index already created by @Prop({ unique: true }) — no duplicate needed
QuoteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL

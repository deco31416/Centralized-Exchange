import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AggregationStrategy = 'AVERAGE' | 'MAX' | 'MIN' | 'MEDIAN';

export class SourceRate {
    @Prop()
    rate: number;

    @Prop()
    timestamp: Date;
}

@Schema({ timestamps: true, collection: 'fiat_rate_tickers' })
export class FiatRateTicker extends Document {
    @Prop({ required: true, uppercase: true })
    baseCurrency: string; // USD

    @Prop({ required: true, uppercase: true })
    quoteCurrency: string; // COP, MXN, PEN, VES, SVC

    @Prop({ required: true, uppercase: true })
    pairCode: string; // USD_COP

    // Raw aggregated rate
    @Prop({ type: Number, required: true })
    baseRate: number;

    // Individual source rates
    @Prop({ type: SourceRate })
    exchangeRateApi?: SourceRate;

    @Prop({ type: SourceRate })
    frankfurter?: SourceRate;

    @Prop({ type: SourceRate })
    exchangeRateHost?: SourceRate;

    @Prop({ type: SourceRate })
    floatRates?: SourceRate;

    @Prop({ type: SourceRate })
    fawazCurrency?: SourceRate;

    // Aggregation strategy used
    @Prop({ enum: ['AVERAGE', 'MAX', 'MIN', 'MEDIAN'], default: 'AVERAGE' })
    aggregationStrategy: AggregationStrategy;

    // Final aggregated rate
    @Prop({ type: Number, required: true })
    finalRate: number;

    // 24h rate change percentage (calculated from previous ticker)
    @Prop({ type: Number, default: 0 })
    rateChange24h: number;

    // Metadata
    @Prop({ default: false })
    stale: boolean;

    @Prop({ default: false })
    outlierDetected: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const FiatRateTickerSchema = SchemaFactory.createForClass(FiatRateTicker);

FiatRateTickerSchema.index({ pairCode: 1, createdAt: -1 });
FiatRateTickerSchema.index({ baseCurrency: 1, quoteCurrency: 1, createdAt: -1 });
FiatRateTickerSchema.index({ updatedAt: -1 });
// TTL: auto-delete ticker entries older than 7 days — fiat rate tickers are not ledger records
FiatRateTickerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

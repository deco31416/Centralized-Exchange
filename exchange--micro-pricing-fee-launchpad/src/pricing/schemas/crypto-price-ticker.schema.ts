import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AggregationStrategy = 'AVERAGE' | 'MAX' | 'MIN';

export class SourcePrice {
    @Prop()
    price: number;

    @Prop()
    timestamp: Date;
}

@Schema({ timestamps: true, collection: 'crypto_price_tickers' })
export class CryptoPriceTicker extends Document {
    @Prop({ required: true, uppercase: true })
    assetCode: string; // BTC, ETH, USDT

    // Base price (aggregated from sources)
    @Prop({ type: Number, required: true })
    basePriceUsd: number;

    // Individual source prices
    @Prop({ type: SourcePrice })
    coinmarketcap?: SourcePrice;

    @Prop({ type: SourcePrice })
    cryptocompare?: SourcePrice;

    @Prop({ type: SourcePrice })
    coingecko?: SourcePrice;

    // Aggregation
    @Prop({ enum: ['AVERAGE', 'MAX', 'MIN'], default: 'AVERAGE' })
    aggregationStrategy: AggregationStrategy;

    @Prop({ type: Number, required: true })
    finalBasePriceUsd: number;

    // Statistics (24h)
    @Prop({ type: Number, default: 0 })
    priceChange24h: number;

    @Prop({ type: Number, default: 0 })
    volume24h: number;

    @Prop({ type: Number, default: 0 })
    marketCap: number;

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

export const CryptoPriceTickerSchema = SchemaFactory.createForClass(CryptoPriceTicker);

CryptoPriceTickerSchema.index({ assetCode: 1, createdAt: -1 });
CryptoPriceTickerSchema.index({ assetCode: 1, stale: 1 });
CryptoPriceTickerSchema.index({ updatedAt: -1 });

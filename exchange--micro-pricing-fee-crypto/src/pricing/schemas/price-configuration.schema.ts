import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PriceSource = 'COINMARKETCAP' | 'CRYPTOCOMPARE' | 'COINGECKO' | 'MANUAL';

@Schema({ timestamps: true, collection: 'price_configurations' })
export class PriceConfiguration extends Document {
    @Prop({ required: true, uppercase: true, unique: true })
    assetCode: string;

    // External API settings
    @Prop({ type: [String], default: ['COINGECKO', 'COINMARKETCAP', 'CRYPTOCOMPARE'] })
    sources: PriceSource[];

    @Prop({ enum: ['AVERAGE', 'MAX', 'MIN'], default: 'AVERAGE' })
    aggregationStrategy: 'AVERAGE' | 'MAX' | 'MIN';

    // Cache
    @Prop({ type: Number, default: 30 })
    ttlSeconds: number;

    // Circuit breaker
    @Prop({ type: Number, default: 0.15 })
    maxVariationPercentage: number; // 15% max change

    @Prop({ type: Number, default: 3 })
    outlierThreshold: number; // Z-score

    @Prop({ default: true })
    enabled: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const PriceConfigurationSchema = SchemaFactory.createForClass(PriceConfiguration);

PriceConfigurationSchema.index({ enabled: 1 });

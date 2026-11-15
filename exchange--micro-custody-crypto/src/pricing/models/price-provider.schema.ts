import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ProviderType {
  OFFICIAL = 'official',
  PRIVATE = 'private',
  AGGREGATOR = 'aggregator',
}

/**
 * Price Provider entity representing external data sources for exchange rates.
 */
@Schema({ timestamps: true, collection: 'price_providers' })
export class PriceProvider extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, type: String, enum: ProviderType })
  type: ProviderType;

  @Prop({ required: true, type: [String] })
  assetPairs: string[];

  @Prop({ required: true, type: Number, min: 0, max: 1 })
  weight: number;

  @Prop({ required: true, default: true })
  enabled: boolean;

  @Prop({ required: true })
  endpoint: string;

  @Prop()
  apiKey: string;

  @Prop()
  lastSuccessfulFetch: Date;

  @Prop({ required: true, type: Number, default: 0 })
  consecutiveFailures: number;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PriceProviderSchema = SchemaFactory.createForClass(PriceProvider);

PriceProviderSchema.index({ enabled: 1, type: 1 });
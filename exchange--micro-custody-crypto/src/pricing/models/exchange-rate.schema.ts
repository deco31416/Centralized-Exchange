import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum RateSource {
  BINANCE = 'binance',
  COINBASE = 'coinbase',
  BANCO_CENTRAL = 'banco_central',
  MERCADO_PARALELO = 'mercado_paralelo',
  MANUAL = 'manual',
}

/**
 * Exchange Rate entity storing historical rates from various sources.
 */
@Schema({ timestamps: true, collection: 'exchange_rates' })
export class ExchangeRate extends Document {
  @Prop({ required: true })
  fromAsset: string;

  @Prop({ required: true })
  toAsset: string;

  @Prop({ required: true, type: Number })
  rate: number;

  @Prop({ required: true, type: String, enum: RateSource })
  source: RateSource;

  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);

ExchangeRateSchema.index({ fromAsset: 1, toAsset: 1, timestamp: -1 });
ExchangeRateSchema.index({ source: 1, timestamp: -1 });
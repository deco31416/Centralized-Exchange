import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PricingBand } from './pricing-configuration.schema';

export enum BandEventType {
  CONFIG_CHANGE = 'config_change',
  USAGE = 'usage',
  VIOLATION_ATTEMPT = 'violation_attempt',
}

/**
 * Pricing Band Log entity for audit trail of pricing band usage and changes.
 */
@Schema({ timestamps: true, collection: 'pricing_band_logs' })
export class PricingBandLog extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'PricingConfiguration', index: true })
  pricingConfigId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: PricingBand })
  band: PricingBand;

  @Prop({ required: true, type: Number })
  buySpread: number;

  @Prop({ required: true, type: Number })
  sellSpread: number;

  @Prop({ required: true, type: Number })
  totalSpread: number;

  @Prop({ required: true, type: Number })
  baseRate: number;

  @Prop({ required: true, type: Number })
  finalBuyRate: number;

  @Prop({ required: true, type: Number })
  finalSellRate: number;

  @Prop()
  justification: string;

  @Prop()
  approvedBy: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;

  @Prop({ required: true, type: String, enum: BandEventType })
  eventType: BandEventType;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const PricingBandLogSchema = SchemaFactory.createForClass(PricingBandLog);

PricingBandLogSchema.index({ pricingConfigId: 1, timestamp: -1 });
PricingBandLogSchema.index({ band: 1, timestamp: -1 });
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PricingBand {
  GREEN = 'green',
  YELLOW = 'yellow',
  RED = 'red',
}

/**
 * Pricing Configuration entity managing spreads and compliance bands for asset pairs.
 */
@Schema({ timestamps: true, collection: 'pricing_configurations' })
export class PricingConfiguration extends Document {
  @Prop({ required: true, unique: true })
  assetPair: string;

  @Prop({ required: true, type: Number, min: 0, max: 100 })
  buySpread: number;

  @Prop({ required: true, type: Number, min: 0, max: 100 })
  sellSpread: number;

  @Prop({ required: true, type: Number })
  totalSpread: number;

  @Prop({ required: true, type: String, enum: PricingBand })
  currentBand: PricingBand;

  @Prop({ required: true, default: true })
  enabled: boolean;

  @Prop({ required: true, default: false })
  requiresJustification: boolean;

  @Prop()
  justificationReason: string;

  @Prop()
  approvedBy: string;

  @Prop()
  approvedAt: Date;

  @Prop({ required: true, default: () => new Date() })
  lastBandCheck: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PricingConfigurationSchema = SchemaFactory.createForClass(PricingConfiguration);

PricingConfigurationSchema.index({ enabled: 1, currentBand: 1 });

// Pre-save hook to calculate total spread
PricingConfigurationSchema.pre('save', function (next) {
  this.totalSpread = this.buySpread + this.sellSpread;
  next();
});
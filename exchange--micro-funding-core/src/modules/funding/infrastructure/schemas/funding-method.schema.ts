import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type FundingMethodDocument = HydratedDocument<FundingMethodSchemaClass>;

@Schema({ collection: 'funding_methods', timestamps: true })
export class FundingMethodSchemaClass {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  fiatCode: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  type: string;

  @Prop({ required: true })
  minAmount: number;

  @Prop({ required: true })
  maxAmount: number;

  @Prop({ default: false })
  requiresSavedCard: boolean;

  @Prop({ default: false })
  requiresKyc: boolean;

  @Prop()
  settlementTime: string;

  @Prop()
  instructions: string;

  @Prop()
  iconUrl: string;

  @Prop({ default: false })
  isInternal: boolean;

  @Prop({ default: false })
  isManualDeposit: boolean;

  @Prop({ default: true })
  adminEditable: boolean;

  @Prop({ default: true })
  enabled: boolean;

  @Prop()
  disabledReason: string;

  @Prop({ default: 0 })
  displayOrder: number;

  /** Datos extra: stripePaymentMethod, rail, etc. */
  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const FundingMethodSchema = SchemaFactory.createForClass(FundingMethodSchemaClass);

// Índices compuestos útiles para queries por moneda/país
FundingMethodSchema.index({ fiatCode: 1, enabled: 1 });
FundingMethodSchema.index({ country: 1, enabled: 1 });
FundingMethodSchema.index({ fiatCode: 1, displayOrder: 1 });

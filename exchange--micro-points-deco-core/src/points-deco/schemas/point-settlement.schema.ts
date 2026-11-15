import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PointSettlementDocument = HydratedDocument<PointSettlementEntity>;
export type PointSettlementStatus = 'balanced' | 'review_required';

@Schema({ collection: 'points_deco_settlements', timestamps: true })
export class PointSettlementEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, unique: true, index: true })
  orderId: string;

  @Prop({ index: true })
  pointId?: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, index: true })
  status: PointSettlementStatus;

  @Prop({ required: true })
  originCurrency: string;

  @Prop({ required: true })
  destinationCurrency: string;

  @Prop({ required: true })
  expectedOriginMinorUnits: string;

  @Prop({ required: true })
  actualReceivedMinorUnits: string;

  @Prop({ required: true })
  originDifferenceMinorUnits: string;

  @Prop({ required: true })
  expectedDestinationMinorUnits: string;

  @Prop({ required: true })
  actualDeliveredMinorUnits: string;

  @Prop({ required: true })
  destinationDifferenceMinorUnits: string;

  @Prop({ default: 'not_required' })
  ledgerStatus: string;

  @Prop({ default: 'not_required' })
  approvalStatus: 'not_required' | 'pending_admin_review';

  @Prop({ type: [String], default: [] })
  reviewReasons: string[];

  @Prop({ default: 'draft' })
  fiscalReportStatus: 'draft' | 'ready_for_export';

  @Prop()
  generatedBy?: string;

  @Prop()
  generatedByRole?: string;

  @Prop()
  generatedAt?: string;

  @Prop()
  completedAt?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const PointSettlementSchema =
  SchemaFactory.createForClass(PointSettlementEntity);

PointSettlementSchema.index({ pointId: 1, status: 1 });

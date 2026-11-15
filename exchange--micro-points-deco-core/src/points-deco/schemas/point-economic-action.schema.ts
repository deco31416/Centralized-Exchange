import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PointEconomicActionDocument = HydratedDocument<PointEconomicActionEntity>;
export type PointEconomicActionResolution = 'refund_user' | 'release_to_point';
export type PointEconomicActionStatus =
  | 'pending_review'
  | 'queued_for_custody'
  | 'executed'
  | 'rejected';

@Schema({ collection: 'points_deco_economic_actions', timestamps: true })
export class PointEconomicActionEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, index: true })
  disputeId: string;

  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ index: true })
  pointId?: string;

  @Prop({ index: true })
  userId?: string;

  @Prop({ required: true, index: true })
  resolution: PointEconomicActionResolution;

  @Prop({ required: true })
  actionType: 'non_hold_refund' | 'non_hold_point_payout';

  @Prop({ default: 'pending_review', index: true })
  status: PointEconomicActionStatus;

  @Prop({ required: true })
  requiredAction: string;

  @Prop({ required: true })
  reason: string;

  @Prop()
  sourceExecutionId?: string;

  @Prop()
  orderStatus?: string;

  @Prop()
  ledgerHoldStatus?: string;

  @Prop({ default: false })
  requiresLedgerHold?: boolean;

  @Prop()
  originCurrency?: string;

  @Prop()
  destinationCurrency?: string;

  @Prop()
  amountOrigin?: number;

  @Prop()
  amountDestinationEstimated?: number;

  @Prop()
  createdBy?: string;

  @Prop()
  createdByRole?: string;

  @Prop()
  createdAtIso?: string;

  @Prop()
  reviewedBy?: string;

  @Prop()
  reviewedByRole?: string;

  @Prop()
  reviewedAtIso?: string;

  @Prop()
  executedBy?: string;

  @Prop()
  executedByRole?: string;

  @Prop()
  executedAtIso?: string;

  @Prop()
  rejectedBy?: string;

  @Prop()
  rejectedByRole?: string;

  @Prop()
  rejectedAtIso?: string;

  @Prop()
  rejectionReason?: string;

  @Prop()
  executionReference?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: [Object], default: [] })
  auditTrail: Array<Record<string, unknown>>;
}

export const PointEconomicActionSchema =
  SchemaFactory.createForClass(PointEconomicActionEntity);

PointEconomicActionSchema.index({ disputeId: 1, resolution: 1 }, { unique: true });
PointEconomicActionSchema.index({ status: 1, createdAtIso: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PointDisputeDocument = HydratedDocument<PointDisputeEntity>;

@Schema({ collection: 'points_deco_disputes', timestamps: true })
export class PointDisputeEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  orderId: string;

  @Prop()
  pointId?: string;

  @Prop()
  userId?: string;

  @Prop()
  orderType?: string;

  @Prop()
  originCurrency?: string;

  @Prop()
  destinationCurrency?: string;

  @Prop()
  amountOrigin?: number;

  @Prop()
  amountDestinationEstimated?: number;

  @Prop({ required: true })
  openedBy: string;

  @Prop({ default: 'user' })
  openedByRole: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: 'open' })
  status: 'open' | 'reviewing' | 'resolved' | 'rejected';

  @Prop()
  assignedTo?: string;

  @Prop()
  resolution?: 'refund_user' | 'release_to_point' | 'cancel_order' | 'manual_review' | 'no_action';

  @Prop()
  resolutionReason?: string;

  @Prop()
  adminNote?: string;

  @Prop({ default: 'not_required' })
  makerCheckerStatus:
    | 'not_required'
    | 'pending_checker'
    | 'approved'
    | 'rejected';

  @Prop()
  preparedBy?: string;

  @Prop()
  preparedAt?: string;

  @Prop()
  checkedBy?: string;

  @Prop()
  checkedAt?: string;

  @Prop()
  checkerNote?: string;

  @Prop()
  appliedResolutionAt?: string;

  @Prop({ default: 'not_started' })
  resolutionExecutionStatus:
    | 'not_started'
    | 'queued_for_executor'
    | 'executed_noop'
    | 'executed_cancelled'
    | 'executed_refunded'
    | 'executed_released_to_point'
    | 'failed_review_required'
    | 'blocked';

  @Prop()
  resolutionExecutionPlan?: string;

  @Prop()
  resolutionExecutionId?: string;

  @Prop()
  executedBy?: string;

  @Prop()
  executedAt?: string;

  @Prop()
  executionNote?: string;

  @Prop({ type: [String], default: [] })
  evidenceRefs: string[];

  @Prop({ type: [Object], default: [] })
  auditTrail: Array<Record<string, unknown>>;

  @Prop()
  openedAt?: string;

  @Prop()
  reviewStartedAt?: string;

  @Prop()
  resolvedAt?: string;

  @Prop()
  rejectedAt?: string;

  @Prop()
  slaDueAt?: string;
}

export const PointDisputeSchema = SchemaFactory.createForClass(PointDisputeEntity);

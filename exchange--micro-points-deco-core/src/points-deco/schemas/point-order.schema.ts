import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PointOrderStatus, PointService } from '../points-deco.interfaces';

export type PointOrderDocument = HydratedDocument<PointOrderEntity>;

@Schema({ collection: 'points_deco_orders', timestamps: true })
export class PointOrderEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  type: PointService;

  @Prop({ required: true })
  userId: string;

  @Prop()
  pointId?: string;

  @Prop({ required: true })
  originCurrency: string;

  @Prop({ required: true })
  destinationCurrency: string;

  @Prop({ required: true })
  amountOrigin: number;

  @Prop({ required: true })
  amountDestinationEstimated: number;

  @Prop({ required: true })
  rate: number;

  @Prop({ default: 0 })
  decoFee: number;

  @Prop({ default: 0 })
  pointFee: number;

  @Prop({ default: 'local-fallback' })
  pricingSource?: string;

  @Prop()
  pricingOperation?: string;

  @Prop()
  pricingCorridor?: string;

  @Prop()
  pricingMethod?: string;

  @Prop()
  pricingWarning?: string;

  @Prop({ required: true })
  status: PointOrderStatus;

  @Prop()
  rateLockedUntil?: string;

  @Prop({ default: 'REVIEW' })
  limitsDecision?: string;

  @Prop({ default: true })
  limitsRequiresApproval?: boolean;

  @Prop({ type: Number })
  limitsPolicyVersion?: number | null;

  @Prop()
  limitsNextAction?: string;

  @Prop({ type: [Object], default: [] })
  auditTrail?: Array<Record<string, unknown>>;

  @Prop({ default: false })
  requiresLedgerHold?: boolean;

  @Prop({ default: 'not_required' })
  ledgerHoldStatus?: string;

  @Prop()
  ledgerHoldCurrency?: string;

  @Prop()
  ledgerHoldAmountMinorUnits?: string;

  @Prop()
  ledgerHoldEventId?: string;

  @Prop()
  ledgerHoldTxId?: string;

  @Prop({ type: Object })
  ledgerHoldError?: Record<string, unknown>;

  @Prop()
  ledgerHoldUpdatedAt?: string;

  @Prop()
  statusChangedAt?: string;

  @Prop()
  acceptedAt?: string;

  @Prop()
  locationRevealedAt?: string;

  @Prop()
  checkedInAt?: string;

  @Prop()
  codeVerifiedAt?: string;

  @Prop()
  cashReceivedAt?: string;

  @Prop()
  cashDeliveredAt?: string;

  @Prop()
  settlementPendingAt?: string;

  @Prop()
  completedAt?: string;

  @Prop()
  cancelledAt?: string;

  @Prop()
  disputedAt?: string;
}

export const PointOrderSchema = SchemaFactory.createForClass(PointOrderEntity);

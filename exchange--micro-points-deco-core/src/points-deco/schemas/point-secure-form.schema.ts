import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PointSecureFormDocument = HydratedDocument<PointSecureFormEntity>;
export type PointSecureFormType =
  | 'source_of_funds'
  | 'identity_support'
  | 'fiscal_support'
  | 'dispute_support'
  | 'provider_evidence';
export type PointSecureFormStatus =
  | 'submitted'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'expired';

@Schema({ collection: 'points_deco_secure_forms', timestamps: true })
export class PointSecureFormEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, index: true })
  type: PointSecureFormType;

  @Prop({ default: 'submitted', index: true })
  status: PointSecureFormStatus;

  @Prop({ index: true })
  orderId?: string;

  @Prop({ index: true })
  pointId?: string;

  @Prop({ index: true })
  userId?: string;

  @Prop({ required: true })
  submittedBy: string;

  @Prop({ default: 'user' })
  submittedByRole: string;

  @Prop({ default: false })
  consentAccepted: boolean;

  @Prop({ type: Object, default: {} })
  fields: Record<string, unknown>;

  @Prop({ type: [String], default: [] })
  evidenceRefs: string[];

  @Prop()
  expiresAt?: string;

  @Prop()
  reviewedBy?: string;

  @Prop()
  reviewedByRole?: string;

  @Prop()
  reviewedAt?: string;

  @Prop()
  reviewNote?: string;

  @Prop({ type: [Object], default: [] })
  auditTrail: Array<Record<string, unknown>>;

  @Prop()
  createdAtIso?: string;
}

export const PointSecureFormSchema =
  SchemaFactory.createForClass(PointSecureFormEntity);

PointSecureFormSchema.index({ orderId: 1, type: 1, status: 1 });
PointSecureFormSchema.index({ pointId: 1, status: 1 });

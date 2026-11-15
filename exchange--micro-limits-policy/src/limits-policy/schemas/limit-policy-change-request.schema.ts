import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  LimitPolicyChangeRequest,
  LimitPolicyRequestStatus,
  LimitPolicyRule,
} from '../limits-policy.interfaces';

export type LimitPolicyChangeRequestDocument =
  HydratedDocument<LimitPolicyChangeRequestEntity>;

@Schema({
  timestamps: true,
  collection: 'limit_policy_change_requests',
})
export class LimitPolicyChangeRequestEntity implements LimitPolicyChangeRequest {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  ruleId: string;

  @Prop({ required: true, default: 'UPDATE' })
  action: 'UPDATE';

  @Prop({ required: true, default: 'PENDING', index: true })
  status: LimitPolicyRequestStatus;

  @Prop({ required: true, index: true })
  requestedBy: string;

  @Prop({ required: true })
  requestReason: string;

  @Prop({ required: true, type: Object })
  patch: Partial<LimitPolicyRule>;

  @Prop({ required: true, type: Object })
  before: LimitPolicyRule;

  @Prop({ index: true })
  reviewedBy?: string;

  @Prop()
  reviewReason?: string;

  @Prop({ index: true })
  appliedChangeId?: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop()
  reviewedAt?: string;
}

export const LimitPolicyChangeRequestSchema = SchemaFactory.createForClass(
  LimitPolicyChangeRequestEntity,
);

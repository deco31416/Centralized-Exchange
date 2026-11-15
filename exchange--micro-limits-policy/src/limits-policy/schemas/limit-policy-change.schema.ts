import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LimitPolicyChange, LimitPolicyRule } from '../limits-policy.interfaces';

export type LimitPolicyChangeDocument = HydratedDocument<LimitPolicyChangeEntity>;

@Schema({
  timestamps: true,
  collection: 'limit_policy_changes',
})
export class LimitPolicyChangeEntity implements LimitPolicyChange {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  ruleId: string;

  @Prop({ required: true })
  version: number;

  @Prop({ required: true, default: 'UPDATE' })
  action: 'UPDATE';

  @Prop({ required: true, index: true })
  changedBy: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, type: Object })
  before: LimitPolicyRule;

  @Prop({ required: true, type: Object })
  after: LimitPolicyRule;

  @Prop({ required: true })
  createdAt: string;
}

export const LimitPolicyChangeSchema = SchemaFactory.createForClass(
  LimitPolicyChangeEntity,
);

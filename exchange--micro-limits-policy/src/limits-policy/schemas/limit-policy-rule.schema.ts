import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  KycLevel,
  LimitAssetType,
  LimitOperation,
  LimitPolicyRule,
  LimitScope,
  RiskLevel,
  LimitPolicySource,
} from '../limits-policy.interfaces';

export type LimitPolicyRuleDocument = HydratedDocument<LimitPolicyRuleEntity>;

@Schema({
  timestamps: true,
  collection: 'limit_policy_rules',
})
export class LimitPolicyRuleEntity implements LimitPolicyRule {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  scope: LimitScope;

  @Prop({ required: true, index: true })
  operation: LimitOperation;

  @Prop({ required: true, index: true })
  assetType: LimitAssetType;

  @Prop({ required: true, index: true })
  product: string;

  @Prop({ index: true })
  country?: string;

  @Prop({ index: true })
  currency?: string;

  @Prop({ required: true, index: true })
  kycLevel: KycLevel;

  @Prop({ required: true, index: true })
  riskLevel: RiskLevel;

  @Prop({ required: true })
  minAmount: number;

  @Prop({ required: true })
  maxAmount: number;

  @Prop({ required: true })
  dailyLimit: number;

  @Prop({ required: true })
  monthlyLimit: number;

  @Prop({ required: true, default: false })
  requiresApproval: boolean;

  @Prop({ required: true, default: true, index: true })
  enabled: boolean;

  @Prop({ required: true, default: 0 })
  priority: number;

  @Prop({ required: true, default: 1 })
  version: number;

  @Prop({ required: true, default: 'bootstrap' })
  source: LimitPolicySource;

  @Prop()
  lastChangedBy?: string;

  @Prop()
  lastChangeReason?: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const LimitPolicyRuleSchema = SchemaFactory.createForClass(LimitPolicyRuleEntity);

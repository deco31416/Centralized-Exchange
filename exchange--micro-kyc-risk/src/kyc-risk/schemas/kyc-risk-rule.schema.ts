import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  KycRiskCaseType,
  KycRiskSeverity,
} from '../interfaces/kyc-risk-case.interface';

@Schema({ collection: 'kyc_risk_rules' })
export class KycRiskRuleEntity {
  @Prop({ required: true, unique: true, index: true })
  code!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ['kyc', 'aml', 'risk', 'manual_review'] })
  category!: KycRiskCaseType;

  @Prop({ required: true, enum: ['low', 'medium', 'high', 'critical'] })
  severity!: KycRiskSeverity;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, default: true })
  enabled!: boolean;
}

export type KycRiskRuleDocument = HydratedDocument<KycRiskRuleEntity>;
export const KycRiskRuleSchema = SchemaFactory.createForClass(KycRiskRuleEntity);

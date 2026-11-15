import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  KycRiskCaseType,
  KycRiskSeverity,
  KycRiskStatus,
} from '../interfaces/kyc-risk-case.interface';

@Schema({ collection: 'kyc_risk_cases' })
export class KycRiskCaseEntity {
  @Prop({ required: true, unique: true, index: true })
  caseId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, enum: ['kyc', 'aml', 'risk', 'manual_review'] })
  type!: KycRiskCaseType;

  @Prop({ required: true, enum: ['low', 'medium', 'high', 'critical'] })
  severity!: KycRiskSeverity;

  @Prop({ required: true, enum: ['open', 'in_review', 'approved', 'rejected', 'escalated', 'closed'], default: 'open' })
  status!: KycRiskStatus;

  @Prop({ required: true })
  reason!: string;

  @Prop()
  notes?: string;

  @Prop()
  resolutionNotes?: string;

  @Prop({ required: true })
  createdAt!: string;

  @Prop({ required: true })
  updatedAt!: string;
}

export type KycRiskCaseDocument = HydratedDocument<KycRiskCaseEntity>;
export const KycRiskCaseSchema = SchemaFactory.createForClass(KycRiskCaseEntity);

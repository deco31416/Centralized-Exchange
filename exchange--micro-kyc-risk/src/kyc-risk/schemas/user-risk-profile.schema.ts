import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  UserRiskLevel,
  UserRiskProfile,
  UserRiskSignal,
} from '../interfaces/kyc-risk-case.interface';

@Schema({ collection: 'user_risk_profiles' })
export class UserRiskProfileEntity {
  @Prop({ required: true, unique: true, index: true })
  userId!: string;

  @Prop({ required: true, enum: ['none', 'level_1', 'level_2', 'level_3', 'institutional'] })
  kycLevel!: UserRiskProfile['kycLevel'];

  @Prop({ required: true, min: 0, max: 100 })
  riskScore!: number;

  @Prop({ required: true, enum: ['green', 'orange', 'red'] })
  riskLevel!: UserRiskLevel;

  @Prop({ required: true, enum: ['active', 'monitoring', 'restricted', 'blocked'] })
  status!: UserRiskProfile['status'];

  @Prop({ required: true })
  reason!: string;

  @Prop({ type: [Object], default: [] })
  signals!: UserRiskSignal[];

  @Prop({ required: true })
  lastAssessmentAt!: string;

  @Prop({ required: true })
  updatedAt!: string;
}

export type UserRiskProfileDocument = HydratedDocument<UserRiskProfileEntity>;
export const UserRiskProfileSchema = SchemaFactory.createForClass(UserRiskProfileEntity);

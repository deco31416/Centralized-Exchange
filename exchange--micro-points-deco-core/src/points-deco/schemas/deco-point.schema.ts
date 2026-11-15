import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PointService, PointStatus, PointType, RiskLevel } from '../points-deco.interfaces';

export type DecoPointDocument = HydratedDocument<DecoPointEntity>;

@Schema({ collection: 'points_deco_points', timestamps: true })
export class DecoPointEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  type: PointType;

  @Prop({ required: true })
  legalName: string;

  @Prop({ required: true })
  tradeName: string;

  @Prop()
  taxId?: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  region?: string;

  @Prop()
  city?: string;

  @Prop()
  zone?: string;

  @Prop({ required: true })
  status: PointStatus;

  @Prop({ required: true })
  riskLevel: RiskLevel;

  @Prop()
  kybLevel?: string;

  @Prop({ type: [String], default: [] })
  allowedServices: PointService[];

  @Prop()
  liquidityRangeLabel?: string;

  @Prop()
  scheduleLabel?: string;

  @Prop({ default: 0 })
  rating: number;
}

export const DecoPointSchema = SchemaFactory.createForClass(DecoPointEntity);

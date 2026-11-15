import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PointCashPositionDocument = HydratedDocument<PointCashPositionEntity>;

@Schema({ collection: 'points_deco_cash_positions', timestamps: true })
export class PointCashPositionEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, index: true })
  pointId: string;

  @Prop({ required: true, index: true })
  currency: string;

  @Prop({ required: true, default: '0' })
  physicalBalanceMinorUnits: string;

  @Prop({ default: 'active', index: true })
  status: 'active' | 'frozen' | 'closed';

  @Prop()
  lastMovementId?: string;

  @Prop()
  lastClosedAt?: string;

  @Prop({ default: 0 })
  version: number;
}

export const PointCashPositionSchema =
  SchemaFactory.createForClass(PointCashPositionEntity);

PointCashPositionSchema.index({ pointId: 1, currency: 1 }, { unique: true });

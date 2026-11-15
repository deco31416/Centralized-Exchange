import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CashMovementDirection = 'in' | 'out' | 'neutral';
export type CashMovementType =
  | 'order_cash_received'
  | 'order_cash_delivered'
  | 'manual_adjustment'
  | 'daily_close';

export type PointCashMovementDocument = HydratedDocument<PointCashMovementEntity>;

@Schema({ collection: 'points_deco_cash_movements', timestamps: true })
export class PointCashMovementEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, index: true })
  pointId: string;

  @Prop({ required: true, index: true })
  currency: string;

  @Prop({ required: true })
  type: CashMovementType;

  @Prop({ required: true })
  direction: CashMovementDirection;

  @Prop({ required: true })
  amountMinorUnits: string;

  @Prop({ required: true })
  balanceBeforeMinorUnits: string;

  @Prop({ required: true })
  balanceAfterMinorUnits: string;

  @Prop()
  orderId?: string;

  @Prop()
  actorId?: string;

  @Prop()
  actorRole?: string;

  @Prop()
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const PointCashMovementSchema =
  SchemaFactory.createForClass(PointCashMovementEntity);

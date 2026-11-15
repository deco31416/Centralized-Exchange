import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Platform Reserve tracks virtual and real balances for each asset.
 * Coverage ratio must be >= 1.0 to ensure platform can fulfill swaps.
 */
@Schema({ timestamps: true, collection: 'platform_reserves' })
export class PlatformReserve extends Document {
  @Prop({ required: true, unique: true, index: true })
  assetCode: string;

  @Prop({ required: true, type: Number, default: 0 })
  virtualBalance: number;

  @Prop({ required: true, type: Number, default: 0 })
  realBalance: number;

  @Prop({ required: true, type: Number, default: 0 })
  exposureLimit: number;

  @Prop({ type: Number })
  coverage: number;

  @Prop()
  lastUpdated: Date;
}

export const PlatformReserveSchema =
  SchemaFactory.createForClass(PlatformReserve);

PlatformReserveSchema.pre('save', function (next) {
  if (this.realBalance > 0) {
    this.coverage = this.virtualBalance / this.realBalance;
  } else {
    this.coverage = 0;
  }
  this.lastUpdated = new Date();
  next();
});

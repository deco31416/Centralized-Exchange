import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({
  collection: 'refresh_tokens',
  timestamps: { createdAt: 'created_at' },
  versionKey: false,
})
export class RefreshToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, ref: 'Session', required: true, index: true })
  session_id: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  token_hash: string;

  @Prop({ type: Types.ObjectId, ref: 'RefreshToken', index: true })
  parent_id?: Types.ObjectId;

  @Prop({ type: Date })
  rotated_at?: Date;

  @Prop({ type: Date, expires: 0, index: true })
  expires_at: Date;

  @Prop({ type: Date, index: true })
  revoked_at?: Date;

  @Prop({ type: Boolean, default: false })
  reuse_detected: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Device', required: true })
  device_id: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ session_id: 1, revoked_at: 1 });
// user_id already indexed via ref: 'User'

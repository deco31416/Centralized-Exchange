import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({
  collection: 'sessions',
  timestamps: { createdAt: 'created_at' },
  versionKey: false,
})
export class Session {
  @Prop({ type: String, required: true })
  _id: string; // Custom session ID (MongoDB auto-indexes _id)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Device', required: true })
  device_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  ip_hash: string;

  @Prop({ type: String, required: true })
  user_agent_hash: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: Date.now })
  last_seen_at: Date;

  @Prop({ type: Date, expires: 0, index: true })
  expires_at: Date;

  @Prop({ type: Date, index: true })
  revoked_at?: Date;

  @Prop({ type: String })
  reason?: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.index({ user_id: 1, revoked_at: 1 });
SessionSchema.index({ device_id: 1, revoked_at: 1 });

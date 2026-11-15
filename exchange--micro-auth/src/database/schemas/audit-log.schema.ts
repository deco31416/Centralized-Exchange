import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({
  collection: 'audit_logs',
  timestamps: { createdAt: 'occurred_at' },
  versionKey: false,
})
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  actor_user_id?: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  action: string;

  @Prop({ type: String, required: true })
  target: string;

  @Prop({ type: String, required: true })
  ip_hash: string;

  @Prop({ type: String, required: true })
  user_agent_hash: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  occurred_at: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ actor_user_id: 1, occurred_at: -1 });
AuditLogSchema.index({ occurred_at: -1 });

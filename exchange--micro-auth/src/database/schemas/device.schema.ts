import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceDocument = Device & Document;

@Schema({
  collection: 'devices',
  timestamps: { createdAt: 'first_seen_at' },
  versionKey: false,
})
export class Device {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  display_name: string;

  @Prop({ type: String, required: true, index: true })
  device_fingerprint_hash: string;

  @Prop({ type: String }) // e.g., "Windows", "macOS", "Linux", "iOS", "Android", "Unknown"
  platform?: string;

  @Prop({ type: String }) // e.g., "Desktop", "Mobile", "Tablet"
  device_type?: string;

  @Prop({ type: String }) // e.g., "Chrome", "Safari", "Firefox", "Edge"
  browser?: string;

  @Prop({ type: String }) // Original user-agent string
  user_agent?: string;

  @Prop({ type: Date, default: Date.now })
  first_seen_at: Date;

  @Prop({ type: Date, default: Date.now })
  last_seen_at: Date;

  @Prop({ type: String })
  last_ip_hash?: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.index({ user_id: 1 });
DeviceSchema.index({ device_fingerprint_hash: 1, user_id: 1 });

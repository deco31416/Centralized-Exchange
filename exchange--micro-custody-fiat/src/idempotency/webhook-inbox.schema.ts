import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WebhookInboxEntryDocument = HydratedDocument<WebhookInboxEntry>;

@Schema({
  collection: 'webhook_inbox',
  timestamps: true,
})
export class WebhookInboxEntry {
  @Prop({ required: true })
  provider!: string;

  @Prop({ required: true })
  routeKey!: string;

  @Prop({ required: true, unique: true, index: true })
  idempotencyKey!: string;

  @Prop({ type: Object, required: true })
  headers!: Record<string, unknown>;

  @Prop({ type: Object, required: true })
  body!: Record<string, unknown>;

  @Prop({ default: 'received', index: true })
  status!: 'received' | 'processing' | 'processed' | 'failed';
}

export const WebhookInboxEntrySchema = SchemaFactory.createForClass(WebhookInboxEntry);

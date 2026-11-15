import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OutboxEventDocument = HydratedDocument<OutboxEvent>;

@Schema({
  collection: 'outbox_events',
  timestamps: true,
})
export class OutboxEvent {
  @Prop({ required: true })
  eventName!: string;

  @Prop({ required: true })
  version!: string;

  @Prop({ required: true })
  correlationId!: string;

  @Prop({ required: true, unique: true, index: true })
  idempotencyKey!: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;

  @Prop({ default: 'pending', index: true })
  status!: 'pending' | 'published' | 'failed';
}

export const OutboxEventSchema = SchemaFactory.createForClass(OutboxEvent);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InboxEventDocument = HydratedDocument<InboxEvent>;

@Schema({
  collection: 'inbox_events',
  timestamps: true,
})
export class InboxEvent {
  @Prop({ required: true })
  eventName!: string;

  @Prop({ required: true })
  version!: string;

  @Prop({ required: true, unique: true, index: true })
  eventId!: string;

  @Prop({ required: true, index: true })
  correlationId!: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;
}

export const InboxEventSchema = SchemaFactory.createForClass(InboxEvent);

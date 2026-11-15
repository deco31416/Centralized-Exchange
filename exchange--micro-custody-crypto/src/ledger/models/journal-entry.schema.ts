import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum JournalEntryStatus {
  PENDING = 'pending',
  POSTED = 'posted',
  REVERSED = 'reversed',
  FAILED = 'failed',
}

/**
 * Journal Entry represents a complete double-entry transaction.
 * Each entry must balance (sum of debits = sum of credits).
 */
@Schema({ timestamps: true, collection: 'journal_entries' })
export class JournalEntry extends Document {
  @Prop({ required: true, unique: true, index: true })
  externalIdempotencyKey: string;

  @Prop({ index: true })
  correlationId: string;

  @Prop({ index: true })
  batchId: string;

  @Prop({ required: true })
  narration: string;

  @Prop({
    required: true,
    enum: JournalEntryStatus,
    default: JournalEntryStatus.PENDING,
  })
  status: JournalEntryStatus;

  @Prop()
  bookedAt: Date;

  @Prop({ index: true })
  reversedEntryId: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry);

JournalEntrySchema.index({ status: 1, createdAt: -1 });
JournalEntrySchema.index({ correlationId: 1, createdAt: -1 });

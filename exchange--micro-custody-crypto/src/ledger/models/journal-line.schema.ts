import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LineDirection {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

/**
 * Journal Line represents a single debit or credit entry in a journal entry.
 * Multiple lines compose a complete double-entry transaction.
 */
@Schema({ timestamps: true, collection: 'journal_lines' })
export class JournalLine extends Document {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'JournalEntry',
    index: true,
  })
  entryId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Account', index: true })
  accountId: Types.ObjectId;

  @Prop({ required: true, enum: LineDirection })
  direction: LineDirection;

  @Prop({ required: true, type: Number })
  amountMinor: number;

  @Prop({ required: true })
  assetCode: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const JournalLineSchema = SchemaFactory.createForClass(JournalLine);

JournalLineSchema.index({ entryId: 1, direction: 1 });
JournalLineSchema.index({ accountId: 1, createdAt: -1 });

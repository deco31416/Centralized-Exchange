import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema({
  collection: 'emails',
  timestamps: { createdAt: 'created_at' },
  versionKey: false,
})
export class Email {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  email_lower: string;

  @Prop({ type: Boolean, default: false })
  is_primary: boolean;

  @Prop({ type: Boolean, default: false })
  is_verified: boolean;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;
}

export const EmailSchema = SchemaFactory.createForClass(Email);

EmailSchema.index(
  { user_id: 1, is_primary: 1 },
  {
    unique: true,
    partialFilterExpression: { is_primary: true },
  },
);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TokenPurpose } from '../../shared/types/common.types';

export type VerificationTokenDocument = VerificationToken & Document;

@Schema({
  collection: 'verification_tokens',
  timestamps: { createdAt: 'created_at' },
  versionKey: false,
})
export class VerificationToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Email', index: true })
  email_id?: Types.ObjectId;

  @Prop({
    type: String,
    enum: TokenPurpose,
    required: true,
  })
  purpose: TokenPurpose;

  @Prop({ type: String, required: true, unique: true, index: true })
  token_hash: string;

  @Prop({ type: Date, expires: 0, index: true })
  expires_at: Date;

  @Prop({ type: Date })
  consumed_at?: Date;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);

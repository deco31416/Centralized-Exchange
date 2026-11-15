import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MfaType } from '../../shared/types/common.types';

export type MfaFactorDocument = MfaFactor & Document;

@Schema({
  collection: 'mfa_factors',
  timestamps: { createdAt: 'created_at', updatedAt: 'last_used_at' },
  versionKey: false,
})
export class MfaFactor {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: MfaType,
    required: true,
    index: true,
  })
  type: MfaType;

  @Prop({ type: String })
  totp_secret_enc?: string;

  @Prop({ type: String })
  webauthn_credential_id?: string;

  @Prop({ type: String })
  webauthn_public_key?: string;

  @Prop({ type: Number, default: 0 })
  webauthn_counter?: number;

  @Prop({ type: String, required: true })
  label: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date })
  last_used_at?: Date;
}

export const MfaFactorSchema = SchemaFactory.createForClass(MfaFactor);

MfaFactorSchema.index({ user_id: 1, type: 1 });
MfaFactorSchema.index({ webauthn_credential_id: 1 }, { sparse: true });

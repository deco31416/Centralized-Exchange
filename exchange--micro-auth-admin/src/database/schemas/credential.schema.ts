import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CredentialType } from '../../shared/types/common.types';

export type CredentialDocument = Credential & Document;

@Schema({
  collection: 'credentials',
  timestamps: { createdAt: 'created_at', updatedAt: 'last_used_at' },
  versionKey: false,
})
export class Credential {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: CredentialType,
    required: true,
    index: true,
  })
  type: CredentialType;

  @Prop({ type: String })
  password_hash?: string;

  @Prop({ type: String })
  password_salt?: string;

  @Prop({ type: String })
  webauthn_credential_id?: string;

  @Prop({ type: String })
  webauthn_public_key?: string;

  @Prop({ type: Number, default: 0 })
  webauthn_counter?: number;

  @Prop({ type: String })
  oauth_provider?: string;

  @Prop({ type: String })
  oauth_external_id?: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date })
  last_used_at?: Date;
}

export const CredentialSchema = SchemaFactory.createForClass(Credential);

CredentialSchema.index({ user_id: 1, type: 1 });
CredentialSchema.index({ webauthn_credential_id: 1 }, { sparse: true });

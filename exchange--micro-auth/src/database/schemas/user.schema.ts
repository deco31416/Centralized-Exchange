import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserStatus } from '../../shared/types/common.types';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
})
export class User {
  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
    index: true,
  })
  status: UserStatus;

  @Prop({ type: Types.ObjectId, ref: 'Email', index: true })
  primary_email_id?: Types.ObjectId;

  @Prop({ type: String, index: true })
  org_id?: string;

  // Username (Usuario*)
  @Prop({ type: String, index: true })
  username?: string;

  // Normalized username for uniqueness checks
  @Prop({ type: String, index: true, unique: true, sparse: true })
  username_lower?: string;

  // Profile information (filled during registration step 2)
  @Prop({ type: String })
  first_name?: string;

  @Prop({ type: String })
  last_name?: string;

  @Prop({ type: String })
  phone?: string;

  // Optional: user-managed additional SMS OTP for sensitive actions in dashboard
  // Email OTP remains default for login/register/reset flows.
  @Prop({ type: Boolean, default: false, index: true })
  sms_otp_enabled?: boolean;

  @Prop({ type: String }) // Stored as ISO string YYYY-MM-DD
  birth_date?: string;

  // User country (recommended: ISO 3166-1 alpha-2, e.g. "SV", "MX")
  @Prop({ type: String, index: true })
  country?: string;

  // Security: temporary withdrawals hold after sensitive changes
  @Prop({ type: Date })
  withdrawals_hold_until?: Date;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TunnelSessionDocument = HydratedDocument<TunnelSession>;

/* ─── Auth method states ──────────────────────── */
export type AuthMethodState = 'pending' | 'verified' | 'failed';

@Schema({ _id: false })
export class ParticipantAuth {
  @Prop({ default: 'pending' })
  pin!: AuthMethodState;

  @Prop({ default: 'pending' })
  dynamicKey!: AuthMethodState;

  @Prop({ default: 'pending' })
  emailOtp!: AuthMethodState;
}

export const ParticipantAuthSchema =
  SchemaFactory.createForClass(ParticipantAuth);

/* ─── Session statuses ────────────────────────── */
export type TunnelSessionStatus =
  | 'WAITING'     // Creada, esperando que se una el otro
  | 'ACTIVE'      // Ambos conectados, autorizando
  | 'EXECUTING'   // Ambos autorizados, transfiriendo
  | 'COMPLETED'   // Transferencia exitosa
  | 'CANCELLED'   // Cancelada por un participante
  | 'EXPIRED';    // TTL expirado

/* ─── Session schema ──────────────────────────── */
@Schema({
  collection: 'tunnel_sessions',
  timestamps: true,
})
export class TunnelSession {
  @Prop({ required: true, unique: true, index: true })
  sessionId!: string;

  @Prop({ required: true, unique: true, index: true })
  inviteCode!: string;

  @Prop({ required: true, default: 'WAITING', index: true })
  status!: TunnelSessionStatus;

  /* ── Payment details ── */
  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true })
  amountMinorUnits!: string;

  @Prop()
  concept?: string;

  /* ── Participants ── */
  @Prop({ required: true, index: true })
  creatorUserId!: string;

  @Prop()
  creatorEmail?: string;

  @Prop()
  joinerUserId?: string;

  @Prop()
  joinerEmail?: string;

  /* ── Auth state (embedded sub-documents) ── */
  @Prop({ type: ParticipantAuthSchema, default: () => ({}) })
  creatorAuth!: ParticipantAuth;

  @Prop({ type: ParticipantAuthSchema, default: () => ({}) })
  joinerAuth!: ParticipantAuth;

  /* ── Required methods (from security policy) ── */
  @Prop({ type: [String], default: ['pin', 'dynamicKey', 'emailOtp'] })
  requiredMethods!: string[];

  /* ── Transfer result ── */
  @Prop()
  transferTxId?: string;

  @Prop()
  transferCorrelationId?: string;

  /* ── Timing ── */
  @Prop({ required: true })
  expiresAt!: Date;
}

export const TunnelSessionSchema =
  SchemaFactory.createForClass(TunnelSession);

// TTL index: MongoDB auto-deletes expired sessions after 1 hour of grace
TunnelSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

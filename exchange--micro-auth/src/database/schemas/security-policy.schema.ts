import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/* ─── Métodos de verificación soportados ─────────────── */
export const SECURITY_METHODS = [
  'email_otp',       // OTP enviado al email
  'sms_otp',         // OTP por SMS
  'totp',            // Google Authenticator / Authy
  'signature_pin',   // PIN de firma (micro-signature-keys)
  'dynamic_key',     // Clave dinámica (micro-signature-keys)
] as const;

export type SecurityMethod = (typeof SECURITY_METHODS)[number];

/* ─── Servicios para los cuales se puede configurar ──── */
export const SERVICE_TYPES = [
  'qr_payment',          // Generar QR de pago
  'withdrawal',          // Retiros
  'internal_transfer',   // Transferencias internas
  'p2p_send',            // Envío P2P
  'profile_change',      // Cambios de perfil sensibles
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

/* ─── Schema ─────────────────────────────────────────── */
@Schema({ timestamps: true, collection: 'security_policies' })
export class SecurityPolicy extends Document {
  /**
   * Tipo de servicio al que aplica esta política.
   * Un documento por serviceType (unique).
   */
  @Prop({ required: true, unique: true, enum: SERVICE_TYPES })
  serviceType: string;

  /** Métodos de verificación habilitados por el admin para este servicio */
  @Prop({ type: [String], enum: SECURITY_METHODS, default: SECURITY_METHODS as unknown as string[] })
  allowedMethods: string[];

  /** Mínimo de métodos que el usuario debe aprobar antes de proceder */
  @Prop({ required: true, default: 1, min: 0, max: 5 })
  minRequired: number;

  /** Si la política está activa. Si false, no se requiere verificación */
  @Prop({ default: true })
  isActive: boolean;

  /** Admin que realizó la última modificación */
  @Prop()
  lastModifiedBy?: string;
}

export const SecurityPolicySchema = SchemaFactory.createForClass(SecurityPolicy);

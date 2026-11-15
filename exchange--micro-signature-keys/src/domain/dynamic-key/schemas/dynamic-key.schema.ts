import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DynamicKeyDocument = DynamicKey & Document;

@Schema({ timestamps: true, collection: 'dynamic_keys' })
export class DynamicKey {
  /** ID del usuario */
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  /** Secret TOTP cifrado con AES-256-GCM */
  @Prop({ required: true })
  secret: string;

  /** IV (initialization vector) para descifrar el secret */
  @Prop({ required: true })
  iv: string;

  /** Auth tag de AES-GCM */
  @Prop({ required: true })
  authTag: string;

  /** Longitud del código (2, 3, 4, 6, 8 dígitos) */
  @Prop({ required: true, default: 6 })
  keyLength: number;

  /** Período de rotación en segundos (default 60 = 1 minuto) */
  @Prop({ required: true, default: 60 })
  periodSeconds: number;

  /** Si la clave dinámica está habilitada */
  @Prop({ default: true })
  isEnabled: boolean;

  /** Número de intentos fallidos consecutivos */
  @Prop({ default: 0 })
  failedAttempts: number;

  /** Bloqueado hasta (null = no bloqueado) */
  @Prop({ type: Date, default: null })
  lockedUntil: Date | null;

  /** Fecha de activación */
  @Prop()
  activatedAt: Date;
}

export const DynamicKeySchema = SchemaFactory.createForClass(DynamicKey);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SignatureDocument = Signature & Document;

@Schema({ timestamps: true, collection: 'signatures' })
export class Signature {
  /** ID del usuario (del JWT / gateway) */
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  /** Hash del PIN (argon2 o bcrypt) — NUNCA almacenamos el PIN en texto plano */
  @Prop({ required: true })
  pinHash: string;

  /** Longitud configurada del PIN (2, 3, 4, 6, 8) */
  @Prop({ required: true, default: 6 })
  pinLength: number;

  /** Número de intentos fallidos consecutivos */
  @Prop({ default: 0 })
  failedAttempts: number;

  /** Bloqueado hasta (null = no bloqueado) */
  @Prop({ type: Date, default: null })
  lockedUntil: Date | null;

  /** Si el usuario tiene firma activa */
  @Prop({ default: true })
  isActive: boolean;

  /** Fecha del último cambio de PIN */
  @Prop({ type: Date })
  lastChangedAt: Date;
}

export const SignatureSchema = SchemaFactory.createForClass(Signature);

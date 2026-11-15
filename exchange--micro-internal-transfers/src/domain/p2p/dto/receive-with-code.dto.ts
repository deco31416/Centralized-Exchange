import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

/**
 * DTO para reclamar un pago P2P usando código de 6 dígitos.
 * El pagador escanea el QR → extrae el code → lo envía aquí.
 */
export class ReceiveWithCodeDto {
  /** Código de 6 dígitos extraído del QR */
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Code must be exactly 6 digits' })
  code!: string;

  /** ID del usuario que paga (el que escaneó el QR) */
  @IsString()
  @IsNotEmpty()
  toUserId!: string;

  /** OTP de verificación (si el monto lo requiere) */
  @IsOptional()
  @IsString()
  otp?: string;

  /** Email para envío de OTP (si se necesita generar uno) */
  @IsOptional()
  @IsString()
  email?: string;
}

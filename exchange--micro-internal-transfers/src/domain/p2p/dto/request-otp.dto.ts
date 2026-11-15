import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO para solicitar OTP antes de confirmar una transferencia P2P.
 */
export class RequestOtpDto {
  /** ID del usuario que solicita el OTP */
  @IsString()
  @IsNotEmpty()
  userId!: string;

  /** Email donde enviar el código OTP */
  @IsOptional()
  @IsString()
  email?: string;

  /** ID de correlación para trazar la operación */
  @IsOptional()
  @IsString()
  correlationId?: string;
}

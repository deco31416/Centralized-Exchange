import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO para generar un código P2P de pago/cobro QR.
 * El cobrador genera el código y se lo muestra al pagador como QR.
 */
export class GenerateCodeDto {
  /** ID del usuario que genera el código (cobrador) */
  @IsString()
  @IsNotEmpty()
  fromUserId!: string;

  /** Moneda del pago: MXN, USD, BTC, ETH, etc. */
  @IsString()
  @IsNotEmpty()
  currency!: string;

  /** Monto en unidades menores (centavos para fiat, satoshis para BTC, etc.) */
  @IsString()
  @IsNotEmpty()
  amountMinorUnits!: string;

  /** Tiempo de vida del código en minutos (default: 10, max: 60) */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  ttlMinutes?: number;

  /** Concepto o descripción del cobro (opcional) */
  @IsOptional()
  @IsString()
  concept?: string;
}

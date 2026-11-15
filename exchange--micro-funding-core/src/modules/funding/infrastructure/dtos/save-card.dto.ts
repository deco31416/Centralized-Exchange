import {
  IsCreditCard,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class SaveCardDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsString()
  holderName?: string;

  /**
   * Modo A (PCI-safe): pm_xxx generado por Stripe.js en el cliente.
   * Si se provee, los campos de tarjeta cruda son ignorados.
   */
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  /** Modo B: Solo test mode — requiere que paymentMethodId NO esté presente */
  @ValidateIf((o: SaveCardDto) => !o.paymentMethodId)
  @IsCreditCard()
  cardNumber?: string;

  @ValidateIf((o: SaveCardDto) => !o.paymentMethodId)
  @IsInt()
  @Min(1)
  @Max(12)
  expMonth?: number;

  @ValidateIf((o: SaveCardDto) => !o.paymentMethodId)
  @IsInt()
  @Min(new Date().getFullYear())
  @Max(2100)
  expYear?: number;

  @ValidateIf((o: SaveCardDto) => !o.paymentMethodId)
  @IsString()
  @Length(3, 4)
  cvv?: string;

  @IsOptional()
  @IsString()
  alias?: string;
}
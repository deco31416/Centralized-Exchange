import { IsString, Length, Matches } from 'class-validator';

export class CreateSignatureDto {
  /** PIN numérico (6 dígitos por defecto) */
  @IsString()
  @Matches(/^\d+$/, { message: 'El PIN debe contener solo dígitos' })
  @Length(2, 8, { message: 'El PIN debe tener entre 2 y 8 dígitos' })
  pin: string;

  /** Confirmación del PIN */
  @IsString()
  @Matches(/^\d+$/, { message: 'La confirmación debe contener solo dígitos' })
  @Length(2, 8)
  pinConfirm: string;
}

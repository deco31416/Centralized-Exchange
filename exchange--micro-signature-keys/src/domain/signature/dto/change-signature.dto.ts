import { IsString, Length, Matches } from 'class-validator';

export class ChangeSignatureDto {
  /** PIN actual para verificar identidad */
  @IsString()
  @Matches(/^\d+$/, { message: 'El PIN actual debe contener solo dígitos' })
  @Length(2, 8)
  currentPin: string;

  /** Nuevo PIN */
  @IsString()
  @Matches(/^\d+$/, { message: 'El nuevo PIN debe contener solo dígitos' })
  @Length(2, 8)
  newPin: string;

  /** Confirmación del nuevo PIN */
  @IsString()
  @Matches(/^\d+$/, { message: 'La confirmación debe contener solo dígitos' })
  @Length(2, 8)
  newPinConfirm: string;
}

import { IsString, Matches, Length } from 'class-validator';

export class VerifyDynamicKeyDto {
  @IsString()
  @Matches(/^\d+$/, { message: 'El código debe contener solo dígitos' })
  @Length(2, 8, { message: 'El código debe tener entre 2 y 8 dígitos' })
  code: string;
}

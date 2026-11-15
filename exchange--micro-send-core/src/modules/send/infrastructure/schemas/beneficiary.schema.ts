import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BeneficiaryDocument = Beneficiary & Document;

@Schema({
  collection: 'send_beneficiaries',
  timestamps: true,
  versionKey: false,
})
export class Beneficiary {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['SPEI', 'BANK'] })
  type: 'SPEI' | 'BANK';

  @Prop({ required: true, maxlength: 50 })
  alias: string;

  @Prop({ required: true })
  beneficiaryName: string;

  // SPEI-specific
  @Prop()
  clabe?: string;

  @Prop()
  bankCode?: string;

  // BANK-specific
  @Prop()
  accountNumber?: string;

  @Prop()
  bankName?: string;

  @Prop()
  accountType?: string;
}

export const BeneficiarySchema = SchemaFactory.createForClass(Beneficiary);

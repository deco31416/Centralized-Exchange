import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EscrowStatus } from '../../../shared/enums/p2p.enums';

export type P2PEscrowDocument = P2PEscrow & Document;

@Schema({ timestamps: true })
export class P2PEscrow {
  @Prop({ required: true, unique: true })
  escrowId: string;

  @Prop({ index: true })
  orderId: string;

  @Prop({ required: true, index: true })
  ownerUserId: string;

  @Prop()
  beneficiaryUserId: string;

  @Prop({ required: true })
  assetCode: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  custodyRef: string;

  @Prop()
  ledgerHoldRef: string;

  /** MongoDB ObjectId de la cuenta del vendedor en el ledger de custody-crypto */
  @Prop()
  custodyAccountId: string;

  @Prop({ required: true, enum: Object.values(EscrowStatus), default: EscrowStatus.PENDING })
  status: string;

  @Prop()
  failReason: string;
}

export const P2PEscrowSchema = SchemaFactory.createForClass(P2PEscrow);

P2PEscrowSchema.index({ ownerUserId: 1, status: 1 });

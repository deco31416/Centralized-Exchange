import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NetworkKind = 'BLOCKCHAIN' | 'RAIL_FIAT';
export type FeeType = 'FIXED' | 'PERCENTAGE';

@Schema({ timestamps: true, collection: 'networks' })
export class Network extends Document {
    @Prop({ required: true, unique: true, uppercase: true })
    code: string; // 'BTC', 'ERC20', 'TRC20', 'SOLANA', 'SPEI'

    @Prop({ required: true })
    name: string; // "Bitcoin Mainnet", "Ethereum (ERC20)"

    @Prop({ required: true, enum: ['BLOCKCHAIN', 'RAIL_FIAT'] })
    kind: NetworkKind;

    @Prop({ default: true })
    enabled: boolean;

    // Blockchain specific
    @Prop({ type: Number })
    chainId?: number; // 1 for Ethereum mainnet, 56 for BSC

    @Prop({ type: Number })
    confirmations?: number; // Min confirmations for deposits

    // Withdrawal fees
    @Prop({ type: Number, default: 0 })
    minWithdrawalFee: number; // Minor units

    @Prop({ enum: ['FIXED', 'PERCENTAGE'], default: 'FIXED' })
    withdrawalFeeType: FeeType;

    @Prop({ type: Number, default: 0 })
    withdrawalFeeValue: number;

    // Audit
    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const NetworkSchema = SchemaFactory.createForClass(Network);

NetworkSchema.index({ kind: 1, enabled: 1 });
NetworkSchema.index({ enabled: 1 });

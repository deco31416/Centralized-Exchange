import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SystemAccountType {
    ASSET_HOT_WALLET = 'ASSET_HOT_WALLET', // 1000
    ASSET_COLD_WALLET = 'ASSET_COLD_WALLET', // 1001
    LIABILITY_USER_DEPOSITS = 'LIABILITY_USER_DEPOSITS', // 2000
    LIABILITY_CLEARING = 'LIABILITY_CLEARING', // 2001 (Transit)
    REVENUE_FEES = 'REVENUE_FEES', // 5000
}

@Schema({ timestamps: true, collection: 'system_accounts' })
export class SystemAccount extends Document {
    @Prop({ required: true, unique: true })
    code: string; // e.g., '1000', '2000'

    @Prop({ required: true, enum: SystemAccountType })
    type: SystemAccountType;

    @Prop({ required: true })
    name: string; // 'Hot Wallet BTC'

    @Prop({ required: true })
    currency: string; // 'BTC', 'USD'

    @Prop({ required: true, default: 0 })
    balanceMajor: number; // Stored as number for system reports (or BigInt string if precision critical)

    // For precise accounting, use minor units string like User Wallets
    @Prop({ required: true, default: '0' })
    balanceMinorUnits: string;

    @Prop({ default: true })
    active: boolean;
}

export const SystemAccountSchema = SchemaFactory.createForClass(SystemAccount);

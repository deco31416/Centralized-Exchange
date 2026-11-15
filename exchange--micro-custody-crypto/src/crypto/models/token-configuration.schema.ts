import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { SupportedBlockchain } from './user-address.schema';

export type TokenType = 'native' | 'erc20' | 'bep20' | 'trc20' | 'stellar-asset';
export type TokenStandard = 'ERC-20' | 'BEP-20' | 'TRC-20' | 'NATIVE' | 'Stellar Asset';

/**
 * Token configuration schema
 * Defines supported tokens/coins for deposit monitoring
 */
@Schema({ timestamps: true })
export class TokenConfiguration extends Document {
  @Prop({ required: true, unique: true, index: true })
  assetCode: string; // e.g., 'USDT', 'USDC', 'BNB', 'ETH'

  @Prop({ required: true })
  name: string; // e.g., 'Tether USD', 'USD Coin'

  @Prop({ required: true })
  symbol: string; // e.g., 'USDT', 'USDC'

  @Prop({ required: true, index: true, type: String })
  blockchain: SupportedBlockchain;

  @Prop({ required: true, type: String })
  tokenType: TokenType;

  @Prop({ required: true, type: String })
  standard: TokenStandard;

  @Prop({ type: String })
  contractAddress?: string; // Smart contract address (for ERC-20, BEP-20, etc.)

  @Prop({ required: true, default: 18 })
  decimals: number; // Token decimals (18 for most ERC-20, 6 for USDT/USDC)

  @Prop({ default: true })
  isActive: boolean; // Whether this token is actively monitored

  @Prop({ default: false })
  isStablecoin: boolean; // Flag for stablecoins

  @Prop({ default: 0 })
  minimumDeposit: number; // Minimum deposit amount to process

  @Prop({ type: Object })
  metadata?: {
    coingeckoId?: string;
    website?: string;
    description?: string;
    logoUrl?: string;
  };
}

export const TokenConfigurationSchema = SchemaFactory.createForClass(TokenConfiguration);

// Compound index for unique token per blockchain
TokenConfigurationSchema.index({ assetCode: 1, blockchain: 1 }, { unique: true });

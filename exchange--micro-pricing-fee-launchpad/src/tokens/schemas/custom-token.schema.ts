import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ─── Types ───────────────────────────────────────────────────────────

export type TokenCategory = 'STABLE' | 'ALTCOIN' | 'UTILITY' | 'PARTNER' | 'MEME';
export type PricingModel = 'MANUAL' | 'PEGGED' | 'INTERNAL' | 'SIMULATED';
export type PegType = 'NONE' | 'USD' | 'EUR' | 'BTC' | 'ETH' | 'BNB' | 'USDT' | 'USDC' | 'CUSTOM';
export type SimulationTrend = 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'VOLATILE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

// ─── Embedded Sub-schemas ────────────────────────────────────────────

export class PegConfig {
    @Prop({ type: String, enum: ['NONE', 'USD', 'EUR', 'BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'CUSTOM'], default: 'NONE' })
    pegType: PegType;

    @Prop({ type: Number, default: 1.0 })
    pegRatio: number; // 1 TOKEN = pegRatio × reference (e.g., 0.001 BTC)

    @Prop()
    pegCustomAsset?: string; // If pegType=CUSTOM → reference token code

    @Prop({ type: Number, default: 0.5 })
    maxPegDeviation: number; // Max % deviation before ALERT/BLOCKED

    @Prop({ default: true })
    autoSync: boolean; // Auto-correct price when deviation detected
}

export class SimulationConfig {
    @Prop({ type: String, enum: ['BULLISH', 'BEARISH', 'SIDEWAYS', 'VOLATILE'], default: 'SIDEWAYS' })
    trend: SimulationTrend;

    @Prop({ type: Number, default: 0.5 })
    dailyDriftPct: number; // Average daily price drift % (+0.5 = slightly bullish)

    @Prop({ type: Number, default: 3.0 })
    volatilityPct: number; // Random noise per tick %

    @Prop({ type: Number, default: 300_000 })
    tickIntervalMs: number; // Generate new price every N ms (default: 5 min)

    @Prop({ type: Number, default: 0.3 })
    meanReversion: number; // 0–1 how strongly it reverts to initialPrice

    @Prop({ type: Number, default: 0 })
    initialPrice: number; // Price to revert towards (set on creation)

    @Prop({ default: true })
    enabled: boolean;
}

export class VolatilityProfile {
    @Prop({ type: Number, default: 2.0 })
    expectedDailyChange: number; // Expected daily change %

    @Prop({ type: Number, default: 10.0 })
    maxDailyChange: number; // Max allowed daily change %

    @Prop({ type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'], default: 'MEDIUM' })
    riskLevel: RiskLevel;

    @Prop({ type: Number, default: 0.5 })
    minSpread: number; // Min spread % at zero entropy

    @Prop({ type: Number, default: 5.0 })
    maxSpread: number; // Max spread % at full entropy
}

// ─── Main Schema ─────────────────────────────────────────────────────
//
// CustomToken = definition of a launchpad token.
// The broker controls price, behavior, peg, simulation — everything.
//
// pricingModel determines HOW the base price is calculated:
//   MANUAL     → admin sets currentPriceUsd via API
//   PEGGED     → follows a reference asset (USD, BTC, etc.)
//   INTERNAL   → price from internal order engine (requires integration)
//   SIMULATED  → algorithmic random-walk price generation
//
// ─────────────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'custom_tokens' })
export class CustomToken extends Document {
    @Prop({ required: true, uppercase: true, unique: true })
    tokenCode: string; // DECOX-USD, DECO-GOV, PARTNER-A

    @Prop({ required: true })
    name: string; // "DECOX Dollar"

    @Prop({ type: String, enum: ['STABLE', 'ALTCOIN', 'UTILITY', 'PARTNER', 'MEME'], default: 'ALTCOIN' })
    category: TokenCategory;

    @Prop()
    description?: string;

    @Prop()
    iconUrl?: string;

    // ─── Pricing Model ───────────────────────────────────────────
    @Prop({ type: String, enum: ['MANUAL', 'PEGGED', 'INTERNAL', 'SIMULATED'], required: true, default: 'MANUAL' })
    pricingModel: PricingModel;

    // ─── Peg Configuration (only for PEGGED model) ──────────────
    @Prop({ type: PegConfig, default: () => ({ pegType: 'NONE', pegRatio: 1, maxPegDeviation: 0.5, autoSync: true }) })
    pegConfig: PegConfig;

    // ─── Simulation Configuration (only for SIMULATED model) ────
    @Prop({ type: SimulationConfig, default: () => ({ trend: 'SIDEWAYS', dailyDriftPct: 0.5, volatilityPct: 3, tickIntervalMs: 300000, meanReversion: 0.3, enabled: true }) })
    simulationConfig: SimulationConfig;

    // ─── Volatility Profile (used by entropy engine) ────────────
    @Prop({ type: VolatilityProfile, default: () => ({ expectedDailyChange: 2, maxDailyChange: 10, riskLevel: 'MEDIUM', minSpread: 0.5, maxSpread: 5 }) })
    volatilityProfile: VolatilityProfile;

    // ─── Current Price ───────────────────────────────────────────
    @Prop({ type: Number, required: true })
    currentPriceUsd: number;

    @Prop({ type: Number, default: 0 })
    priceFloorUsd: number; // 0 = no floor

    @Prop({ type: Number, default: 0 })
    priceCeilingUsd: number; // 0 = no ceiling

    // ─── Supply Info ─────────────────────────────────────────────
    @Prop({ type: Number, default: 0 })
    totalSupply: number;

    @Prop({ type: Number, default: 0 })
    circulatingSupply: number;

    // ─── Networks ────────────────────────────────────────────────
    @Prop({ type: [String], default: ['INTERNAL'] })
    supportedNetworks: string[]; // ERC20, BSC, INTERNAL, etc.

    // ─── Status ──────────────────────────────────────────────────
    @Prop({ default: true })
    enabled: boolean;

    @Prop()
    listedAt?: Date;

    @Prop()
    delistedAt?: Date;

    @Prop()
    lastPriceUpdateBy?: string;

    @Prop()
    lastPriceUpdateAt?: Date;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const CustomTokenSchema = SchemaFactory.createForClass(CustomToken);

// ─── Indexes ─────────────────────────────────────────────────────────
// tokenCode unique index is already created by @Prop({ unique: true })
CustomTokenSchema.index({ category: 1 });
CustomTokenSchema.index({ pricingModel: 1 });
CustomTokenSchema.index({ enabled: 1 });
CustomTokenSchema.index({ 'pegConfig.pegType': 1 });

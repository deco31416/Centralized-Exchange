import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomTokenTicker } from '../tokens/schemas/custom-token-ticker.schema';
import { CustomToken } from '../tokens/schemas/custom-token.schema';

// ─── Types ───────────────────────────────────────────────────────────

export type EntropyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface EntropySnapshot {
    score: number;              // 0–1 composite entropy score
    level: EntropyLevel;        // Human-readable level
    internalVolatility: number; // Price volatility from ticker history
    priceChange24hPct: number;  // 24h price change %
    profileRisk: number;        // Risk score from admin-defined volatility profile
    pegDeviation: number;       // Peg deviation % (only for PEGGED tokens)
    recommendedBuySpread: number;  // Negative % (e.g., -3.5)
    recommendedSellSpread: number; // Positive % (e.g., +4.2)
    calculatedAt: Date;
}

// ─── Entropy Engine (Launchpad Version) ──────────────────────────────
//
// Calculates a market entropy indicator based on INTERNAL signals:
//   1. Internal Volatility — price variance from ticker history (last 24h)
//   2. 24h Price Change    — how much has the price moved?
//   3. Profile Risk        — admin-defined risk level (LOW=0.1, MEDIUM=0.3, HIGH=0.6, EXTREME=0.9)
//   4. Peg Deviation       — for PEGGED tokens, how far off is the peg?
//
// Unlike the crypto version (which measured source disagreement between
// CoinGecko/CMC/CryptoCompare), this version uses the broker's own
// internal data since launchpad tokens have no external market.
//
// Higher entropy → wider recommended spreads to protect the exchange.
//
// Spread asymmetry:
//   Price RISING  → wider sell spread (don't sell cheap in a bull run)
//   Price FALLING → wider buy spread (don't buy expensive in a crash)
//
// ─────────────────────────────────────────────────────────────────────

@Injectable()
export class EntropyEngineService {
    private readonly logger = new Logger(EntropyEngineService.name);

    // ─── Tunables (weights must sum to 1.0) ──────────────────────
    private readonly VOLATILITY_WEIGHT = 0.30;
    private readonly PRICE_CHANGE_WEIGHT = 0.35;
    private readonly PROFILE_RISK_WEIGHT = 0.20;
    private readonly PEG_DEVIATION_WEIGHT = 0.15;

    // ─── Normalization Thresholds ────────────────────────────────
    private readonly MAX_INTERNAL_VOLATILITY = 0.10;       // 10% stddev = extreme
    private readonly MAX_PRICE_CHANGE_24H = 20;            // 20% change = extreme
    private readonly MAX_PEG_DEVIATION = 5;                // 5% peg deviation = extreme

    // ─── Spread Mapping ──────────────────────────────────────────
    private readonly BASE_SPREAD_PCT = 0.5;  // Minimum spread at zero entropy
    private readonly MAX_SPREAD_PCT = 8.0;   // Maximum spread at full entropy

    // ─── Risk Level Mapping ──────────────────────────────────────
    private readonly RISK_SCORES: Record<string, number> = {
        LOW: 0.1,
        MEDIUM: 0.3,
        HIGH: 0.6,
        EXTREME: 0.9,
    };

    constructor(
        @InjectModel(CustomTokenTicker.name)
        private readonly tickerModel: Model<CustomTokenTicker>,
        @InjectModel(CustomToken.name)
        private readonly tokenModel: Model<CustomToken>,
    ) { }

    /**
     * Calculate the entropy indicator for a launchpad token.
     * Always returns a recommendation — the PriceBand decides whether to apply it (AUTO) or ignore it (MANUAL).
     */
    async calculate(assetCode: string): Promise<EntropySnapshot | null> {
        if (!assetCode) {
            this.logger.warn('[Entropy] calculate() called with empty assetCode — skipping');
            return null;
        }

        // Get the token definition for profile risk and peg config
        const token = await this.tokenModel
            .findOne({ tokenCode: assetCode.toUpperCase(), enabled: true })
            .exec();

        if (!token) {
            this.logger.warn(`[Entropy] No token found for ${assetCode}`);
            return null;
        }

        // Get latest ticker for 24h change
        const latestTicker = await this.tickerModel
            .findOne({ tokenCode: assetCode.toUpperCase() })
            .sort({ createdAt: -1 })
            .exec();

        if (!latestTicker) {
            this.logger.warn(`[Entropy] No ticker data for ${assetCode}`);
            return null;
        }

        // ─── 1. Internal Volatility ─────────────────────────────
        // Calculate price variance from recent ticker history (last 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentTickers = await this.tickerModel
            .find({ tokenCode: assetCode.toUpperCase(), createdAt: { $gte: oneDayAgo } })
            .select('priceUsd')
            .exec();

        let internalVolatility = 0;
        if (recentTickers.length >= 2) {
            const prices = recentTickers.map(t => t.priceUsd);
            const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
            const variance = prices.reduce((sum, p) => sum + (p - mean) ** 2, 0) / prices.length;
            internalVolatility = mean > 0 ? Math.sqrt(variance) / mean : 0;
        }

        // ─── 2. 24h Price Change ─────────────────────────────────
        const priceChange24hPct = latestTicker.priceChange24h || 0;
        const priceChangeAbs = Math.abs(priceChange24hPct);

        // ─── 3. Profile Risk ─────────────────────────────────────
        const riskLevel = token.volatilityProfile?.riskLevel || 'MEDIUM';
        const profileRisk = this.RISK_SCORES[riskLevel] ?? 0.3;

        // ─── 4. Peg Deviation ────────────────────────────────────
        let pegDeviation = 0;
        if (token.pricingModel === 'PEGGED' && latestTicker.pegDeviation) {
            pegDeviation = Math.abs(latestTicker.pegDeviation);
        }

        // ─── Normalize each component to [0, 1] ─────────────────
        const volNorm = Math.min(internalVolatility / this.MAX_INTERNAL_VOLATILITY, 1);
        const changeNorm = Math.min(priceChangeAbs / this.MAX_PRICE_CHANGE_24H, 1);
        const riskNorm = profileRisk; // Already 0–1
        const pegNorm = Math.min(pegDeviation / this.MAX_PEG_DEVIATION, 1);

        // ─── Weighted Entropy Score ──────────────────────────────
        const score = Math.min(
            this.VOLATILITY_WEIGHT * volNorm +
            this.PRICE_CHANGE_WEIGHT * changeNorm +
            this.PROFILE_RISK_WEIGHT * riskNorm +
            this.PEG_DEVIATION_WEIGHT * pegNorm,
            1,
        );

        const level = this.scoreToLevel(score);

        // ─── Recommended Spreads ─────────────────────────────────
        // Use token's own min/max spread from volatility profile if available
        const minSpread = token.volatilityProfile?.minSpread ?? this.BASE_SPREAD_PCT;
        const maxSpread = token.volatilityProfile?.maxSpread ?? this.MAX_SPREAD_PCT;
        const spreadRange = maxSpread - minSpread;
        const baseCalc = minSpread + spreadRange * score;

        // Asymmetric adjustment based on trend direction
        const directionFactor = priceChange24hPct >= 0 ? 0.6 : 0.4;
        const recommendedSellSpread = Math.round(baseCalc * directionFactor * 2 * 100) / 100;
        const recommendedBuySpread = Math.round(-(baseCalc * (1 - directionFactor) * 2) * 100) / 100;

        return {
            score: Math.round(score * 10000) / 10000,
            level,
            internalVolatility: Math.round(internalVolatility * 100000) / 100000,
            priceChange24hPct,
            profileRisk,
            pegDeviation,
            recommendedBuySpread,
            recommendedSellSpread,
            calculatedAt: new Date(),
        };
    }

    private scoreToLevel(score: number): EntropyLevel {
        if (score < 0.25) return 'LOW';
        if (score < 0.50) return 'MEDIUM';
        if (score < 0.75) return 'HIGH';
        return 'EXTREME';
    }
}

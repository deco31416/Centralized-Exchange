import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FiatRateTicker } from '../pricing/schemas/fiat-rate-ticker.schema';

// ─── Types ───────────────────────────────────────────────────────────

export type EntropyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface EntropySnapshot {
    score: number;              // 0–1 composite entropy score
    level: EntropyLevel;        // Human-readable level
    sourceVolatility: number;   // Coefficient of variation between sources
    rateChange24hPct: number;   // 24h rate change %
    recommendedBuySpread: number;  // Negative % (e.g., -0.3)
    recommendedSellSpread: number; // Positive % (e.g., +0.4)
    calculatedAt: Date;
}

// ─── Fiat Entropy Engine ─────────────────────────────────────────────
//
// Calculates a market entropy indicator for fiat currency pairs based on:
//   1. Source Volatility (50%) — how much do the 3 APIs disagree?
//   2. 24h Rate Change  (50%) — how much has the rate moved in 24h?
//
// Fiat markets are less volatile than crypto, so thresholds and
// recommended spreads are significantly lower.
//
// Spread asymmetry:
//   Rate RISING  → wider sell spread (protect against selling cheap)
//   Rate FALLING → wider buy spread  (protect against buying expensive)
//
// ─────────────────────────────────────────────────────────────────────

@Injectable()
export class EntropyEngineService {
    private readonly logger = new Logger(EntropyEngineService.name);

    // ─── Weights (must sum to 1.0) ───────────────────────────────
    private readonly VOLATILITY_WEIGHT = 0.50;
    private readonly RATE_CHANGE_WEIGHT = 0.50;

    // ─── Normalization Thresholds (fiat-appropriate) ─────────────
    private readonly MAX_SOURCE_VOLATILITY = 0.02;    // 2% deviation between sources = extreme for fiat
    private readonly MAX_RATE_CHANGE_24H = 5;          // 5% change = extreme for fiat

    // ─── Spread Mapping (fiat-appropriate) ───────────────────────
    private readonly BASE_SPREAD_PCT = 0.1;   // 0.1% minimum spread at zero entropy
    private readonly MAX_SPREAD_PCT = 2.0;    // 2.0% maximum spread at full entropy

    constructor(
        @InjectModel(FiatRateTicker.name)
        private readonly tickerModel: Model<FiatRateTicker>,
    ) { }

    /**
     * Calculate the entropy indicator for a currency pair.
     * Always returns a recommendation — the PriceBand decides
     * whether to apply it (AUTO) or ignore it (MANUAL).
     */
    async calculate(pairCode: string): Promise<EntropySnapshot | null> {
        const ticker = await this.tickerModel
            .findOne({ pairCode: pairCode.toUpperCase() })
            .sort({ createdAt: -1 })
            .exec();

        if (!ticker) {
            this.logger.warn(`[Entropy] No ticker data for ${pairCode}`);
            return null;
        }

        // ─── 1. Source Volatility ────────────────────────────────
        // How much do the 3 sources disagree? Coefficient of variation.
        const sourceRates: number[] = [];
        if (ticker.exchangeRateApi?.rate) sourceRates.push(ticker.exchangeRateApi.rate);
        if (ticker.frankfurter?.rate) sourceRates.push(ticker.frankfurter.rate);
        if (ticker.exchangeRateHost?.rate) sourceRates.push(ticker.exchangeRateHost.rate);

        let sourceVolatility = 0;
        if (sourceRates.length >= 2) {
            const mean = sourceRates.reduce((a, b) => a + b, 0) / sourceRates.length;
            const variance = sourceRates.reduce((sum, r) => sum + (r - mean) ** 2, 0) / sourceRates.length;
            sourceVolatility = mean > 0 ? Math.sqrt(variance) / mean : 0;
        }

        // ─── 2. 24h Rate Change ──────────────────────────────────
        const rateChange24hPct = ticker.rateChange24h || 0;
        const rateChangeAbs = Math.abs(rateChange24hPct);

        // ─── Normalize each component to [0, 1] ─────────────────
        const volNorm = Math.min(sourceVolatility / this.MAX_SOURCE_VOLATILITY, 1);
        const changeNorm = Math.min(rateChangeAbs / this.MAX_RATE_CHANGE_24H, 1);

        // ─── Weighted Entropy Score ──────────────────────────────
        const score = Math.min(
            this.VOLATILITY_WEIGHT * volNorm +
            this.RATE_CHANGE_WEIGHT * changeNorm,
            1,
        );

        const level = this.scoreToLevel(score);

        // ─── Recommended Spreads ─────────────────────────────────
        const spreadRange = this.MAX_SPREAD_PCT - this.BASE_SPREAD_PCT;
        const baseCalc = this.BASE_SPREAD_PCT + spreadRange * score;

        // Asymmetric adjustment based on trend direction:
        //   Rising rate  → 60% of extra on sell, 40% on buy
        //   Falling rate → 40% of extra on sell, 60% on buy
        const directionFactor = rateChange24hPct >= 0 ? 0.6 : 0.4;
        const recommendedSellSpread = Math.round(baseCalc * directionFactor * 2 * 100) / 100;
        const recommendedBuySpread = Math.round(-(baseCalc * (1 - directionFactor) * 2) * 100) / 100;

        return {
            score: Math.round(score * 10000) / 10000,
            level,
            sourceVolatility: Math.round(sourceVolatility * 100000) / 100000,
            rateChange24hPct,
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

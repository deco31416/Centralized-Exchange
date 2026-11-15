import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CryptoPriceTicker } from '../pricing/schemas/crypto-price-ticker.schema';

// ─── Types ───────────────────────────────────────────────────────────

export type EntropyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface EntropySnapshot {
    score: number;              // 0–1 composite entropy score
    level: EntropyLevel;        // Human-readable level
    sourceVolatility: number;   // Coefficient of variation between sources
    priceChange24hPct: number;  // 24h price change %
    volume24h: number;          // 24h trading volume USD
    marketCap: number;          // Market capitalization USD
    recommendedBuySpread: number;  // Negative % (e.g., -3.5)
    recommendedSellSpread: number; // Positive % (e.g., +4.2)
    calculatedAt: Date;
}

// ─── Entropy Engine ──────────────────────────────────────────────────
//
// Calculates a market entropy indicator based on:
//   1. Source Volatility   — how much do CoinGecko/CMC/CryptoCompare disagree?
//   2. 24h Price Change    — how much has the price moved in the last 24 hours?
//   3. 24h Volume          — how much activity is there in the market?
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
    private readonly VOLATILITY_WEIGHT = 0.35;
    private readonly PRICE_CHANGE_WEIGHT = 0.40;
    private readonly VOLUME_WEIGHT = 0.25;

    // ─── Normalization Thresholds ────────────────────────────────
    private readonly MAX_SOURCE_VOLATILITY = 0.05;         // 5% deviation between sources = extreme
    private readonly MAX_PRICE_CHANGE_24H = 20;            // 20% change = extreme
    private readonly HIGH_VOLUME_THRESHOLD = 1_000_000_000; // $1B daily volume = high activity

    // ─── Spread Mapping ──────────────────────────────────────────
    private readonly BASE_SPREAD_PCT = 0.5;  // Minimum spread at zero entropy
    private readonly MAX_SPREAD_PCT = 8.0;   // Maximum spread at full entropy

    constructor(
        @InjectModel(CryptoPriceTicker.name)
        private readonly tickerModel: Model<CryptoPriceTicker>,
    ) { }

    /**
     * Calculate the entropy indicator for an asset.
     * Always returns a recommendation — the PriceBand decides whether to apply it (AUTO) or ignore it (MANUAL).
     */
    async calculate(assetCode: string): Promise<EntropySnapshot | null> {
        if (!assetCode) {
            this.logger.warn('[Entropy] calculate() called with empty assetCode — skipping');
            return null;
        }

        const ticker = await this.tickerModel
            .findOne({ assetCode: assetCode.toUpperCase() })
            .sort({ createdAt: -1 })
            .exec();

        if (!ticker) {
            this.logger.warn(`[Entropy] No ticker data for ${assetCode}`);
            return null;
        }

        // ─── 1. Source Volatility ────────────────────────────────
        // How much do the 3 sources disagree?  Coefficient of variation.
        const sourcePrices: number[] = [];
        if (ticker.coingecko?.price) sourcePrices.push(ticker.coingecko.price);
        if (ticker.coinmarketcap?.price) sourcePrices.push(ticker.coinmarketcap.price);
        if (ticker.cryptocompare?.price) sourcePrices.push(ticker.cryptocompare.price);

        let sourceVolatility = 0;
        if (sourcePrices.length >= 2) {
            const mean = sourcePrices.reduce((a, b) => a + b, 0) / sourcePrices.length;
            const variance = sourcePrices.reduce((sum, p) => sum + (p - mean) ** 2, 0) / sourcePrices.length;
            sourceVolatility = mean > 0 ? Math.sqrt(variance) / mean : 0;
        }

        // ─── 2. 24h Price Change ─────────────────────────────────
        const priceChange24hPct = ticker.priceChange24h || 0;
        const priceChangeAbs = Math.abs(priceChange24hPct);

        // ─── 3. Volume ───────────────────────────────────────────
        const volume24h = ticker.volume24h || 0;
        const marketCap = ticker.marketCap || 0;

        // ─── Normalize each component to [0, 1] ─────────────────
        const volNorm = Math.min(sourceVolatility / this.MAX_SOURCE_VOLATILITY, 1);
        const changeNorm = Math.min(priceChangeAbs / this.MAX_PRICE_CHANGE_24H, 1);
        const volumeNorm = Math.min(volume24h / this.HIGH_VOLUME_THRESHOLD, 1);

        // ─── Weighted Entropy Score ──────────────────────────────
        const score = Math.min(
            this.VOLATILITY_WEIGHT * volNorm +
            this.PRICE_CHANGE_WEIGHT * changeNorm +
            this.VOLUME_WEIGHT * volumeNorm,
            1,
        );

        const level = this.scoreToLevel(score);

        // ─── Recommended Spreads ─────────────────────────────────
        const spreadRange = this.MAX_SPREAD_PCT - this.BASE_SPREAD_PCT;
        const baseCalc = this.BASE_SPREAD_PCT + spreadRange * score;

        // Asymmetric adjustment based on trend direction:
        //   Rising price  → 60% of extra on sell, 40% on buy
        //   Falling price → 40% of extra on sell, 60% on buy
        const directionFactor = priceChange24hPct >= 0 ? 0.6 : 0.4;
        const recommendedSellSpread = Math.round(baseCalc * directionFactor * 2 * 100) / 100;
        const recommendedBuySpread = Math.round(-(baseCalc * (1 - directionFactor) * 2) * 100) / 100;

        return {
            score: Math.round(score * 10000) / 10000,
            level,
            sourceVolatility: Math.round(sourceVolatility * 100000) / 100000,
            priceChange24hPct,
            volume24h,
            marketCap,
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

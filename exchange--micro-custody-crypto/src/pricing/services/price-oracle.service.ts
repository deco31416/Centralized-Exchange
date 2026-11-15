import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceProvider, ProviderType } from '../models/price-provider.schema';
import { ExchangeRate, RateSource } from '../models/exchange-rate.schema';

interface RateResult {
  rate: number;
  source: string;
}

/**
 * Service responsible for fetching exchange rates from multiple external sources.
 * Implements caching, fallback mechanisms, and weighted averaging.
 */
@Injectable()
export class PriceOracleService {
  private readonly logger = new Logger(PriceOracleService.name);
  private readonly rateCache: Map<string, { rate: number; expiresAt: Date; sources: Array<{ name: string; rate: number; weight: number }> }> = new Map();
  private readonly CACHE_TTL_SECONDS = 30;
  private readonly MAX_CONSECUTIVE_FAILURES = 5;

  constructor(
    @InjectModel(PriceProvider.name) private priceProviderModel: Model<PriceProvider>,
    @InjectModel(ExchangeRate.name) private exchangeRateModel: Model<ExchangeRate>,
  ) {}

  /**
   * Get base rate with weighted average from multiple sources.
   */
  async getBaseRate(fromAsset: string, toAsset: string): Promise<number> {
    const cacheKey = `${fromAsset}/${toAsset}`;
    const cached = this.rateCache.get(cacheKey);

    if (cached && cached.expiresAt > new Date()) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached.rate;
    }

    const providers = await this.priceProviderModel
      .find({
        enabled: true,
        assetPairs: { $in: [cacheKey] },
        consecutiveFailures: { $lt: this.MAX_CONSECUTIVE_FAILURES },
      })
      .sort({ weight: -1 })
      .exec();

    if (providers.length === 0) {
      this.logger.warn(`No providers available for ${cacheKey}, trying fallback`);
      const fallbackRate = await this.getFallbackRate(fromAsset, toAsset);
      if (fallbackRate) {
        return fallbackRate;
      }
      throw new NotFoundException(`No rate available for ${cacheKey}`);
    }

    const rates: RateResult[] = [];
    const sources: Array<{ name: string; rate: number; weight: number }> = [];

    for (const provider of providers) {
      try {
        const rate = await this.getRateFromProvider(String(provider._id), fromAsset, toAsset);
        if (rate > 0) {
          rates.push({ rate, source: provider.name });
          sources.push({ name: provider.name, rate, weight: provider.weight });
          await this.updateProviderSuccess(String(provider._id));
        }
      } catch (error) {
        this.logger.error(`Provider ${provider.name} failed:`, error);
        await this.updateProviderFailure(String(provider._id));
      }
    }

    if (rates.length === 0) {
      const fallbackRate = await this.getFallbackRate(fromAsset, toAsset);
      if (fallbackRate) {
        return fallbackRate;
      }
      throw new NotFoundException(`All providers failed for ${cacheKey}`);
    }

    const finalRate = this.calculateWeightedAverage(sources);

    // Save to history
    await this.saveRateToHistory(fromAsset, toAsset, finalRate, 'aggregated');

    // Cache
    this.rateCache.set(cacheKey, {
      rate: finalRate,
      expiresAt: new Date(Date.now() + this.CACHE_TTL_SECONDS * 1000),
      sources,
    });

    return finalRate;
  }

  /**
   * Get rate from a specific provider.
   * Mock implementation - in production, this would call actual APIs.
   */
  async getRateFromProvider(providerId: string, fromAsset: string, toAsset: string): Promise<number> {
    const provider = await this.priceProviderModel.findById(providerId).exec();
    
    if (!provider || !provider.enabled) {
      throw new NotFoundException(`Provider ${providerId} not found or disabled`);
    }

    // Mock implementation - replace with actual API calls
    const mockRates: Record<string, number> = {
      // USD pairs
      'USD/BSS': 180,
      'BSS/USD': 1 / 180,
      'USD/BTC': 50000,
      'BTC/USD': 0.00002,
      'USD/ETH': 3000,
      'ETH/USD': 0.000333,
      'USD/BNB': 600,
      'BNB/USD': 1 / 600,
      'USD/EUR': 0.85,
      'EUR/USD': 1.18,
      'USD/USDT': 1.0,
      'USDT/USD': 1.0,
      
      // BTC pairs
      'BTC/ETH': 50000 / 3000, // ~16.67
      'ETH/BTC': 3000 / 50000, // ~0.06
      'BTC/BNB': 50000 / 600, // ~83.33
      'BNB/BTC': 600 / 50000, // ~0.012
      'BTC/BSS': 50000 / 180, // ~277.78
      'BSS/BTC': 180 / 50000, // ~0.0036
      
      // ETH pairs
      'ETH/BNB': 3000 / 600, // 5
      'BNB/ETH': 600 / 3000, // 0.2
      'ETH/BSS': 3000 / 180, // ~16.67
      'BSS/ETH': 180 / 3000, // ~0.06
      
      // BNB pairs
      'BNB/BSS': 600 / 180, // ~3.33
      'BSS/BNB': 180 / 600, // ~0.3
      'BNB/USDT': 600,
      'USDT/BNB': 1 / 600,
    };

    const pair = `${fromAsset}/${toAsset}`;
    const baseRate = mockRates[pair];

    if (!baseRate) {
      throw new NotFoundException(`Rate not available for ${pair}`);
    }

    // Add some variation based on provider weight to simulate different sources
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    return baseRate * (1 + variation);
  }

  /**
   * Update provider configuration.
   */
  async updateProvider(providerId: string, updates: Partial<PriceProvider>): Promise<PriceProvider> {
    const provider = await this.priceProviderModel.findById(providerId).exec();
    
    if (!provider) {
      throw new NotFoundException(`Provider ${providerId} not found`);
    }

    Object.assign(provider, updates);
    await provider.save();
    
    return provider;
  }

  /**
   * Get all providers.
   */
  async getAllProviders(): Promise<PriceProvider[]> {
    return this.priceProviderModel.find().exec();
  }

  /**
   * Create a new provider.
   */
  async createProvider(data: Partial<PriceProvider>): Promise<PriceProvider> {
    const provider = new this.priceProviderModel(data);
    return provider.save();
  }

  /**
   * Save rate to history.
   */
  private async saveRateToHistory(fromAsset: string, toAsset: string, rate: number, source: string): Promise<void> {
    const exchangeRate = new this.exchangeRateModel({
      fromAsset,
      toAsset,
      rate,
      source: this.mapSourceToEnum(source),
      timestamp: new Date(),
    });

    await exchangeRate.save();
  }

  /**
   * Get fallback rate from history.
   */
  private async getFallbackRate(fromAsset: string, toAsset: string): Promise<number | null> {
    const recentRate = await this.exchangeRateModel
      .findOne({ fromAsset, toAsset })
      .sort({ timestamp: -1 })
      .exec();

    if (recentRate && recentRate.timestamp > new Date(Date.now() - 3600000)) { // 1 hour
      this.logger.warn(`Using fallback rate for ${fromAsset}/${toAsset}`);
      return recentRate.rate;
    }

    return null;
  }

  /**
   * Calculate weighted average of rates.
   */
  private calculateWeightedAverage(sources: Array<{ name: string; rate: number; weight: number }>): number {
    if (sources.length === 0) {
      throw new Error('No sources to average');
    }

    const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = sources.reduce((sum, s) => sum + s.rate * s.weight, 0);

    return weightedSum / totalWeight;
  }

  /**
   * Update provider on successful fetch.
   */
  private async updateProviderSuccess(providerId: string): Promise<void> {
    await this.priceProviderModel.findByIdAndUpdate(providerId, {
      lastSuccessfulFetch: new Date(),
      consecutiveFailures: 0,
    }).exec();
  }

  /**
   * Update provider on failed fetch.
   */
  private async updateProviderFailure(providerId: string): Promise<void> {
    await this.priceProviderModel.findByIdAndUpdate(providerId, {
      $inc: { consecutiveFailures: 1 },
    }).exec();
  }

  /**
   * Map source string to RateSource enum.
   */
  private mapSourceToEnum(source: string): RateSource {
    const mapping: Record<string, RateSource> = {
      binance: RateSource.BINANCE,
      coinbase: RateSource.COINBASE,
      banco_central: RateSource.BANCO_CENTRAL,
      mercado_paralelo: RateSource.MERCADO_PARALELO,
      aggregated: RateSource.MANUAL,
    };

    return mapping[source.toLowerCase()] || RateSource.MANUAL;
  }

  /**
   * Get cached rate info for debugging.
   */
  getCachedRateInfo(fromAsset: string, toAsset: string): { rate: number; sources: Array<{ name: string; rate: number; weight: number }>; cached: boolean } | null {
    const cacheKey = `${fromAsset}/${toAsset}`;
    const cached = this.rateCache.get(cacheKey);

    if (cached && cached.expiresAt > new Date()) {
      return {
        rate: cached.rate,
        sources: cached.sources,
        cached: true,
      };
    }

    return null;
  }
}
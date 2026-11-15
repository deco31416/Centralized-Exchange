import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { FiatRateTicker } from './schemas/fiat-rate-ticker.schema';
import { FiatPairConfiguration } from './schemas/fiat-pair-configuration.schema';
import { HttpService } from '@nestjs/axios';
import { NetworkDeltasService } from '../network-deltas/network-deltas.service';
import { PriceBandsService } from '../price-bands/price-bands.service';
import { ApiTrackerService } from '../shared/api-tracker/api-tracker.service';

// ─── Rate data from a single external source ────────────────────────
interface SourceRateData {
    source: string;
    rates: Record<string, number>; // quoteCurrency → rate
    timestamp: Date;
}

@Injectable()
export class PricingService implements OnModuleInit {
    private readonly logger = new Logger(PricingService.name);
    private refreshIntervalRef: ReturnType<typeof setTimeout> | null = null;
    private currentIntervalMs = 3_600_000; // 1 hour default

    constructor(
        @InjectModel(FiatRateTicker.name) private tickerModel: Model<FiatRateTicker>,
        @InjectModel(FiatPairConfiguration.name) private configModel: Model<FiatPairConfiguration>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly networkDeltasService: NetworkDeltasService,
        private readonly priceBandsService: PriceBandsService,
        private readonly apiTracker: ApiTrackerService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) { }

    /**
     * Smart cron: dynamically adjust refresh interval
     * based on remaining API budget each UTC day.
     * Default: ~1 hour between refreshes.
     */
    async onModuleInit() {
        setTimeout(() => this.smartRefreshCycle(), 5000);
    }

    private async smartRefreshCycle() {
        try {
            await this.refreshPrices();
        } catch (error) {
            this.logger.error(`Smart refresh failed: ${error.message}`);
        }

        // Recalculate optimal interval after each refresh
        try {
            const { intervalMs, reason } = await this.apiTracker.getOptimalIntervalMs();
            if (intervalMs !== this.currentIntervalMs) {
                this.logger.log(`⏱️  Smart Cron adjusted: ${this.currentIntervalMs / 1000}s → ${intervalMs / 1000}s (${reason})`);
                this.currentIntervalMs = intervalMs;
            }
        } catch {
            // Keep current interval if tracker fails
        }

        this.refreshIntervalRef = setTimeout(() => this.smartRefreshCycle(), this.currentIntervalMs);
    }

    // ─── Final Rate Calculation ──────────────────────────────────────

    async calculateFinalRate(
        baseCurrency: string,
        quoteCurrency: string,
        corridor: string,
        operation: 'BUY' | 'SELL',
    ) {
        const base = baseCurrency.toUpperCase();
        const quote = quoteCurrency.toUpperCase();
        const pairCode = `${base}_${quote}`;

        // ─── Resolve base rate (direct, inverse, or cross-rate) ──────
        const resolved = await this.resolveRate(base, quote);

        if (!resolved) {
            throw new Error(
                `Rate not found for ${pairCode}. No direct pair, inverse pair, or USD cross-rate available.`,
            );
        }

        const { baseRate, method, via } = resolved;

        // 2. Get corridor delta (transfer method cost adjustment)
        //    For cross-rates, try delta for the computed pair first,
        //    then fall back to the primary leg (e.g., USD_COP leg)
        const delta = await this.networkDeltasService.getDelta(pairCode, corridor);
        const deltaAmount = delta?.totalDeltaUsd ?? 0;
        const deltaBreakdown = delta ? {
            manual: delta.manual?.deltaUsd ?? 0,
            emergency: delta.emergency?.deltaUsd ?? 0,
        } : null;

        // 3. Apply delta (in quote currency per unit of base)
        const rateAfterDelta = baseRate + deltaAmount;

        // 4. Get price band (with entropy indicator + alerts)
        //    For cross-rates without a specific band, use the primary-leg band
        let band = await this.priceBandsService.getBand(pairCode, corridor);
        if (!band && via) {
            // Try band from the first leg (e.g., USD_COP for COP_MXN)
            band = await this.priceBandsService.getBand(`USD_${quote}`, corridor)
                ?? await this.priceBandsService.getBand(`USD_${base}`, corridor);
        }

        // Use EFFECTIVE spreads (auto or manual depending on band mode)
        const buySpread = band?.effectiveBuySpread ?? band?.buySpreadPercentage ?? -0.5;
        const sellSpread = band?.effectiveSellSpread ?? band?.sellSpreadPercentage ?? 0.5;

        // 5. Calculate final rate
        //    User BUY  (buys base currency) = exchange sells → apply sellSpread (positive)
        //    User SELL (sells base currency) = exchange buys → apply buySpread (negative)
        let finalRate: number;
        if (operation === 'BUY') {
            finalRate = rateAfterDelta * (1 + (sellSpread / 100));
        } else {
            finalRate = rateAfterDelta * (1 + (buySpread / 100));
        }

        return {
            baseCurrency: base,
            quoteCurrency: quote,
            pairCode,
            corridor,
            operation,
            baseRate,
            // Cross-rate metadata
            rateMethod: method,   // 'DIRECT' | 'INVERSE' | 'CROSS_USD'
            ...(via ? { crossRateVia: via } : {}),
            corridorDelta: deltaAmount,
            deltaBreakdown,
            rateAfterDelta,
            appliedSpread: operation === 'BUY' ? sellSpread : buySpread,
            finalRate: Math.round(finalRate * 10000) / 10000,
            // Band & Entropy info
            bandMode: band?.mode ?? 'MANUAL',
            entropy: band?.entropy ? {
                score: band.entropy.score,
                level: band.entropy.level,
                recommendedBuySpread: band.entropy.recommendedBuySpread,
                recommendedSellSpread: band.entropy.recommendedSellSpread,
            } : null,
            alertLevel: band?.alertLevel ?? 'SAFE',
            alertMessage: band?.alertMessage,
            timestamp: new Date(),
        };
    }

    // ─── Rate Resolution: Direct → Inverse → Cross via USD ──────────

    /**
     * Resolves a rate between any two currencies using three strategies:
     *   1. DIRECT  — pair exists (e.g., USD_COP → 3704)
     *   2. INVERSE — reverse pair exists (e.g., COP_USD via USD_COP → 1/3704)
     *   3. CROSS_USD — triangulate through USD pivot
     *       COP_MXN = USD_MXN / USD_COP   (both legs pegged to USD)
     */
    private async resolveRate(
        base: string,
        quote: string,
    ): Promise<{ baseRate: number; method: string; via?: string } | null> {
        const MAX_AGE_MS = 120_000;

        // ── Strategy 1: Direct pair ────────────────────────────────
        const directPair = `${base}_${quote}`;
        let ticker = await this.getOrRefreshTicker(directPair, MAX_AGE_MS);
        if (ticker) {
            return { baseRate: ticker.finalRate, method: 'DIRECT' };
        }

        // ── Strategy 2: Inverse pair ───────────────────────────────
        const inversePair = `${quote}_${base}`;
        ticker = await this.getOrRefreshTicker(inversePair, MAX_AGE_MS);
        if (ticker && ticker.finalRate > 0) {
            const inverseRate = 1 / ticker.finalRate;
            this.logger.log(`[CrossRate] ${directPair} resolved via INVERSE of ${inversePair}: ${inverseRate.toFixed(6)}`);
            return { baseRate: inverseRate, method: 'INVERSE', via: inversePair };
        }

        // ── Strategy 3: Cross-rate via USD pivot ───────────────────
        //    base_quote = USD_quote / USD_base
        //    Example: COP_MXN = USD_MXN / USD_COP
        if (base !== 'USD' && quote !== 'USD') {
            const usdBase = await this.getOrRefreshTicker(`USD_${base}`, MAX_AGE_MS);
            const usdQuote = await this.getOrRefreshTicker(`USD_${quote}`, MAX_AGE_MS);

            if (usdBase?.finalRate && usdQuote?.finalRate && usdBase.finalRate > 0) {
                const crossRate = usdQuote.finalRate / usdBase.finalRate;
                this.logger.log(
                    `[CrossRate] ${directPair} resolved via USD pivot: ` +
                    `USD_${quote}(${usdQuote.finalRate}) / USD_${base}(${usdBase.finalRate}) = ${crossRate.toFixed(6)}`,
                );
                return { baseRate: crossRate, method: 'CROSS_USD', via: `USD_${base} + USD_${quote}` };
            }

            // Also try with EUR as secondary pivot if USD legs missing
            const eurBase = await this.getOrRefreshTicker(`EUR_${base}`, MAX_AGE_MS);
            const eurQuote = await this.getOrRefreshTicker(`EUR_${quote}`, MAX_AGE_MS);

            if (eurBase?.finalRate && eurQuote?.finalRate && eurBase.finalRate > 0) {
                const crossRate = eurQuote.finalRate / eurBase.finalRate;
                this.logger.log(
                    `[CrossRate] ${directPair} resolved via EUR pivot: ` +
                    `EUR_${quote}(${eurQuote.finalRate}) / EUR_${base}(${eurBase.finalRate}) = ${crossRate.toFixed(6)}`,
                );
                return { baseRate: crossRate, method: 'CROSS_EUR', via: `EUR_${base} + EUR_${quote}` };
            }
        }

        return null;
    }

    /**
     * Get latest ticker, refreshing on-demand if stale or missing.
     */
    private async getOrRefreshTicker(pairCode: string, maxAgeMs: number): Promise<FiatRateTicker | null> {
        let ticker = await this.getLatestRate(pairCode);

        if (!ticker || (Date.now() - new Date(ticker.createdAt).getTime()) > maxAgeMs) {
            const config = await this.configModel.findOne({ pairCode, enabled: true }).exec();
            if (config) {
                this.logger.log(`[OnDemand] Rate for ${pairCode} is ${ticker ? 'stale' : 'missing'}, fetching...`);
                await this.processSinglePair(config);
                ticker = await this.getLatestRate(pairCode);
            }
        }

        return ticker;
    }

    // ─── Read Operations ─────────────────────────────────────────────

    async getLatestRate(pairCode: string): Promise<FiatRateTicker | null> {
        return this.tickerModel
            .findOne({ pairCode: pairCode.toUpperCase() })
            .sort({ createdAt: -1 })
            .exec();
    }

    async getAllLatestRates(): Promise<FiatRateTicker[]> {
        const configs = await this.configModel.find({ enabled: true }).exec();
        const tickers: FiatRateTicker[] = [];

        for (const config of configs) {
            const ticker = await this.tickerModel
                .findOne({ pairCode: config.pairCode })
                .sort({ createdAt: -1 })
                .exec();
            if (ticker) tickers.push(ticker);
        }

        return tickers;
    }

    // ─── Refresh ─────────────────────────────────────────────────────

    async refreshPrices() {
        this.logger.log('Refreshing fiat rates from external APIs...');
        const configs = await this.configModel.find({ enabled: true }).exec();

        // Group by baseCurrency for efficient API calls
        // (one API call returns ALL quote rates for a base currency)
        const grouped = new Map<string, FiatPairConfiguration[]>();
        for (const config of configs) {
            const list = grouped.get(config.baseCurrency) || [];
            list.push(config);
            grouped.set(config.baseCurrency, list);
        }

        for (const [base, pairs] of grouped.entries()) {
            const quotes = [...new Set(pairs.map(p => p.quoteCurrency))];
            const allSources = [...new Set(pairs.flatMap(p => p.sources as string[]))];

            // Fetch from all configured sources in one batch per base currency
            const sourceResults = await this.fetchAllSources(base, quotes, allSources);

            for (const pair of pairs) {
                try {
                    await this.processPairRate(pair, sourceResults);
                } catch (error) {
                    this.logger.error(`Failed to process rate for ${pair.pairCode}: ${error.message}`);
                }
            }
        }
    }

    /**
     * Process a single pair on-demand (used by calculateFinalRate when stale).
     */
    private async processSinglePair(config: FiatPairConfiguration) {
        const sourceResults = await this.fetchAllSources(
            config.baseCurrency,
            [config.quoteCurrency],
            config.sources as string[],
        );
        await this.processPairRate(config, sourceResults);
    }

    private async processPairRate(config: FiatPairConfiguration, sourceResults: SourceRateData[]) {
        const rates: number[] = [];
        const sourcesData: any = {};

        for (const sr of sourceResults) {
            const rate = sr.rates[config.quoteCurrency];
            if (rate && rate > 0) {
                rates.push(rate);
                const fieldName = this.sourceToFieldName(sr.source);
                sourcesData[fieldName] = { rate, timestamp: sr.timestamp };
            }
        }

        if (rates.length === 0) {
            this.logger.warn(`No rates fetched for ${config.pairCode}`);
            return;
        }

        // Aggregate
        let finalRate = 0;
        switch (config.aggregationStrategy) {
            case 'MAX': finalRate = Math.max(...rates); break;
            case 'MIN': finalRate = Math.min(...rates); break;
            case 'MEDIAN':
                const sorted = [...rates].sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                finalRate = sorted.length % 2 !== 0
                    ? sorted[mid]
                    : (sorted[mid - 1] + sorted[mid]) / 2;
                break;
            case 'AVERAGE':
            default:
                finalRate = rates.reduce((a, b) => a + b, 0) / rates.length;
                break;
        }

        // Calculate 24h change from previous ticker
        const previous = await this.tickerModel
            .findOne({ pairCode: config.pairCode })
            .sort({ createdAt: -1 })
            .exec();
        const rateChange24h = previous?.finalRate
            ? ((finalRate - previous.finalRate) / previous.finalRate) * 100
            : 0;

        // Save ticker
        const ticker = new this.tickerModel({
            baseCurrency: config.baseCurrency,
            quoteCurrency: config.quoteCurrency,
            pairCode: config.pairCode,
            baseRate: finalRate,
            finalRate,
            aggregationStrategy: config.aggregationStrategy,
            ...sourcesData,
            rateChange24h,
            stale: false,
            outlierDetected: false,
        });

        await ticker.save();
        this.logger.log(
            `Updated ${config.pairCode}: ${finalRate.toFixed(4)} ` +
            `(${config.aggregationStrategy}) | chg=${rateChange24h.toFixed(4)}%`,
        );
    }

    private sourceToFieldName(source: string): string {
        const map: Record<string, string> = {
            EXCHANGERATE_API: 'exchangeRateApi',
            FRANKFURTER: 'frankfurter',
            EXCHANGERATE_HOST: 'exchangeRateHost',
            FLOATRATES: 'floatRates',
            FAWAZ_CURRENCY: 'fawazCurrency',
        };
        return map[source] || source.toLowerCase();
    }

    // ─── External API Fetchers ───────────────────────────────────────

    private async fetchAllSources(
        base: string,
        quotes: string[],
        sources: string[],
    ): Promise<SourceRateData[]> {
        const results: SourceRateData[] = [];

        if (sources.includes('EXCHANGERATE_API')) {
            const r = await this.fetchExchangeRateApi(base);
            if (r) results.push(r);
        }
        if (sources.includes('FRANKFURTER')) {
            const r = await this.fetchFrankfurter(base, quotes);
            if (r) results.push(r);
        }
        if (sources.includes('EXCHANGERATE_HOST')) {
            const r = await this.fetchExchangeRateHost(base, quotes);
            if (r) results.push(r);
        }
        if (sources.includes('FLOATRATES')) {
            const r = await this.fetchFloatRates(base);
            if (r) results.push(r);
        }
        if (sources.includes('FAWAZ_CURRENCY')) {
            const r = await this.fetchFawazCurrency(base);
            if (r) results.push(r);
        }

        return results;
    }

    /**
     * ExchangeRate-API — open.er-api.com
     * Free, no key required. Returns all rates for a base currency.
     * Docs: https://www.exchangerate-api.com/docs/free
     */
    private async fetchExchangeRateApi(base: string): Promise<SourceRateData | null> {
        if (!(await this.apiTracker.canCall('EXCHANGERATE_API'))) {
            this.logger.warn(`[ExchangeRate-API] Daily budget exhausted, skipping`);
            return null;
        }

        const baseUrl = this.configService.get<string>(
            'EXCHANGERATE_API_URL',
            'https://open.er-api.com/v6/latest',
        );

        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${baseUrl}/${base.toUpperCase()}`, { timeout: 10000 }),
            );

            if (data?.result !== 'success' || !data?.rates) {
                this.logger.warn(`[ExchangeRate-API] Invalid response for ${base}`);
                return null;
            }

            this.logger.debug(`[ExchangeRate-API] Fetched rates for ${base}`);
            await this.apiTracker.trackCall('EXCHANGERATE_API');
            return { source: 'EXCHANGERATE_API', rates: data.rates, timestamp: new Date() };
        } catch (error) {
            await this.apiTracker.trackCall('EXCHANGERATE_API', true);
            if (error?.response?.status === 429) {
                await this.apiTracker.trackRateLimit('EXCHANGERATE_API');
            }
            this.logger.error(`[ExchangeRate-API] Failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Frankfurter — api.frankfurter.app
     * Free, no key required. Based on European Central Bank data.
     * Note: May not have all currencies (VES, SVC may be unavailable).
     * Docs: https://www.frankfurter.app/docs
     */
    private async fetchFrankfurter(base: string, quotes: string[]): Promise<SourceRateData | null> {
        if (!(await this.apiTracker.canCall('FRANKFURTER'))) {
            this.logger.warn(`[Frankfurter] Daily budget exhausted, skipping`);
            return null;
        }

        const baseUrl = this.configService.get<string>(
            'FRANKFURTER_API_URL',
            'https://api.frankfurter.app',
        );

        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${baseUrl}/latest`, {
                    params: {
                        from: base.toUpperCase(),
                        to: quotes.join(','),
                    },
                    timeout: 10000,
                }),
            );

            if (!data?.rates) {
                this.logger.warn(`[Frankfurter] Invalid response for ${base}`);
                return null;
            }

            this.logger.debug(`[Frankfurter] Fetched rates for ${base}`);
            await this.apiTracker.trackCall('FRANKFURTER');
            return { source: 'FRANKFURTER', rates: data.rates, timestamp: new Date() };
        } catch (error) {
            await this.apiTracker.trackCall('FRANKFURTER', true);
            if (error?.response?.status === 429) {
                await this.apiTracker.trackRateLimit('FRANKFURTER');
            }
            this.logger.error(`[Frankfurter] Failed: ${error.message}`);
            return null;
        }
    }

    /**
     * exchangerate.host — api.exchangerate.host
     * Optional API key. Broad currency support.
     * Docs: https://exchangerate.host
     */
    private async fetchExchangeRateHost(base: string, quotes: string[]): Promise<SourceRateData | null> {
        if (!(await this.apiTracker.canCall('EXCHANGERATE_HOST'))) {
            this.logger.warn(`[exchangerate.host] Daily budget exhausted, skipping`);
            return null;
        }

        const baseUrl = this.configService.get<string>(
            'EXCHANGERATE_HOST_URL',
            'https://api.exchangerate.host',
        );
        const apiKey = this.configService.get<string>('EXCHANGERATE_HOST_API_KEY', '');

        try {
            const params: any = {
                base: base.toUpperCase(),
                symbols: quotes.join(','),
            };
            if (apiKey) params.access_key = apiKey;

            const { data } = await firstValueFrom(
                this.httpService.get(`${baseUrl}/latest`, { params, timeout: 10000 }),
            );

            if (!data?.rates) {
                this.logger.warn(`[exchangerate.host] Invalid response for ${base}`);
                return null;
            }

            this.logger.debug(`[exchangerate.host] Fetched rates for ${base}`);
            await this.apiTracker.trackCall('EXCHANGERATE_HOST');
            return { source: 'EXCHANGERATE_HOST', rates: data.rates, timestamp: new Date() };
        } catch (error) {
            await this.apiTracker.trackCall('EXCHANGERATE_HOST', true);
            if (error?.response?.status === 429) {
                await this.apiTracker.trackRateLimit('EXCHANGERATE_HOST');
            }
            this.logger.error(`[exchangerate.host] Failed: ${error.message}`);
            return null;
        }
    }

    // ─── FiatPairConfiguration CRUD ──────────────────────────────────

    /**
     * FloatRates — floatrates.com
     * Free, no key required. Daily rates from multiple central banks.
     * Returns lowercase currency codes. Broad LATAM coverage (no VES/SVC).
     * Docs: https://www.floatrates.com
     */
    private async fetchFloatRates(base: string): Promise<SourceRateData | null> {
        if (!(await this.apiTracker.canCall('FLOATRATES'))) {
            this.logger.warn(`[FloatRates] Daily budget exhausted, skipping`);
            return null;
        }

        const baseUrl = this.configService.get<string>(
            'FLOATRATES_URL',
            'https://www.floatrates.com/daily',
        );

        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${baseUrl}/${base.toLowerCase()}.json`, { timeout: 10000 }),
            );

            if (!data || typeof data !== 'object') {
                this.logger.warn(`[FloatRates] Invalid response for ${base}`);
                return null;
            }

            // FloatRates uses lowercase keys: { cop: { rate: 3705 }, mxn: { rate: 17.15 } }
            const rates: Record<string, number> = {};
            for (const [key, value] of Object.entries(data)) {
                if (value && typeof value === 'object' && 'rate' in value) {
                    rates[key.toUpperCase()] = (value as any).rate;
                }
            }

            this.logger.debug(`[FloatRates] Fetched ${Object.keys(rates).length} rates for ${base}`);
            await this.apiTracker.trackCall('FLOATRATES');
            return { source: 'FLOATRATES', rates, timestamp: new Date() };
        } catch (error) {
            await this.apiTracker.trackCall('FLOATRATES', true);
            if (error?.response?.status === 429) {
                await this.apiTracker.trackRateLimit('FLOATRATES');
            }
            this.logger.error(`[FloatRates] Failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Fawaz Currency API — currency-api.pages.dev (CDN global)
     * Free, no key required. 100% open source. Fastest of all.
     * Covers ALL currencies including VES and SVC.
     * Docs: https://github.com/fawazahmed0/exchange-api
     */
    private async fetchFawazCurrency(base: string): Promise<SourceRateData | null> {
        if (!(await this.apiTracker.canCall('FAWAZ_CURRENCY'))) {
            this.logger.warn(`[Fawaz] Daily budget exhausted, skipping`);
            return null;
        }

        const baseUrl = this.configService.get<string>(
            'FAWAZ_CURRENCY_URL',
            'https://latest.currency-api.pages.dev/v1/currencies',
        );

        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${baseUrl}/${base.toLowerCase()}.json`, { timeout: 10000 }),
            );

            const ratesObj = data?.[base.toLowerCase()];
            if (!ratesObj || typeof ratesObj !== 'object') {
                this.logger.warn(`[Fawaz] Invalid response for ${base}`);
                return null;
            }

            // Fawaz uses lowercase keys: { usd: { cop: 3699, mxn: 17.17 } }
            const rates: Record<string, number> = {};
            for (const [key, value] of Object.entries(ratesObj)) {
                if (typeof value === 'number' && value > 0) {
                    rates[key.toUpperCase()] = value;
                }
            }

            this.logger.debug(`[Fawaz] Fetched ${Object.keys(rates).length} rates for ${base}`);
            await this.apiTracker.trackCall('FAWAZ_CURRENCY');
            return { source: 'FAWAZ_CURRENCY', rates, timestamp: new Date() };
        } catch (error) {
            await this.apiTracker.trackCall('FAWAZ_CURRENCY', true);
            if (error?.response?.status === 429) {
                await this.apiTracker.trackRateLimit('FAWAZ_CURRENCY');
            }
            this.logger.error(`[Fawaz] Failed: ${error.message}`);
            return null;
        }
    }

    // ─── FiatPairConfiguration CRUD (below) ──────────────────────────

    async getConfigurations(): Promise<FiatPairConfiguration[]> {
        return this.configModel.find().sort({ pairCode: 1 }).exec();
    }

    async upsertConfiguration(dto: {
        baseCurrency: string;
        quoteCurrency: string;
        sources?: string[];
        aggregationStrategy?: string;
        enabled?: boolean;
    }): Promise<FiatPairConfiguration> {
        const base = dto.baseCurrency.toUpperCase();
        const quote = dto.quoteCurrency.toUpperCase();
        const pairCode = `${base}_${quote}`;

        return this.configModel.findOneAndUpdate(
            { pairCode },
            {
                baseCurrency: base,
                quoteCurrency: quote,
                pairCode,
                sources: dto.sources || ['EXCHANGERATE_API', 'FRANKFURTER', 'EXCHANGERATE_HOST'],
                aggregationStrategy: dto.aggregationStrategy || 'AVERAGE',
                enabled: dto.enabled ?? true,
            },
            { upsert: true, new: true },
        ).exec();
    }

    async deleteConfiguration(baseCurrency: string, quoteCurrency: string): Promise<void> {
        const pairCode = `${baseCurrency}_${quoteCurrency}`.toUpperCase();
        await this.configModel.deleteOne({ pairCode }).exec();
    }
}

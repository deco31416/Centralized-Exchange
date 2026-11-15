import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { CryptoPriceTicker } from './schemas/crypto-price-ticker.schema';
import { PriceConfiguration } from './schemas/price-configuration.schema';
import { HttpService } from '@nestjs/axios';
import { NetworkDeltasService } from '../network-deltas/network-deltas.service';
import { PriceBandsService } from '../price-bands/price-bands.service';
import { ApiTrackerService } from '../shared/api-tracker/api-tracker.service';

// ─── Rich price data from external sources ─────────────────────────
interface SourcePriceResult {
    price: number;
    volume24h?: number;
    priceChange24h?: number;  // % change in 24h
    marketCap?: number;
}

// CoinGecko usa slugs (bitcoin, ethereum) en vez de symbols (BTC, ETH)
// Static fallback map — extended dynamically from Asset Registry
const COINGECKO_ID_MAP: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    USDC: 'usd-coin',
    BNB: 'binancecoin',
    SOL: 'solana',
    XRP: 'ripple',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    DOT: 'polkadot',
    MATIC: 'matic-network',
    AVAX: 'avalanche-2',
    LINK: 'chainlink',
    UNI: 'uniswap',
    LTC: 'litecoin',
    TRX: 'tron',
};

@Injectable()
export class PricingService implements OnModuleInit {
    private readonly logger = new Logger(PricingService.name);
    private refreshIntervalRef: ReturnType<typeof setInterval> | null = null;
    private currentIntervalMs = 3_600_000; // Start at 1h, then auto-adjust

    // Dynamic CoinGecko ID map — merged from Registry (extends the static map)
    private dynamicCoinIdMap: Record<string, string> = {};

    constructor(
        @InjectModel(CryptoPriceTicker.name) private tickerModel: Model<CryptoPriceTicker>,
        @InjectModel(PriceConfiguration.name) private configModel: Model<PriceConfiguration>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly networkDeltasService: NetworkDeltasService,
        private readonly priceBandsService: PriceBandsService,
        private readonly apiTracker: ApiTrackerService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) { }

    /**
     * Smart cron: instead of fixed 30s, dynamically adjust refresh interval
     * based on remaining API budget each UTC day.
     */
    async onModuleInit() {
        // Start with initial refresh after 5 seconds
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

        // Schedule next run
        this.refreshIntervalRef = setTimeout(() => this.smartRefreshCycle(), this.currentIntervalMs);
    }

    async calculateFinalPrice(assetCode: string, networkCode: string, operation: 'BUY' | 'SELL') {
        // 1. Get Base Price (aggregated from 3 external sources)
        let ticker = await this.getLatestPrice(assetCode);

        // On-demand refresh: if price is missing or stale (> 2 min), fetch fresh
        const MAX_AGE_MS = 120_000; // 2 minutes
        if (!ticker || (Date.now() - new Date(ticker.createdAt).getTime()) > MAX_AGE_MS) {
            this.logger.log(`[OnDemand] Price for ${assetCode} is ${ticker ? 'stale' : 'missing'}, fetching fresh data...`);
            const config = await this.configModel.findOne({ assetCode: assetCode.toUpperCase(), enabled: true }).exec();
            if (config) {
                await this.processAssetPrice(config);
                ticker = await this.getLatestPrice(assetCode);
            }
        }

        if (!ticker) {
            throw new Error(`Price not found for ${assetCode}`);
        }

        // 2. Get Network Delta (manual cost adjustment per network)
        const delta = await this.networkDeltasService.getDelta(assetCode, networkCode);
        const deltaUsd = delta?.totalDeltaUsd ?? 0;
        const deltaBreakdown = delta ? {
            manual: delta.manual?.deltaUsd ?? 0,
            emergency: delta.emergency?.deltaUsd ?? 0,
        } : null;

        // 3. Apply Delta
        const baseWithDelta = ticker.finalBasePriceUsd + deltaUsd;

        // 4. Get Price Band (with entropy indicator + alerts)
        const band = await this.priceBandsService.getBand(assetCode, networkCode);

        // Use EFFECTIVE spreads (auto or manual depending on band mode)
        const buySpread = band?.effectiveBuySpread ?? band?.buySpreadPercentage ?? -5;
        const sellSpread = band?.effectiveSellSpread ?? band?.sellSpreadPercentage ?? 5;

        // 5. Calculate Final Price
        //    User BUY  = exchange sells → apply sell spread (positive markup)
        //    User SELL = exchange buys → apply buy spread (negative markdown)
        let finalPrice: number;
        if (operation === 'BUY') {
            finalPrice = baseWithDelta * (1 + (sellSpread / 100));
        } else {
            finalPrice = baseWithDelta * (1 + (buySpread / 100));
        }

        return {
            assetCode,
            networkCode,
            operation,
            basePrice: ticker.finalBasePriceUsd,
            networkDelta: deltaUsd,
            deltaBreakdown,
            priceAfterDelta: baseWithDelta,
            appliedSpread: operation === 'BUY' ? sellSpread : buySpread,
            finalPrice: Math.round(finalPrice * 100) / 100,
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

    async getLatestPrice(assetCode: string): Promise<CryptoPriceTicker | null> {
        return this.tickerModel
            .findOne({ assetCode: assetCode.toUpperCase() })
            .sort({ createdAt: -1 })
            .exec();
    }

    async createTicker(data: Partial<CryptoPriceTicker>): Promise<CryptoPriceTicker> {
        const ticker = new this.tickerModel(data);
        return ticker.save();
    }

    async refreshPrices() {
        this.logger.log('Refreshing crypto prices from external APIs...');

        const configs = await this.configModel.find({ enabled: true }).exec();

        for (const config of configs) {
            try {
                await this.processAssetPrice(config);
            } catch (error) {
                this.logger.error(`Failed to process price for ${config.assetCode}: ${error.message}`);
            }
        }
    }

    private async processAssetPrice(config: PriceConfiguration) {
        const results: SourcePriceResult[] = [];
        const sourcesData: any = {};

        // 1. Fetch from configured sources (now returns rich data)
        if (config.sources.includes('COINGECKO')) {
            const result = await this.fetchCoingeckoPrice(config.assetCode);
            if (result) {
                results.push(result);
                sourcesData.coingecko = { price: result.price, timestamp: new Date() };
            }
        }

        if (config.sources.includes('COINMARKETCAP')) {
            const result = await this.fetchCoinMarketCapPrice(config.assetCode);
            if (result) {
                results.push(result);
                sourcesData.coinmarketcap = { price: result.price, timestamp: new Date() };
            }
        }

        if (config.sources.includes('CRYPTOCOMPARE')) {
            const result = await this.fetchCryptoComparePrice(config.assetCode);
            if (result) {
                results.push(result);
                sourcesData.cryptocompare = { price: result.price, timestamp: new Date() };
            }
        }

        if (results.length === 0) {
            this.logger.warn(`No prices fetched for ${config.assetCode}`);
            return;
        }

        // 2. Aggregate price
        const prices = results.map(r => r.price);
        let finalPrice = 0;
        switch (config.aggregationStrategy) {
            case 'MAX': finalPrice = Math.max(...prices); break;
            case 'MIN': finalPrice = Math.min(...prices); break;
            case 'AVERAGE':
            default: finalPrice = prices.reduce((a, b) => a + b, 0) / prices.length; break;
        }

        // 3. Aggregate 24h stats (average from available sources)
        const volumes = results.filter(r => r.volume24h).map(r => r.volume24h!);
        const changes = results.filter(r => r.priceChange24h !== undefined).map(r => r.priceChange24h!);
        const mcaps = results.filter(r => r.marketCap).map(r => r.marketCap!);

        const volume24h = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
        const priceChange24h = changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
        const marketCap = mcaps.length > 0 ? mcaps.reduce((a, b) => a + b, 0) / mcaps.length : 0;

        // 4. Save Ticker
        const ticker = new this.tickerModel({
            assetCode: config.assetCode,
            basePriceUsd: finalPrice,
            finalBasePriceUsd: finalPrice,
            aggregationStrategy: config.aggregationStrategy,
            ...sourcesData,
            priceChange24h,
            volume24h,
            marketCap,
            stale: false,
            outlierDetected: false,
        });

        await ticker.save();
        this.logger.log(
            `Updated ${config.assetCode}: $${finalPrice.toFixed(2)} ` +
            `(${config.aggregationStrategy}) | vol=$${(volume24h / 1e6).toFixed(1)}M | chg=${priceChange24h.toFixed(2)}%`,
        );
    }

    // ─── Real API Fetchers ────────────────────────────────────────────

    /**
     * CoinGecko API - /simple/price (with 24h vol, change, market cap)
     * Docs: https://docs.coingecko.com/reference/simple-price
     */
    private async fetchCoingeckoPrice(asset: string): Promise<SourcePriceResult | null> {
        // Check budget before calling
        if (!(await this.apiTracker.canCall('COINGECKO'))) {
            this.logger.warn(`[CoinGecko] Daily budget exhausted, skipping`);
            return null;
        }

        const baseUrl = this.configService.get<string>('COINGECKO_API_URL', 'https://api.coingecko.com/api/v3');
        const apiKey = this.configService.get<string>('COINGECKO_API_KEY', '');
        const coinId = this.getCoinId(asset.toUpperCase());

        if (!coinId) {
            this.logger.warn(`[CoinGecko] No mapping found for asset: ${asset}`);
            return null;
        }

        try {
            const url = `${baseUrl}/simple/price`;
            const headers: Record<string, string> = {};
            if (apiKey) {
                headers['x-cg-demo-api-key'] = apiKey;
            }

            const { data } = await firstValueFrom(
                this.httpService.get(url, {
                    params: {
                        ids: coinId,
                        vs_currencies: 'usd',
                        include_24hr_vol: 'true',
                        include_24hr_change: 'true',
                        include_market_cap: 'true',
                    },
                    headers,
                    timeout: 10000,
                }),
            );

            const coinData = data?.[coinId];
            const price = coinData?.usd;
            if (typeof price !== 'number') {
                this.logger.warn(`[CoinGecko] Invalid response for ${asset}: ${JSON.stringify(data)}`);
                return null;
            }

            this.logger.debug(`[CoinGecko] ${asset} = $${price}`);
            await this.apiTracker.trackCall('COINGECKO');
            return {
                price,
                volume24h: coinData?.usd_24h_vol,
                priceChange24h: coinData?.usd_24h_change,
                marketCap: coinData?.usd_market_cap,
            };
        } catch (error) {
            await this.apiTracker.trackCall('COINGECKO', true);
            if (error?.response?.status === 429) {
                await this.apiTracker.trackRateLimit('COINGECKO');
            }
            this.logger.error(`[CoinGecko] Failed to fetch ${asset}: ${error.message}`);
            return null;
        }
    }

    /**
     * CoinMarketCap API - /v1/cryptocurrency/quotes/latest
     * Returns price + volume24h + percent_change_24h + market_cap
     */
    private async fetchCoinMarketCapPrice(asset: string): Promise<SourcePriceResult | null> {
        // Check budget before calling
        if (!(await this.apiTracker.canCall('COINMARKETCAP'))) {
            this.logger.warn(`[CMC] Daily budget exhausted, skipping`);
            return null;
        }

        const baseUrl = this.configService.get<string>('COINMARKETCAP_API_URL', 'https://pro-api.coinmarketcap.com');
        const apiKey = this.configService.get<string>('COINMARKETCAP_API_KEY', '');

        if (!apiKey) {
            this.logger.warn(`[CMC] No API key configured, skipping`);
            return null;
        }

        try {
            const url = `${baseUrl}/v1/cryptocurrency/quotes/latest`;
            const { data } = await firstValueFrom(
                this.httpService.get(url, {
                    params: { symbol: asset.toUpperCase(), convert: 'USD' },
                    headers: { 'X-CMC_PRO_API_KEY': apiKey },
                    timeout: 10000,
                }),
            );

            const coinData = data?.data?.[asset.toUpperCase()];
            const entry = Array.isArray(coinData) ? coinData[0] : coinData;
            const quote = entry?.quote?.USD;
            const price = quote?.price;

            if (typeof price !== 'number') {
                this.logger.warn(`[CMC] Invalid response for ${asset}: ${JSON.stringify(data?.status)}`);
                return null;
            }

            this.logger.debug(`[CMC] ${asset} = $${price}`);
            await this.apiTracker.trackCall('COINMARKETCAP');
            return {
                price,
                volume24h: quote?.volume_24h,
                priceChange24h: quote?.percent_change_24h,
                marketCap: quote?.market_cap,
            };
        } catch (error) {
            await this.apiTracker.trackCall('COINMARKETCAP', true);
            const status = error?.response?.status;
            if (status === 429) {
                await this.apiTracker.trackRateLimit('COINMARKETCAP');
            }
            const msg = error?.response?.data?.status?.error_message || error.message;
            this.logger.error(`[CMC] Failed to fetch ${asset} (HTTP ${status}): ${msg}`);
            return null;
        }
    }

    /**
     * CryptoCompare API - /data/pricemultifull
     * Returns full data: PRICE, VOLUME24HOURTO, CHANGEPCT24HOUR, MKTCAP
     */
    private async fetchCryptoComparePrice(asset: string): Promise<SourcePriceResult | null> {
        // Check budget before calling
        if (!(await this.apiTracker.canCall('CRYPTOCOMPARE'))) {
            this.logger.warn(`[CryptoCompare] Daily budget exhausted, skipping`);
            return null;
        }

        const baseUrl = this.configService.get<string>('CRYPTO_API_URL', 'https://min-api.cryptocompare.com');
        const apiKey = this.configService.get<string>('CRYPTO_API_SECRET', '');

        try {
            const url = `${baseUrl}/data/pricemultifull`;
            const headers: Record<string, string> = {};
            if (apiKey) {
                headers['authorization'] = `Apikey ${apiKey}`;
            }

            const { data } = await firstValueFrom(
                this.httpService.get(url, {
                    params: { fsyms: asset.toUpperCase(), tsyms: 'USD' },
                    headers,
                    timeout: 10000,
                }),
            );

            const raw = data?.RAW?.[asset.toUpperCase()]?.USD;
            const price = raw?.PRICE;
            if (typeof price !== 'number') {
                this.logger.warn(`[CryptoCompare] Invalid response for ${asset}: ${JSON.stringify(data)}`);
                return null;
            }

            this.logger.debug(`[CryptoCompare] ${asset} = $${price}`);
            await this.apiTracker.trackCall('CRYPTOCOMPARE');
            return {
                price,
                volume24h: raw?.VOLUME24HOURTO,
                priceChange24h: raw?.CHANGEPCT24HOUR,
                marketCap: raw?.MKTCAP,
            };
        } catch (error) {
            await this.apiTracker.trackCall('CRYPTOCOMPARE', true);
            if (error?.response?.status === 429) {
                await this.apiTracker.trackRateLimit('CRYPTOCOMPARE');
            }
            this.logger.error(`[CryptoCompare] Failed to fetch ${asset}: ${error.message}`);
            return null;
        }
    }

    // ─── Additional Read Operations ──────────────────────────────────

    /**
     * Get all latest prices for all tracked assets.
     */
    async getAllLatestPrices(): Promise<CryptoPriceTicker[]> {
        const configs = await this.configModel.find({ enabled: true }).exec();
        const tickers: CryptoPriceTicker[] = [];

        for (const config of configs) {
            const ticker = await this.tickerModel
                .findOne({ assetCode: config.assetCode })
                .sort({ createdAt: -1 })
                .exec();
            if (ticker) tickers.push(ticker);
        }

        return tickers;
    }

    // ─── PriceConfiguration CRUD ─────────────────────────────────────

    async getConfigurations(): Promise<PriceConfiguration[]> {
        return this.configModel.find().sort({ assetCode: 1 }).exec();
    }

    async upsertConfiguration(dto: {
        assetCode: string;
        sources?: string[];
        aggregationStrategy?: string;
        enabled?: boolean;
    }): Promise<PriceConfiguration> {
        return this.configModel.findOneAndUpdate(
            { assetCode: dto.assetCode.toUpperCase() },
            {
                assetCode: dto.assetCode.toUpperCase(),
                sources: dto.sources || ['COINGECKO', 'COINMARKETCAP', 'CRYPTOCOMPARE'],
                aggregationStrategy: dto.aggregationStrategy || 'AVERAGE',
                enabled: dto.enabled ?? true,
            },
            { upsert: true, new: true },
        ).exec();
    }

    async deleteConfiguration(assetCode: string): Promise<void> {
        await this.configModel.deleteOne({ assetCode: assetCode.toUpperCase() }).exec();
    }

    // ─── Registry Integration ────────────────────────────────────────

    /**
     * Merges CoinGecko ID mappings from Asset Registry.
     * Does NOT replace hardcoded entries — extends them.
     */
    updateCoinIdMap(map: Record<string, string>) {
        this.dynamicCoinIdMap = { ...map };
        const newKeys = Object.keys(map).filter((k) => !COINGECKO_ID_MAP[k]);
        if (newKeys.length > 0) {
            this.logger.log(`📡 CoinGecko ID map extended with: ${newKeys.join(', ')}`);
        }
    }

    /**
     * Resolves CoinGecko slug: dynamic first (from Registry), then static fallback.
     */
    getCoinId(asset: string): string | undefined {
        return this.dynamicCoinIdMap[asset] || COINGECKO_ID_MAP[asset];
    }
}

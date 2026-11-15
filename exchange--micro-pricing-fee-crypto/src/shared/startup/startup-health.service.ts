import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CryptoPriceTicker } from '../../pricing/schemas/crypto-price-ticker.schema';
import { PriceConfiguration } from '../../pricing/schemas/price-configuration.schema';

interface ApiHealthResult {
    source: string;
    status: 'OK' | 'ERROR';
    responseTimeMs: number;
    message?: string;
}

interface AssetPriceStatus {
    assetCode: string;
    lastPrice: number | null;
    lastUpdated: Date | null;
    ageMinutes: number | null;
    isStale: boolean;
}

/**
 * Startup Health Check Service
 *
 * Runs on application bootstrap to verify:
 *   1. Configured coins exist in PriceConfiguration
 *   2. Last saved prices in DB (freshness check)
 *   3. External API connectivity (lightweight ping to all 3 sources)
 *
 * Logs a comprehensive startup report to console.
 */
@Injectable()
export class StartupHealthService implements OnApplicationBootstrap {
    private readonly logger = new Logger('🚀 StartupHealth');

    constructor(
        @InjectModel(CryptoPriceTicker.name) private tickerModel: Model<CryptoPriceTicker>,
        @InjectModel(PriceConfiguration.name) private configModel: Model<PriceConfiguration>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async onApplicationBootstrap(): Promise<void> {
        this.logger.log('');
        this.logger.log('╔══════════════════════════════════════════════════════════════╗');
        this.logger.log('║       DECO EXCHANGE — Crypto Pricing Microservice            ║');
        this.logger.log('║                   Startup Health Check                       ║');
        this.logger.log('╚══════════════════════════════════════════════════════════════╝');
        this.logger.log('');

        const port = this.configService.get<string>('PORT', '3012');
        const env = this.configService.get<string>('NODE_ENV', 'development');
        this.logger.log(`📍 Port: ${port} | Env: ${env} | Prefix: api/v1`);
        this.logger.log('');

        // 1. Verify configured coins
        await this.verifyConfiguredCoins();

        // 2. Check last saved prices
        await this.verifyLastPrices();

        // 3. Ping external APIs
        await this.pingExternalApis();

        // 4. Check database connection
        await this.checkDatabaseHealth();

        this.logger.log('');
        this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.logger.log(`✅ Startup health check complete — ${new Date().toISOString()}`);
        this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.logger.log('');
    }

    // ─── 1. Verify Configured Coins ─────────────────────────────────

    private async verifyConfiguredCoins(): Promise<void> {
        this.logger.log('┌─ 🪙 Configured Assets ──────────────────────────────────');
        try {
            const configs = await this.configModel.find().exec();

            if (configs.length === 0) {
                this.logger.warn('│  ⚠️  No assets configured in price_configurations!');
                this.logger.warn('│  💡 Use POST /api/v1/internal/pricing/crypto/configurations to add assets');
            } else {
                const enabled = configs.filter(c => c.enabled);
                const disabled = configs.filter(c => !c.enabled);
                this.logger.log(`│  Total: ${configs.length} | Enabled: ${enabled.length} | Disabled: ${disabled.length}`);
                for (const c of configs) {
                    const status = c.enabled ? '🟢' : '🔴';
                    this.logger.log(`│  ${status} ${c.assetCode.padEnd(8)} sources=[${c.sources.join(',')}] strategy=${c.aggregationStrategy}`);
                }
            }
        } catch (error) {
            this.logger.error(`│  ❌ Failed to read configurations: ${error.message}`);
        }
        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    // ─── 2. Check Last Saved Prices ──────────────────────────────────

    private async verifyLastPrices(): Promise<void> {
        this.logger.log('┌─ 📊 Last Saved Prices ───────────────────────────────────');
        try {
            const configs = await this.configModel.find({ enabled: true }).exec();

            if (configs.length === 0) {
                this.logger.warn('│  ⚠️  No enabled assets to check');
                this.logger.log('└──────────────────────────────────────────────────────────');
                return;
            }

            const statuses: AssetPriceStatus[] = [];

            for (const config of configs) {
                const ticker = await this.tickerModel
                    .findOne({ assetCode: config.assetCode })
                    .sort({ createdAt: -1 })
                    .exec();

                const ageMinutes = ticker?.createdAt
                    ? Math.round((Date.now() - new Date(ticker.createdAt).getTime()) / 60000)
                    : null;

                statuses.push({
                    assetCode: config.assetCode,
                    lastPrice: ticker?.finalBasePriceUsd ?? null,
                    lastUpdated: ticker?.createdAt ?? null,
                    ageMinutes,
                    isStale: ageMinutes === null || ageMinutes > 5,
                });
            }

            for (const s of statuses) {
                if (s.lastPrice === null) {
                    this.logger.warn(`│  🔸 ${s.assetCode.padEnd(8)} — No price data in DB`);
                } else {
                    const staleIcon = s.isStale ? '🟠' : '🟢';
                    const ageStr = s.ageMinutes !== null ? `${s.ageMinutes}min ago` : 'unknown';
                    this.logger.log(
                        `│  ${staleIcon} ${s.assetCode.padEnd(8)} $${s.lastPrice?.toFixed(2).padStart(12)} | ${ageStr}${s.isStale ? ' (STALE)' : ''}`,
                    );
                }
            }

            const staleCount = statuses.filter(s => s.isStale).length;
            if (staleCount > 0) {
                this.logger.warn(`│  ⚠️  ${staleCount} asset(s) have stale or missing prices`);
            }
        } catch (error) {
            this.logger.error(`│  ❌ Failed to check prices: ${error.message}`);
        }
        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    // ─── 3. Ping External APIs ───────────────────────────────────────

    private async pingExternalApis(): Promise<void> {
        this.logger.log('┌─ 🌐 External API Health ─────────────────────────────────');

        const results: ApiHealthResult[] = await Promise.all([
            this.pingCoinGecko(),
            this.pingCoinMarketCap(),
            this.pingCryptoCompare(),
        ]);

        for (const r of results) {
            const icon = r.status === 'OK' ? '🟢' : '🔴';
            const time = `${r.responseTimeMs}ms`;
            this.logger.log(`│  ${icon} ${r.source.padEnd(16)} ${r.status.padEnd(6)} ${time}${r.message ? ' — ' + r.message : ''}`);
        }

        const failedCount = results.filter(r => r.status === 'ERROR').length;
        if (failedCount === results.length) {
            this.logger.error('│  ❌ ALL external APIs unreachable! Prices will NOT update.');
        } else if (failedCount > 0) {
            this.logger.warn(`│  ⚠️  ${failedCount}/${results.length} API(s) unreachable`);
        } else {
            this.logger.log('│  ✅ All external APIs operational');
        }

        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    private async pingCoinGecko(): Promise<ApiHealthResult> {
        const start = Date.now();
        try {
            const baseUrl = this.configService.get<string>('COINGECKO_API_URL', 'https://api.coingecko.com/api/v3');
            const apiKey = this.configService.get<string>('COINGECKO_API_KEY', '');
            const headers: Record<string, string> = {};
            if (apiKey) headers['x-cg-demo-api-key'] = apiKey;

            await firstValueFrom(
                this.httpService.get(`${baseUrl}/ping`, { headers, timeout: 8000 }),
            );
            return { source: 'CoinGecko', status: 'OK', responseTimeMs: Date.now() - start };
        } catch (error) {
            return { source: 'CoinGecko', status: 'ERROR', responseTimeMs: Date.now() - start, message: error.message };
        }
    }

    private async pingCoinMarketCap(): Promise<ApiHealthResult> {
        const start = Date.now();
        try {
            const baseUrl = this.configService.get<string>('COINMARKETCAP_API_URL', 'https://pro-api.coinmarketcap.com');
            const apiKey = this.configService.get<string>('COINMARKETCAP_API_KEY', '');

            await firstValueFrom(
                this.httpService.get(`${baseUrl}/v1/key/info`, {
                    headers: { 'X-CMC_PRO_API_KEY': apiKey },
                    timeout: 8000,
                }),
            );
            return { source: 'CoinMarketCap', status: 'OK', responseTimeMs: Date.now() - start };
        } catch (error) {
            // CMC /key/info returns 200 if key is valid
            const status = error?.response?.status;
            if (status === 200 || status === 401) {
                return { source: 'CoinMarketCap', status: status === 200 ? 'OK' : 'ERROR', responseTimeMs: Date.now() - start, message: status === 401 ? 'Invalid API key' : undefined };
            }
            return { source: 'CoinMarketCap', status: 'ERROR', responseTimeMs: Date.now() - start, message: error.message };
        }
    }

    private async pingCryptoCompare(): Promise<ApiHealthResult> {
        const start = Date.now();
        try {
            const baseUrl = this.configService.get<string>('CRYPTO_API_URL', 'https://min-api.cryptocompare.com');
            const apiKey = this.configService.get<string>('CRYPTO_API_SECRET', '');
            const headers: Record<string, string> = {};
            if (apiKey) headers['authorization'] = `Apikey ${apiKey}`;

            await firstValueFrom(
                this.httpService.get(`${baseUrl}/data/price?fsym=BTC&tsyms=USD`, {
                    headers,
                    timeout: 8000,
                }),
            );
            return { source: 'CryptoCompare', status: 'OK', responseTimeMs: Date.now() - start };
        } catch (error) {
            return { source: 'CryptoCompare', status: 'ERROR', responseTimeMs: Date.now() - start, message: error.message };
        }
    }

    // ─── 4. Database Health ──────────────────────────────────────────

    private async checkDatabaseHealth(): Promise<void> {
        this.logger.log('┌─ 🗄️  Database Health ─────────────────────────────────────');
        try {
            const tickerCount = await this.tickerModel.estimatedDocumentCount().exec();
            const configCount = await this.configModel.estimatedDocumentCount().exec();

            this.logger.log(`│  🟢 MongoDB connected`);
            this.logger.log(`│     Tickers:         ${tickerCount.toLocaleString()} documents`);
            this.logger.log(`│     Configurations:  ${configCount} documents`);
        } catch (error) {
            this.logger.error(`│  🔴 MongoDB error: ${error.message}`);
        }
        this.logger.log('└──────────────────────────────────────────────────────────');
    }
}

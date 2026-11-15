import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FiatRateTicker } from '../../pricing/schemas/fiat-rate-ticker.schema';
import { FiatPairConfiguration } from '../../pricing/schemas/fiat-pair-configuration.schema';
import { PriceBand } from '../../price-bands/schemas/price-band.schema';

interface ApiHealthResult {
    source: string;
    status: 'OK' | 'ERROR';
    responseTimeMs: number;
    message?: string;
}

interface PairRateStatus {
    pairCode: string;
    lastRate: number | null;
    lastUpdated: Date | null;
    ageMinutes: number | null;
    isStale: boolean;
}

/**
 * Startup Health Check Service
 *
 * Runs on application bootstrap to verify:
 *   1. Configured currency pairs exist in FiatPairConfiguration
 *   2. Last saved rates in DB (freshness check)
 *   3. External API connectivity (lightweight ping to all 3 sources)
 *
 * Logs a comprehensive startup report to console.
 */
@Injectable()
export class StartupHealthService implements OnApplicationBootstrap {
    private readonly logger = new Logger('🚀 StartupHealth');

    constructor(
        @InjectModel(FiatRateTicker.name) private tickerModel: Model<FiatRateTicker>,
        @InjectModel(FiatPairConfiguration.name) private configModel: Model<FiatPairConfiguration>,
        @InjectModel(PriceBand.name) private priceBandModel: Model<PriceBand>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async onApplicationBootstrap(): Promise<void> {
        this.logger.log('');
        this.logger.log('╔══════════════════════════════════════════════════════════════╗');
        this.logger.log('║       DECO EXCHANGE — Fiat Pricing Microservice              ║');
        this.logger.log('║                   Startup Health Check                       ║');
        this.logger.log('╚══════════════════════════════════════════════════════════════╝');
        this.logger.log('');

        const port = this.configService.get<string>('PORT', '3014');
        const env = this.configService.get<string>('NODE_ENV', 'development');
        this.logger.log(`📍 Port: ${port} | Env: ${env} | Prefix: api/v1`);
        this.logger.log('');

        // 0. Seed default data if empty (idempotent)
        await this.seedDefaults();

        // 1. Verify configured currency pairs
        await this.verifyConfiguredPairs();

        // 2. Check last saved rates
        await this.verifyLastRates();

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

    // ─── 0. Seed Default Data (Idempotent) ─────────────────────────

    private static readonly DEFAULT_PAIRS = [
        { base: 'USD', quote: 'COP', buy: -0.5, sell: 0.5 },
        { base: 'USD', quote: 'MXN', buy: -0.4, sell: 0.4 },
        { base: 'EUR', quote: 'COP', buy: -0.6, sell: 0.6 },
        { base: 'USD', quote: 'PEN', buy: -0.4, sell: 0.4 },
        { base: 'USD', quote: 'VES', buy: -1.0, sell: 1.0 },
        { base: 'USD', quote: 'SVC', buy: -0.3, sell: 0.3 },
        { base: 'MXN', quote: 'COP', buy: -0.6, sell: 0.6 },
        { base: 'EUR', quote: 'USD', buy: -0.3, sell: 0.3 },
        { base: 'GBP', quote: 'USD', buy: -0.3, sell: 0.3 },
        { base: 'USD', quote: 'BRL', buy: -0.5, sell: 0.5 },
        { base: 'USD', quote: 'ARS', buy: -1.0, sell: 1.0 },
        { base: 'USD', quote: 'CLP', buy: -0.5, sell: 0.5 },
    ];

    private static readonly DEFAULT_SOURCES = [
        'EXCHANGERATE_API', 'FRANKFURTER', 'FLOATRATES', 'FAWAZ_CURRENCY',
    ];

    private async seedDefaults(): Promise<void> {
        this.logger.log('┌─ 🌱 Auto-Seed Check ────────────────────────────────────');

        try {
            // ── Seed Pair Configurations ──
            const existingConfigs = await this.configModel.countDocuments().exec();
            if (existingConfigs === 0) {
                this.logger.log('│  📭 No pair configurations found — seeding defaults...');
                const configDocs = StartupHealthService.DEFAULT_PAIRS.map(p => ({
                    baseCurrency: p.base,
                    quoteCurrency: p.quote,
                    pairCode: `${p.base}_${p.quote}`,
                    sources: StartupHealthService.DEFAULT_SOURCES,
                    aggregationStrategy: 'AVERAGE',
                    enabled: true,
                }));
                await this.configModel.insertMany(configDocs);
                this.logger.log(`│  ✅ Seeded ${configDocs.length} pair configurations`);
            } else {
                this.logger.log(`│  ✅ ${existingConfigs} pair configurations already exist — skipping`);
            }

            // ── Seed Price Bands ──
            const existingBands = await this.priceBandModel.countDocuments().exec();
            if (existingBands === 0) {
                this.logger.log('│  📭 No price bands found — seeding defaults...');
                const bandDocs = StartupHealthService.DEFAULT_PAIRS.map(p => ({
                    pairCode: `${p.base}_${p.quote}`,
                    mode: 'MANUAL',
                    buySpreadPercentage: p.buy,
                    sellSpreadPercentage: p.sell,
                    legalMaxUpperPercentage: 3,
                    legalMaxLowerPercentage: 2,
                    enabled: true,
                }));
                await this.priceBandModel.insertMany(bandDocs);
                this.logger.log(`│  ✅ Seeded ${bandDocs.length} price bands`);
            } else {
                this.logger.log(`│  ✅ ${existingBands} price bands already exist — skipping`);
            }
        } catch (error) {
            this.logger.error(`│  ❌ Seed error: ${error.message}`);
        }

        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    // ─── 1. Verify Configured Currency Pairs ─────────────────────────

    private async verifyConfiguredPairs(): Promise<void> {
        this.logger.log('┌─ 💱 Configured Currency Pairs ──────────────────────────────');
        try {
            const configs = await this.configModel.find().exec();

            if (configs.length === 0) {
                this.logger.warn('│  ⚠️  No pairs configured in fiat_pair_configurations!');
                this.logger.warn('│  💡 Use POST /api/v1/internal/pricing/fiat/configurations to add pairs');
            } else {
                const enabled = configs.filter(c => c.enabled);
                const disabled = configs.filter(c => !c.enabled);
                this.logger.log(`│  Total: ${configs.length} | Enabled: ${enabled.length} | Disabled: ${disabled.length}`);
                for (const c of configs) {
                    const status = c.enabled ? '🟢' : '🔴';
                    this.logger.log(`│  ${status} ${c.pairCode.padEnd(12)} sources=[${c.sources.join(',')}] strategy=${c.aggregationStrategy}`);
                }
            }
        } catch (error) {
            this.logger.error(`│  ❌ Failed to read configurations: ${error.message}`);
        }
        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    // ─── 2. Check Last Saved Rates ───────────────────────────────────

    private async verifyLastRates(): Promise<void> {
        this.logger.log('┌─ 📊 Last Saved Rates ────────────────────────────────────');
        try {
            const configs = await this.configModel.find({ enabled: true }).exec();

            if (configs.length === 0) {
                this.logger.warn('│  ⚠️  No enabled pairs to check');
                this.logger.log('└──────────────────────────────────────────────────────────');
                return;
            }

            const statuses: PairRateStatus[] = [];

            for (const config of configs) {
                const ticker = await this.tickerModel
                    .findOne({ pairCode: config.pairCode })
                    .sort({ createdAt: -1 })
                    .exec();

                const ageMinutes = ticker?.createdAt
                    ? Math.round((Date.now() - new Date(ticker.createdAt).getTime()) / 60000)
                    : null;

                statuses.push({
                    pairCode: config.pairCode,
                    lastRate: ticker?.finalRate ?? null,
                    lastUpdated: ticker?.createdAt ?? null,
                    ageMinutes,
                    isStale: ageMinutes === null || ageMinutes > 65,
                });
            }

            for (const s of statuses) {
                if (s.lastRate === null) {
                    this.logger.warn(`│  🔸 ${s.pairCode.padEnd(12)} — No rate data in DB`);
                } else {
                    const staleIcon = s.isStale ? '🟠' : '🟢';
                    const ageStr = s.ageMinutes !== null ? `${s.ageMinutes}min ago` : 'unknown';
                    this.logger.log(
                        `│  ${staleIcon} ${s.pairCode.padEnd(12)} ${s.lastRate?.toFixed(4).padStart(14)} | ${ageStr}${s.isStale ? ' (STALE)' : ''}`,
                    );
                }
            }

            const staleCount = statuses.filter(s => s.isStale).length;
            if (staleCount > 0) {
                this.logger.warn(`│  ⚠️  ${staleCount} pair(s) have stale or missing rates`);
            }
        } catch (error) {
            this.logger.error(`│  ❌ Failed to check rates: ${error.message}`);
        }
        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    // ─── 3. Ping External APIs ───────────────────────────────────────

    private async pingExternalApis(): Promise<void> {
        this.logger.log('┌─ 🌐 External API Health ─────────────────────────────────');

        const results: ApiHealthResult[] = await Promise.all([
            this.pingExchangeRateApi(),
            this.pingFrankfurter(),
            this.pingExchangeRateHost(),
        ]);

        for (const r of results) {
            const icon = r.status === 'OK' ? '🟢' : '🔴';
            const time = `${r.responseTimeMs}ms`;
            this.logger.log(`│  ${icon} ${r.source.padEnd(20)} ${r.status.padEnd(6)} ${time}${r.message ? ' — ' + r.message : ''}`);
        }

        const failedCount = results.filter(r => r.status === 'ERROR').length;
        if (failedCount === results.length) {
            this.logger.error('│  ❌ ALL external APIs unreachable! Rates will NOT update.');
        } else if (failedCount > 0) {
            this.logger.warn(`│  ⚠️  ${failedCount}/${results.length} API(s) unreachable`);
        } else {
            this.logger.log('│  ✅ All external APIs operational');
        }

        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    private async pingExchangeRateApi(): Promise<ApiHealthResult> {
        const start = Date.now();
        try {
            const baseUrl = this.configService.get<string>('EXCHANGERATE_API_URL', 'https://open.er-api.com/v6/latest');
            const { data } = await firstValueFrom(
                this.httpService.get(`${baseUrl}/USD`, { timeout: 8000 }),
            );
            const ok = data?.result === 'success';
            return { source: 'ExchangeRate-API', status: ok ? 'OK' : 'ERROR', responseTimeMs: Date.now() - start };
        } catch (error) {
            return { source: 'ExchangeRate-API', status: 'ERROR', responseTimeMs: Date.now() - start, message: error.message };
        }
    }

    private async pingFrankfurter(): Promise<ApiHealthResult> {
        const start = Date.now();
        try {
            const baseUrl = this.configService.get<string>('FRANKFURTER_API_URL', 'https://api.frankfurter.app');
            await firstValueFrom(
                this.httpService.get(`${baseUrl}/latest?from=USD`, { timeout: 8000 }),
            );
            return { source: 'Frankfurter', status: 'OK', responseTimeMs: Date.now() - start };
        } catch (error) {
            return { source: 'Frankfurter', status: 'ERROR', responseTimeMs: Date.now() - start, message: error.message };
        }
    }

    private async pingExchangeRateHost(): Promise<ApiHealthResult> {
        const start = Date.now();
        try {
            const baseUrl = this.configService.get<string>('EXCHANGERATE_HOST_URL', 'https://api.exchangerate.host');
            const apiKey = this.configService.get<string>('EXCHANGERATE_HOST_API_KEY', '');
            const params: any = { base: 'USD' };
            if (apiKey) params.access_key = apiKey;

            await firstValueFrom(
                this.httpService.get(`${baseUrl}/latest`, { params, timeout: 8000 }),
            );
            return { source: 'exchangerate.host', status: 'OK', responseTimeMs: Date.now() - start };
        } catch (error) {
            return { source: 'exchangerate.host', status: 'ERROR', responseTimeMs: Date.now() - start, message: error.message };
        }
    }

    // ─── 4. Database Health ──────────────────────────────────────────

    private async checkDatabaseHealth(): Promise<void> {
        this.logger.log('┌─ 🗄️  Database Health ─────────────────────────────────────');
        try {
            const tickerCount = await this.tickerModel.estimatedDocumentCount().exec();
            const configCount = await this.configModel.estimatedDocumentCount().exec();

            this.logger.log(`│  🟢 MongoDB connected`);
            this.logger.log(`│     Rate tickers:    ${tickerCount.toLocaleString()} documents`);
            this.logger.log(`│     Configurations:  ${configCount} documents`);
        } catch (error) {
            this.logger.error(`│  🔴 MongoDB error: ${error.message}`);
        }
        this.logger.log('└──────────────────────────────────────────────────────────');
    }
}

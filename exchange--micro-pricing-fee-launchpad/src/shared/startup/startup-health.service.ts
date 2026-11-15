import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CustomToken } from '../../tokens/schemas/custom-token.schema';
import { CustomTokenTicker } from '../../tokens/schemas/custom-token-ticker.schema';

interface TokenPriceStatus {
    tokenCode: string;
    name: string;
    pricingModel: string;
    lastPrice: number | null;
    lastUpdated: Date | null;
    ageMinutes: number | null;
    isStale: boolean;
}

/**
 * Startup Health Check Service (Launchpad Edition)
 *
 * Runs on application bootstrap to verify:
 *   1. Registered custom tokens (by pricing model)
 *   2. Last saved prices in DB (freshness check)
 *   3. Crypto pricing micro connectivity (for peg sync)
 *   4. Database document counts
 *
 * Logs a comprehensive startup report to console.
 */
@Injectable()
export class StartupHealthService implements OnApplicationBootstrap {
    private readonly logger = new Logger('🚀 StartupHealth');

    constructor(
        @InjectModel(CustomToken.name) private tokenModel: Model<CustomToken>,
        @InjectModel(CustomTokenTicker.name) private tickerModel: Model<CustomTokenTicker>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async onApplicationBootstrap(): Promise<void> {
        this.logger.log('');
        this.logger.log('╔══════════════════════════════════════════════════════════════╗');
        this.logger.log('║       DECO EXCHANGE — Launchpad Pricing Microservice         ║');
        this.logger.log('║                   Startup Health Check                       ║');
        this.logger.log('╚══════════════════════════════════════════════════════════════╝');
        this.logger.log('');

        const port = this.configService.get<string>('PORT', '3016');
        const env = this.configService.get<string>('NODE_ENV', 'development');
        this.logger.log(`📍 Port: ${port} | Env: ${env} | Prefix: api/v1`);
        this.logger.log('');

        // 1. Verify registered tokens
        await this.verifyRegisteredTokens();

        // 2. Check last saved prices
        await this.verifyLastPrices();

        // 3. Ping crypto pricing micro (for peg sync)
        await this.pingCryptoPricingMicro();

        // 4. Check database connection
        await this.checkDatabaseHealth();

        this.logger.log('');
        this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.logger.log(`✅ Startup health check complete — ${new Date().toISOString()}`);
        this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.logger.log('');
    }

    // ─── 1. Verify Registered Tokens ─────────────────────────────────

    private async verifyRegisteredTokens(): Promise<void> {
        this.logger.log('┌─ 🪙 Custom Tokens ──────────────────────────────────────');
        try {
            const tokens = await this.tokenModel.find().exec();

            if (tokens.length === 0) {
                this.logger.warn('│  ⚠️  No custom tokens registered!');
                this.logger.warn('│  💡 Use POST /api/v1/internal/custom-tokens to register tokens');
            } else {
                const enabled = tokens.filter(t => t.enabled);
                const disabled = tokens.filter(t => !t.enabled);
                this.logger.log(`│  Total: ${tokens.length} | Enabled: ${enabled.length} | Delisted: ${disabled.length}`);

                // Group by pricing model
                const byModel = tokens.reduce((acc, t) => {
                    const m = t.pricingModel || 'UNKNOWN';
                    acc[m] = (acc[m] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                this.logger.log(`│  Models: ${Object.entries(byModel).map(([k, v]) => `${k}=${v}`).join(', ')}`);

                for (const t of tokens) {
                    const status = t.enabled ? '🟢' : '🔴';
                    const model = t.pricingModel.padEnd(10);
                    const cat = (t.category || 'N/A').padEnd(8);
                    this.logger.log(`│  ${status} ${t.tokenCode.padEnd(12)} ${model} ${cat} $${t.currentPriceUsd}`);
                }
            }
        } catch (error) {
            this.logger.error(`│  ❌ Failed to read tokens: ${error.message}`);
        }
        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    // ─── 2. Check Last Saved Prices ──────────────────────────────────

    private async verifyLastPrices(): Promise<void> {
        this.logger.log('┌─ 📊 Last Saved Prices ───────────────────────────────────');
        try {
            const tokens = await this.tokenModel.find({ enabled: true }).exec();

            if (tokens.length === 0) {
                this.logger.warn('│  ⚠️  No enabled tokens to check');
                this.logger.log('└──────────────────────────────────────────────────────────');
                return;
            }

            const statuses: TokenPriceStatus[] = [];

            for (const token of tokens) {
                const ticker = await this.tickerModel
                    .findOne({ tokenCode: token.tokenCode })
                    .sort({ createdAt: -1 })
                    .exec();

                const ageMinutes = ticker?.createdAt
                    ? Math.round((Date.now() - new Date(ticker.createdAt).getTime()) / 60000)
                    : null;

                // Stale threshold: MANUAL = 60min, PEGGED = 10min, SIMULATED = 10min
                const staleThreshold = token.pricingModel === 'MANUAL' ? 60 : 10;

                statuses.push({
                    tokenCode: token.tokenCode,
                    name: token.name,
                    pricingModel: token.pricingModel,
                    lastPrice: ticker?.priceUsd ?? null,
                    lastUpdated: ticker?.createdAt ?? null,
                    ageMinutes,
                    isStale: ageMinutes === null || ageMinutes > staleThreshold,
                });
            }

            for (const s of statuses) {
                if (s.lastPrice === null) {
                    this.logger.warn(`│  🔸 ${s.tokenCode.padEnd(12)} — No price data in DB (${s.pricingModel})`);
                } else {
                    const staleIcon = s.isStale ? '🟠' : '🟢';
                    const ageStr = s.ageMinutes !== null ? `${s.ageMinutes}min ago` : 'unknown';
                    this.logger.log(
                        `│  ${staleIcon} ${s.tokenCode.padEnd(12)} $${s.lastPrice?.toFixed(6).padStart(14)} | ${ageStr}${s.isStale ? ' (STALE)' : ''} [${s.pricingModel}]`,
                    );
                }
            }

            const staleCount = statuses.filter(s => s.isStale).length;
            if (staleCount > 0) {
                this.logger.warn(`│  ⚠️  ${staleCount} token(s) have stale or missing prices`);
            }
        } catch (error) {
            this.logger.error(`│  ❌ Failed to check prices: ${error.message}`);
        }
        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    // ─── 3. Ping Crypto Pricing Micro (Peg Sync Dependency) ──────────

    private async pingCryptoPricingMicro(): Promise<void> {
        this.logger.log('┌─ 🌐 External Service Health ─────────────────────────────');

        const cryptoUrl = this.configService.get<string>('PRICING_CRYPTO_URL', 'http://localhost:3012/api/v1');
        const start = Date.now();

        try {
            await firstValueFrom(
                this.httpService.get(`${cryptoUrl}/health`, { timeout: 8000 }),
            );
            this.logger.log(`│  🟢 Crypto Pricing (:3012) — OK (${Date.now() - start}ms) — required for peg sync`);
        } catch (error) {
            this.logger.warn(`│  🟠 Crypto Pricing (:3012) — UNREACHABLE (${Date.now() - start}ms) — peg sync will fail`);
            this.logger.warn(`│     URL: ${cryptoUrl}/health`);
            this.logger.warn(`│     ⚠️  PEGGED tokens will NOT auto-update until crypto micro is available`);
        }

        this.logger.log('└──────────────────────────────────────────────────────────');
    }

    // ─── 4. Database Health ──────────────────────────────────────────

    private async checkDatabaseHealth(): Promise<void> {
        this.logger.log('┌─ 🗄️  Database Health ─────────────────────────────────────');
        try {
            const tokenCount = await this.tokenModel.estimatedDocumentCount().exec();
            const tickerCount = await this.tickerModel.estimatedDocumentCount().exec();

            this.logger.log(`│  🟢 MongoDB connected`);
            this.logger.log(`│     Custom Tokens:   ${tokenCount} documents`);
            this.logger.log(`│     Token Tickers:   ${tickerCount.toLocaleString()} documents`);
        } catch (error) {
            this.logger.error(`│  🔴 MongoDB error: ${error.message}`);
        }
        this.logger.log('└──────────────────────────────────────────────────────────');
    }
}

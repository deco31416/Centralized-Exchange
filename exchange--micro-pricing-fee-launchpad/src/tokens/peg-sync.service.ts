import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TokensService } from './tokens.service';

/**
 * Peg Sync Service — Automatic Price Synchronization
 *
 * For tokens with pricingModel = 'PEGGED', this service periodically
 * fetches the reference asset's price and updates the token accordingly:
 *
 *   expectedPrice = referencePrice × pegRatio
 *
 * Reference prices are fetched from:
 *   - micro-pricing-crypto (:3012) → for BTC, ETH, BNB, USDT, USDC pegs
 *   - Static value → for USD peg (1 USD = 1 USD)
 *   - micro-pricing-fiat (:3014) → for EUR and other fiat pegs (future)
 *   - This same service → for CUSTOM pegs (pegged to another custom token)
 *
 * If deviation exceeds maxPegDeviation:
 *   - autoSync=true → auto-correct price
 *   - autoSync=false → only log warning (admin must intervene)
 */
@Injectable()
export class PegSyncService implements OnModuleInit {
    private readonly logger = new Logger(PegSyncService.name);
    private syncIntervalRef: ReturnType<typeof setInterval> | null = null;

    // External service URLs
    private readonly cryptoPricingUrl: string;
    private readonly cryptoPricingToken: string;
    private readonly syncIntervalMs: number;

    constructor(
        private readonly tokensService: TokensService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.cryptoPricingUrl = this.configService.get<string>('PRICING_CRYPTO_URL', 'http://localhost:3012/api/v1');
        this.cryptoPricingToken = this.configService.get<string>('PRICING_CRYPTO_AUTH_TOKEN', '');
        this.syncIntervalMs = this.configService.get<number>('PEG_SYNC_INTERVAL_MS', 300_000); // 5 min default
    }

    async onModuleInit() {
        // Start peg sync after 15 seconds (let other services initialize)
        setTimeout(() => this.startSync(), 15_000);
    }

    // ─── Control ─────────────────────────────────────────────────────

    startSync(): void {
        this.logger.log(`🔗 Peg sync started (interval: ${this.syncIntervalMs / 1000}s)`);
        this.scheduleSyncCycle();
    }

    stopSync(): void {
        if (this.syncIntervalRef) {
            clearTimeout(this.syncIntervalRef);
            this.syncIntervalRef = null;
        }
    }

    private scheduleSyncCycle(): void {
        this.syncIntervalRef = setTimeout(async () => {
            await this.syncAllPegs();
            this.scheduleSyncCycle(); // Reschedule
        }, this.syncIntervalMs);
    }

    // ─── Main Sync Logic ─────────────────────────────────────────────

    async syncAllPegs(): Promise<{ synced: number; errors: number; skipped: number }> {
        const peggedTokens = await this.tokensService.getPeggedTokens();
        if (peggedTokens.length === 0) return { synced: 0, errors: 0, skipped: 0 };

        let synced = 0, errors = 0, skipped = 0;

        for (const token of peggedTokens) {
            try {
                const result = await this.syncTokenPeg(token.tokenCode);
                if (result === 'synced') synced++;
                else if (result === 'skipped') skipped++;
            } catch (error) {
                errors++;
                this.logger.error(`[PegSync] Failed for ${token.tokenCode}: ${error.message}`);
            }
        }

        if (synced > 0 || errors > 0) {
            this.logger.log(`🔗 Peg sync complete: ${synced} synced, ${skipped} ok, ${errors} errors`);
        }
        return { synced, errors, skipped };
    }

    async syncTokenPeg(tokenCode: string): Promise<'synced' | 'skipped' | 'error'> {
        const token = await this.tokensService.findByCode(tokenCode);
        if (!token || token.pricingModel !== 'PEGGED' || !token.pegConfig) {
            return 'skipped';
        }

        const pegConfig = token.pegConfig;

        // Get reference price based on peg type
        let referencePrice: number;
        try {
            referencePrice = await this.getReferencePrice(pegConfig.pegType, pegConfig.pegCustomAsset);
        } catch (error) {
            this.logger.error(`[PegSync] Cannot get reference for ${tokenCode} (${pegConfig.pegType}): ${error.message}`);
            return 'error';
        }

        // Calculate expected price
        const expectedPrice = referencePrice * (pegConfig.pegRatio || 1);
        const deviation = expectedPrice > 0
            ? Math.abs((token.currentPriceUsd - expectedPrice) / expectedPrice) * 100
            : 0;

        // Check if deviation exceeds threshold
        if (deviation <= (pegConfig.maxPegDeviation || 0.5)) {
            // Within bounds — no action needed
            return 'skipped';
        }

        this.logger.warn(
            `⚠️ [PegSync] ${tokenCode}: deviation ${deviation.toFixed(2)}% ` +
            `(current=$${token.currentPriceUsd}, expected=$${expectedPrice.toFixed(6)}, ` +
            `ref=${pegConfig.pegType}=$${referencePrice})`,
        );

        // Auto-sync if enabled
        if (pegConfig.autoSync) {
            await this.tokensService.updatePriceInternal(
                tokenCode,
                expectedPrice,
                'PEG_SYNC',
                `Peg sync: ${pegConfig.pegType} ref=$${referencePrice} ratio=${pegConfig.pegRatio} deviation=${deviation.toFixed(2)}%`,
                { pegReferencePrice: referencePrice, pegDeviation: deviation },
            );
            this.logger.log(`🔗 ${tokenCode}: peg corrected → $${expectedPrice.toFixed(6)} (was $${token.currentPriceUsd})`);
            return 'synced';
        }

        return 'skipped';
    }

    // ─── Reference Price Fetchers ────────────────────────────────────

    private async getReferencePrice(pegType: string, customAsset?: string): Promise<number> {
        switch (pegType) {
            case 'USD':
            case 'USDT':
            case 'USDC':
                // Stablecoins: try to get real price from crypto pricing, fallback to $1
                try {
                    return await this.getCryptoPriceFromMicro(pegType === 'USD' ? 'USDT' : pegType);
                } catch {
                    return 1.0; // Safe fallback for USD-pegged stablecoins
                }

            case 'BTC':
            case 'ETH':
            case 'BNB':
                // Major crypto: MUST get real price (no safe fallback)
                return this.getCryptoPriceFromMicro(pegType);

            case 'EUR':
                // Fiat: would call micro-pricing-fiat, for now use static rate
                this.logger.warn('[PegSync] EUR peg using static rate — integrate micro-pricing-fiat for live data');
                return 1.08; // Approximate EUR/USD rate

            case 'CUSTOM':
                if (!customAsset) throw new Error('CUSTOM peg requires pegCustomAsset');
                // Get price from another custom token in this same service
                const customToken = await this.tokensService.findByCode(customAsset);
                return customToken.currentPriceUsd;

            default:
                throw new Error(`Unknown peg type: ${pegType}`);
        }
    }

    /**
     * Call micro-pricing-crypto to get the latest price for an asset.
     * This creates a dependency: launchpad → crypto pricing micro.
     */
    private async getCryptoPriceFromMicro(assetCode: string): Promise<number> {
        const url = `${this.cryptoPricingUrl}/internal/pricing/crypto/latest/${assetCode}`;
        const headers: Record<string, string> = {};
        if (this.cryptoPricingToken) {
            headers['x-internal-auth'] = this.cryptoPricingToken;
        }

        try {
            const { data } = await firstValueFrom(
                this.httpService.get(url, { headers, timeout: 10_000 }),
            );

            const price = data?.finalBasePriceUsd || data?.basePriceUsd;
            if (typeof price !== 'number' || price <= 0) {
                throw new Error(`Invalid price response for ${assetCode}: ${JSON.stringify(data)}`);
            }

            this.logger.debug(`[PegSync] ${assetCode} reference price: $${price}`);
            return price;
        } catch (error) {
            const status = error?.response?.status;
            throw new Error(`Failed to get ${assetCode} price from crypto micro (HTTP ${status}): ${error.message}`);
        }
    }
}

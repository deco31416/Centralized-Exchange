import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PricingService } from './pricing.service';

/**
 * RegistrySyncService — Syncs crypto asset configurations from Asset Registry.
 *
 * Behavior:
 * - On startup (after 10s) + every 5 minutes: fetches /catalog/sync-manifest
 * - Creates PriceConfiguration for NEW crypto assets (upsert, never overwrites)
 * - Updates CoinGecko ID map dynamically
 * - NEVER deletes existing configurations or ticker data
 * - If Registry is unavailable, silently continues with existing data
 */
@Injectable()
export class RegistrySyncService implements OnModuleInit {
    private readonly logger = new Logger(RegistrySyncService.name);
    private registryUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly pricingService: PricingService,
    ) {}

    onModuleInit() {
        this.registryUrl = this.configService.get<string>(
            'ASSET_REGISTRY_URL',
            'http://localhost:3010/api/v1',
        );

        // Initial sync after 10s (let other services start)
        setTimeout(() => this.sync(), 10_000);

        // Then every 5 minutes
        setInterval(() => this.sync(), 5 * 60_000);

        this.logger.log(`📡 Registry sync configured → ${this.registryUrl}`);
    }

    async sync() {
        try {
            const url = `${this.registryUrl}/catalog/sync-manifest`;
            const { data } = await firstValueFrom(
                this.httpService.get(url, { timeout: 5_000 }),
            );

            let created = 0;
            let skipped = 0;

            // 1. Sync crypto assets → create PriceConfiguration if not exists
            const existingConfigs = await this.pricingService.getConfigurations();
            const existingCodes = new Set(existingConfigs.map((c) => c.assetCode));

            for (const asset of data.cryptoAssets || []) {
                if (!existingCodes.has(asset.code)) {
                    // NEW asset — create config (won't touch existing tickers/stats)
                    await this.pricingService.upsertConfiguration({
                        assetCode: asset.code,
                        enabled: asset.enabled ?? true,
                    });
                    created++;
                    this.logger.log(`  ✅ [Sync] Created config: ${asset.code}`);
                } else {
                    skipped++;
                }
            }

            // 2. Update CoinGecko ID map from Registry
            if (data.coinIdMap && typeof data.coinIdMap === 'object') {
                this.pricingService.updateCoinIdMap(data.coinIdMap);
            }

            if (created > 0) {
                this.logger.log(
                    `📡 [Sync] Crypto: ${created} new configs created, ${skipped} already existed`,
                );
            }
        } catch (err) {
            this.logger.warn(
                `📡 [Sync] Registry unavailable (${err.message}) — using existing data`,
            );
        }
    }
}

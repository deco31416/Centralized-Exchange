import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PricingService } from './pricing.service';

/**
 * RegistrySyncService — Syncs fiat pair configurations from Asset Registry.
 *
 * Behavior:
 * - On startup (after 10s) + every 5 minutes: fetches /catalog/sync-manifest
 * - Creates FiatPairConfiguration for NEW fiat pairs (upsert, never overwrites)
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

            // Get existing pair configurations
            const existingConfigs = await this.pricingService.getConfigurations();
            const existingPairs = new Set(existingConfigs.map((c) => c.pairCode));

            // Create USD → FIAT pairs from Registry manifest
            for (const pair of data.fiatPairs || []) {
                const pairCode = `${pair.baseCurrency}_${pair.quoteCurrency}`;
                if (!existingPairs.has(pairCode)) {
                    // NEW pair — create config (won't touch existing tickers/stats)
                    await this.pricingService.upsertConfiguration({
                        baseCurrency: pair.baseCurrency,
                        quoteCurrency: pair.quoteCurrency,
                        enabled: true,
                    });
                    created++;
                    this.logger.log(`  ✅ [Sync] Created pair config: ${pairCode}`);
                } else {
                    skipped++;
                }
            }

            if (created > 0) {
                this.logger.log(
                    `📡 [Sync] Fiat: ${created} new pair configs created, ${skipped} already existed`,
                );
            }
        } catch (err) {
            this.logger.warn(
                `📡 [Sync] Registry unavailable (${err.message}) — using existing data`,
            );
        }
    }
}

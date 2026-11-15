import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AssetsService } from '../assets/assets.service';
import { NetworksService } from '../networks/networks.service';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';
import { UpdateAssetDto } from '../assets/dto/asset.dto';

/**
 * GET /api/v1/catalog — Full public catalog
 * GET /api/v1/catalog/sync-manifest — Categorized manifest for pricing micro sync
 * GET /api/v1/catalog/assets — Activos visibles en frontend (público)
 * GET /api/v1/catalog/assets/grouped — Activos visibles agrupados por tipo (público)
 * GET /api/v1/catalog/admin/assets — Todos los activos para admin (protegido)
 * PATCH /api/v1/catalog/admin/assets/:code — Actualizar visibilidad/flags desde admin (protegido)
 */
@Controller('catalog')
export class CatalogController {
    constructor(
        private readonly assetsService: AssetsService,
        private readonly networksService: NetworksService,
    ) { }

    /**
     * Lista plana de activos visibles en el frontend.
     * GET /catalog/assets?type=fiat|crypto|internal
     */
    @Get('assets')
    async getFrontendAssets(@Query('type') type?: string) {
        return this.assetsService.findForFrontend(type);
    }

    /**
     * Activos visibles agrupados por tipo: fiat, crypto, internal.
     * Usado por la tab Wallet del dashboard.
     * GET /catalog/assets/grouped
     */
    @Get('assets/grouped')
    async getGroupedAssets() {
        return this.assetsService.findGroupedForFrontend();
    }

    /**
     * Vista admin: todos los activos (incluyendo no visibles).
     * GET /catalog/admin/assets
     */
    @Get('admin/assets')
    @UseGuards(InternalAuthGuard)
    async getAllAssetsForAdmin() {
        return this.assetsService.findAllForAdmin();
    }

    /**
     * Admin: actualizar flags de un activo (visibilidad, habilitación, fase, badge, orden).
     * PATCH /catalog/admin/assets/:code
     */
    @Patch('admin/assets/:code')
    @UseGuards(InternalAuthGuard)
    async updateAssetFromAdmin(
        @Param('code') code: string,
        @Body() updateDto: UpdateAssetDto,
    ) {
        return this.assetsService.update(code, updateDto);
    }

    /** GET /catalog — Full public catalog (legado, para compatibilidad) */
    @Get()
    async getFullCatalog() {
        const [assets, networks] = await Promise.all([
            this.assetsService.findAll({ enabled: true }),
            this.networksService.findAll({ enabled: true }),
        ]);

        const crypto = assets.filter((a) => a.type === 'crypto');
        const fiat = assets.filter((a) => a.type === 'fiat');
        const internal = assets.filter((a) => a.type === 'internal' || a.isInternal);

        return {
            summary: {
                totalAssets: assets.length,
                crypto: crypto.length,
                fiat: fiat.length,
                internal: internal.length,
                networks: networks.length,
            },
            crypto,
            fiat,
            internal,
            networks,
        };
    }

    /**
     * Sync Manifest — used by other microservices to know:
     * - Which assets are stablecoins, fiat, crypto, launchpad
     * - CoinGecko ID mapping for crypto pricing
     * - Fiat pairs to track
     * - Launchpad token codes
     *
     * Returns ALL assets (including disabled) so micros can sync states.
     */
    @Get('sync-manifest')
    async getSyncManifest() {
        const [allAssets, allNetworks] = await Promise.all([
            this.assetsService.findAll(),
            this.networksService.findAll(),
        ]);

        const STABLECOIN_CODES = new Set(['USD', 'USDT', 'USDC']);

        // Categorize assets (fallback for any without category)
        const categorized = allAssets.map((a) => {
            const obj = a.toObject ? a.toObject() : a;
            let category = obj.category;
            if (!category) {
                if (STABLECOIN_CODES.has(obj.code)) category = 'STABLECOIN';
                else if (obj.type === 'fiat') category = 'FIAT';
                else category = 'CRYPTO';
            }
            return { ...obj, category };
        });

        const stablecoins = categorized.filter((a) => a.category === 'STABLECOIN');
        const fiat = categorized.filter((a) => a.category === 'FIAT');
        const crypto = categorized.filter((a) => a.category === 'CRYPTO');
        const launchpad = categorized.filter((a) => a.category === 'LAUNCHPAD');
        const internal = categorized.filter((a) => a.category === 'INTERNAL');

        // CoinGecko ID map for pricing-crypto
        const coinIdMap: Record<string, string> = {};
        for (const a of [...crypto, ...stablecoins.filter((s) => s.cryptoMetadata?.coinId)]) {
            if (a.cryptoMetadata?.coinId) {
                coinIdMap[a.code] = a.cryptoMetadata.coinId;
            }
        }

        // Fiat pairs for pricing-fiat: USD → each fiat currency
        const fiatPairs = fiat
            .filter((a) => a.enabled && a.code !== 'USD')
            .map((a) => ({
                baseCurrency: 'USD',
                quoteCurrency: a.code,
            }));

        return {
            version: new Date().toISOString(),
            categories: {
                stablecoins: stablecoins.map((a) => a.code),
                fiat: fiat.map((a) => a.code),
                crypto: crypto.map((a) => a.code),
                launchpad: launchpad.map((a) => a.code),
                internal: internal.map((a) => a.code),
            },
            cryptoAssets: crypto.map((a) => ({
                code: a.code,
                coinId: a.cryptoMetadata?.coinId,
                enabled: a.enabled,
            })),
            fiatCurrencies: fiat.map((a) => ({
                code: a.code,
                isoCurrencyCode: a.fiatMetadata?.isoCurrencyCode,
                enabled: a.enabled,
            })),
            launchpadTokens: launchpad.map((a) => ({
                code: a.code,
                coinId: a.cryptoMetadata?.coinId,
                enabled: a.enabled,
            })),
            stablecoinCodes: stablecoins.map((a) => a.code),
            coinIdMap,
            fiatPairs,
            networks: allNetworks
                .filter((n) => n.enabled)
                .map((n) => ({ code: n.code, name: n.name, kind: n.kind })),
        };
    }
}

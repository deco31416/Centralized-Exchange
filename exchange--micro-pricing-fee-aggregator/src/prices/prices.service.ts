import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

/**
 * Servicio unificado de precios — PUNTO ÚNICO DE VERDAD.
 *
 * Consulta los 3 microservicios de pricing internos:
 *   - micro-pricing-fee-fiat      (:3014) → pares fiat (USD_MXN, USD_COP, etc.)
 *   - micro-pricing-fee-crypto    (:3012) → crypto (BTC, ETH, BNB, etc.)
 *   - micro-pricing-fee-launchpad (:3016) → tokens propios (DECOX-USD, DECO-USD, etc.)
 *
 * Todos requieren header x-internal-auth.
 * Cache en memoria con TTL de 30s.
 */

export interface AssetMetadata {
    name?: string;
    description?: string;
    iconUrl?: string;
    logoUrl?: string;
    category?: string;
    networks?: string[];
    decimals?: number;
    canBuy?: boolean;
    canSell?: boolean;
    canConvert?: boolean;
    canSend?: boolean;
}

export interface UnifiedPrice {
    assetCode: string;
    priceUsd: number;          // Cuánto vale 1 unidad en USD
    invertedRate: number;      // 1 USD = X unidades de esta moneda
    priceChange24h: number;    // % cambio en 24h
    volume24h: number;
    marketCap: number;
    source: 'fiat' | 'crypto' | 'launchpad' | 'stablecoin';
    stale: boolean;
    updatedAt: Date;
    metadata?: AssetMetadata;  // Enriquecido desde asset-registry (opcional)
}

/** Resultado de una conversión cruzada entre dos assets */
export interface ConversionResult {
    from: string;              // Asset origen  (ej: BTC)
    to: string;                // Asset destino (ej: MXN)
    rate: number;              // Tasa: 1 FROM = X TO  (ej: 1 BTC = 1,990,250 MXN)
    inverseRate: number;       // Tasa inversa: 1 TO = X FROM
    amount: number;            // Cantidad solicitada
    converted: number;         // Monto convertido (amount * rate)
    fromPriceUsd: number;      // Precio USD del origin
    toPriceUsd: number;        // Precio USD del destino
    timestamp: Date;
}

/** Par de intercambio con rate */
export interface ExchangePair {
    pair: string;              // BTC/MXN
    from: string;
    to: string;
    rate: number;              // 1 FROM = X TO
    inverseRate: number;       // 1 TO = X FROM
    fromSource: string;
    toSource: string;
}

interface CachedPrice extends UnifiedPrice {
    cachedAt: number;
}

@Injectable()
export class PricesService implements OnModuleInit {
    private readonly logger = new Logger(PricesService.name);

    private fiatBaseUrl: string;    // micro-pricing-fee-fiat (:3014)
    private cryptoBaseUrl: string;  // micro-pricing-fee-crypto (:3012)
    private launchpadBaseUrl: string; // micro-pricing-fee-launchpad (:3016)
    private registryUrl: string;    // asset-registry (:3010)
    private internalAuthToken: string;

    private cache = new Map<string, CachedPrice>();
    private readonly CACHE_TTL_MS = 30_000; // 30s
    private metadataCache = new Map<string, AssetMetadata>();
    private readonly STALE_LAUNCHPAD_TTL_MS = 30 * 60_000; // 30 min

    // ─── Hardcoded fallback sets (used if Registry is unavailable) ────
    private static readonly FALLBACK_STABLECOINS = new Set(['USD', 'USDT', 'USDC']);
    private static readonly FALLBACK_FIAT = new Set([
        'MXN', 'COP', 'PEN', 'SVC', 'EUR', 'GTQ', 'HNL',
        'VES', 'BRL', 'ARS', 'CLP', 'GBP',
    ]);
    private static readonly FALLBACK_LAUNCHPAD = new Set([
        'DECOX', 'DECO', 'DECOX-USD', 'DECO-USD',
        'DECO', 'DECO-USD', 'GDUSD', 'GDUSD-USD',
    ]);

    // ─── Dynamic sets (populated from Asset Registry) ────────────────
    private dynamicStablecoins: Set<string> | null = null;
    private dynamicFiat: Set<string> | null = null;
    private dynamicLaunchpad: Set<string> | null = null;
    private lastSyncAt: Date | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    onModuleInit() {
        this.fiatBaseUrl =
            this.configService.get<string>('PRICING_FIAT_URL') ||
            'http://localhost:3014/api/v1';
        this.cryptoBaseUrl =
            this.configService.get<string>('PRICING_CRYPTO_URL') ||
            'http://localhost:3012/api/v1';
        this.launchpadBaseUrl =
            this.configService.get<string>('PRICING_LAUNCHPAD_URL') ||
            'http://localhost:3016/api/v1';
        this.registryUrl =
            this.configService.get<string>('ASSET_REGISTRY_URL') ||
            'http://localhost:3010/api/v1';
        this.internalAuthToken =
            this.configService.get<string>('INTERNAL_AUTH_TOKEN') || '';

        this.logger.log(
            `PricesService init → fiat: ${this.fiatBaseUrl}, crypto: ${this.cryptoBaseUrl}, launchpad: ${this.launchpadBaseUrl}`,
        );

        // Sync categories + metadata from Registry (after 5s + every 5 min)
        setTimeout(() => this.syncCategoriesFromRegistry(), 5_000);
        setTimeout(() => this.syncMetadataFromRegistry(), 6_000);
        setInterval(() => this.syncCategoriesFromRegistry(), 5 * 60_000);
        setInterval(() => this.syncMetadataFromRegistry(), 5 * 60_000);
    }

    // ─── Registry Sync ───────────────────────────────────────────────

    /**
     * Loads asset categories from the Registry sync-manifest.
     * On success, replaces dynamic sets. On failure, keeps previous data.
     * The hardcoded fallback sets are ALWAYS available as last resort.
     */
    private async syncCategoriesFromRegistry() {
        try {
            const url = `${this.registryUrl}/catalog/sync-manifest`;
            const res = await lastValueFrom(
                this.httpService.get(url, { timeout: 5_000 }),
            );
            const data = res.data;

            if (data?.categories) {
                // Solo sobrescribir sets dinámicos si el Registry devuelve datos no vacíos.
                // Si el registro devuelve [] (no configurado), conservar el fallback hardcodeado.
                const stablecoins = data.categories.stablecoins || [];
                const fiat = data.categories.fiat || [];
                const launchpad = data.categories.launchpad || [];

                if (stablecoins.length > 0) {
                    this.dynamicStablecoins = new Set(stablecoins);
                }
                if (fiat.length > 0) {
                    this.dynamicFiat = new Set(fiat);
                }
                if (launchpad.length > 0) {
                    // Launchpad: include base code AND code-USD variants
                    const lp = new Set<string>();
                    for (const code of launchpad) {
                        lp.add(code);
                        lp.add(`${code}-USD`);
                    }
                    this.dynamicLaunchpad = lp;
                }

                this.lastSyncAt = new Date();
                this.logger.log(
                    `📡 Registry sync OK → stablecoins: ${stablecoins.length}, ` +
                    `fiat: ${fiat.length}, launchpad: ${launchpad.length} ` +
                    `(using ${fiat.length > 0 ? 'dynamic' : 'fallback'} fiat set)`,
                );
            }
        } catch (err) {
            this.logger.warn(
                `📡 Registry sync failed (${err.message}) — using ${this.dynamicStablecoins ? 'cached' : 'hardcoded fallback'} categories`,
            );
        }
    }

    /**
     * Sincroniza metadata de assets desde el Registry (nombre, iconUrl, descripción, flags).
     * Si el Registry no responde, el cache previo se conserva sin romper ningún endpoint.
     */
    private async syncMetadataFromRegistry() {
        try {
            const url = `${this.registryUrl}/assets?enabled=true`;
            const res = await lastValueFrom(
                this.httpService.get(url, { timeout: 5_000 }),
            );
            const assets: any[] = res.data || [];
            let synced = 0;
            for (const asset of assets) {
                const code: string = (asset.code || '').toUpperCase();
                if (!code) continue;
                this.metadataCache.set(code, {
                    name: asset.name,
                    description: asset.description,
                    iconUrl: asset.iconUrl,
                    logoUrl: asset.logoUrl,
                    category: asset.category,
                    networks: asset.cryptoMetadata?.networks || [],
                    decimals: asset.decimals,
                    canBuy: asset.canBuy,
                    canSell: asset.canSell,
                    canConvert: asset.canConvert,
                    canSend: asset.canSend,
                });
                synced++;
            }
            this.logger.log(`📦 Metadata sync OK → ${synced} assets cacheados`);
        } catch (err) {
            this.logger.warn(
                `📦 Metadata sync failed (${err.message}) — usando cache previo (${this.metadataCache.size} assets)`,
            );
        }
    }

    /** Adjunta metadata del cache al objeto UnifiedPrice si está disponible */
    private withMetadata(price: UnifiedPrice): UnifiedPrice {
        const meta = this.metadataCache.get(price.assetCode);
        return meta ? { ...price, metadata: meta } : price;
    }

    // ─── Category helpers (dynamic first, then fallback) ─────────────

    private get stablecoins(): Set<string> {
        return this.dynamicStablecoins || PricesService.FALLBACK_STABLECOINS;
    }

    private get fiatCurrencies(): Set<string> {
        return this.dynamicFiat || PricesService.FALLBACK_FIAT;
    }

    private get launchpadTokens(): Set<string> {
        return this.dynamicLaunchpad || PricesService.FALLBACK_LAUNCHPAD;
    }

    /** Headers de autenticación interna (todos los micros lo requieren) */
    private get authHeaders() {
        return { 'x-internal-auth': this.internalAuthToken };
    }

    // ─── Public API ──────────────────────────────────────────────────

    /**
     * Obtiene el precio unificado de un asset.
     * Resuelve automáticamente si es fiat, crypto o launchpad.
     */
    async getPrice(assetCode: string): Promise<UnifiedPrice> {
        const code = assetCode.toUpperCase();

        // Stablecoins = 1 USD
        if (this.stablecoins.has(code)) {
            return this.withMetadata({
                assetCode: code,
                priceUsd: 1,
                invertedRate: 1,
                priceChange24h: 0,
                volume24h: 0,
                marketCap: 0,
                source: 'stablecoin',
                stale: false,
                updatedAt: new Date(),
            });
        }

        // Check cache
        const cached = this.cache.get(code);
        if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
            return cached;
        }

        // Fetch from corresponding micro
        let price: UnifiedPrice;
        try {
            if (this.fiatCurrencies.has(code)) {
                price = await this.fetchFiatPrice(code);
            } else if (this.launchpadTokens.has(code)) {
                price = await this.fetchLaunchpadPrice(code);
            } else {
                price = await this.fetchCryptoPrice(code);
            }
        } catch (err) {
            this.logger.error(`Error fetching price for ${code}: ${err.message}`);
            if (cached) return { ...cached, stale: true };
            throw err;
        }

        // Cache y enriquecer con metadata
        this.cache.set(code, { ...price, cachedAt: Date.now() });
        return this.withMetadata(price);
    }

    /**
     * Obtiene precios para múltiples assets en una sola llamada.
     * Retorna mapa: { BTC: { priceUsd, ... }, MXN: { ... } }
     */
    async getPriceMap(
        assetCodes: string[],
    ): Promise<Record<string, UnifiedPrice>> {
        const unique = [...new Set(assetCodes.map((c) => c.toUpperCase()))];
        const results = await Promise.allSettled(
            unique.map(async (code) => ({
                code,
                price: await this.getPrice(code),
            })),
        );

        const map: Record<string, UnifiedPrice> = {};
        for (const r of results) {
            if (r.status === 'fulfilled') {
                map[r.value.code] = r.value.price;
            }
        }
        return map;
    }

    /**
     * Carga masiva: obtiene TODOS los precios de todos los micros en paralelo.
     * Útil para dashboards y reportes.
     */
    async getAllPrices(): Promise<UnifiedPrice[]> {
        const [fiatPrices, cryptoPrices, launchpadPrices] = await Promise.allSettled([
            this.fetchAllFiatPrices(),
            this.fetchAllCryptoPrices(),
            this.fetchAllLaunchpadPrices(),
        ]);

        const all: UnifiedPrice[] = [];

        if (fiatPrices.status === 'fulfilled') all.push(...fiatPrices.value);
        else this.logger.warn(`Failed to fetch all fiat prices: ${fiatPrices.reason}`);

        if (cryptoPrices.status === 'fulfilled') all.push(...cryptoPrices.value);
        else this.logger.warn(`Failed to fetch all crypto prices: ${cryptoPrices.reason}`);

        if (launchpadPrices.status === 'fulfilled') all.push(...launchpadPrices.value);
        else this.logger.warn(`Failed to fetch all launchpad prices: ${launchpadPrices.reason}`);

        // Cache y enriquecer con metadata
        for (const p of all) {
            this.cache.set(p.assetCode, { ...p, cachedAt: Date.now() });
        }

        return all.map((p) => this.withMetadata(p));
    }

    // ─── Private: Individual fetchers ────────────────────────────────

    /**
     * Fiat: GET /api/v1/internal/pricing/fiat/rate/USD/:quote
     * Response: FiatRateTicker { pairCode, baseRate, finalRate, rateChange24h, stale, createdAt }
     * finalRate = cuántas unidades de :quote por 1 USD (ej: USD_MXN → 20.50)
     * priceUsd = 1 / finalRate (ej: 1 MXN = 0.0488 USD)
     */
    private async fetchFiatPrice(code: string): Promise<UnifiedPrice> {
        const url = `${this.fiatBaseUrl}/internal/pricing/fiat/rate/USD/${code}`;
        this.logger.debug(`Fetching fiat: ${url}`);

        const res = await lastValueFrom(
            this.httpService.get(url, {
                timeout: 5_000,
                headers: this.authHeaders,
            }),
        );

        const data = res.data;
        const finalRate = data.finalRate || data.baseRate || 0;
        const priceUsd = finalRate > 0 ? 1 / finalRate : 0;
        return {
            assetCode: code,
            priceUsd,
            invertedRate: finalRate, // 1 USD = X MXN
            priceChange24h: data.rateChange24h || 0,
            volume24h: 0,
            marketCap: 0,
            source: 'fiat',
            stale: data.stale || false,
            updatedAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        };
    }

    /**
     * Crypto: GET /api/v1/internal/pricing/crypto/latest/:assetCode
     * Response: CryptoPriceTicker { basePriceUsd, finalBasePriceUsd, priceChange24h, volume24h, marketCap, stale, createdAt }
     */
    private async fetchCryptoPrice(code: string): Promise<UnifiedPrice> {
        const url = `${this.cryptoBaseUrl}/internal/pricing/crypto/latest/${code}`;
        this.logger.debug(`Fetching crypto: ${url}`);

        const res = await lastValueFrom(
            this.httpService.get(url, {
                timeout: 5_000,
                headers: this.authHeaders,
            }),
        );

        const data = res.data;
        const priceUsd = data.basePriceUsd || data.finalBasePriceUsd || 0;
        return {
            assetCode: code,
            priceUsd,
            invertedRate: priceUsd > 0 ? 1 / priceUsd : 0,
            priceChange24h: data.priceChange24h || 0,
            volume24h: data.volume24h || 0,
            marketCap: data.marketCap || 0,
            source: 'crypto',
            stale: data.stale || false,
            updatedAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        };
    }

    /**
     * Launchpad: GET /api/v1/internal/pricing/launchpad/latest/:tokenCode
     * Response: { tokenCode, currentPriceUsd, priceChange24h, volume24h, marketCap, lastUpdate }
     * Para tokens simples (DECOX, DECO) mapeamos a su tokenCode con sufijo USD → DECOX-USD, DECO-USD
     */
    private async fetchLaunchpadPrice(code: string): Promise<UnifiedPrice> {
        // El micro launchpad usa tokenCode sin sufijo (DECOX, not DECOX-USD)
        const tokenCode = code.includes('-') ? code.split('-')[0] : code;
        const url = `${this.launchpadBaseUrl}/internal/pricing/launchpad/latest/${tokenCode}`;
        this.logger.debug(`Fetching launchpad: ${url}`);

        const res = await lastValueFrom(
            this.httpService.get(url, {
                timeout: 5_000,
                headers: this.authHeaders,
            }),
        );

        const data = res.data;
        const priceUsd = data.currentPriceUsd || 0;
        return {
            assetCode: tokenCode,
            priceUsd,
            invertedRate: priceUsd > 0 ? 1 / priceUsd : 0,
            priceChange24h: data.priceChange24h || 0,
            volume24h: data.volume24h || 0,
            marketCap: data.marketCap || 0,
            source: 'launchpad',
            stale: data.lastUpdate
                ? (Date.now() - new Date(data.lastUpdate).getTime() > this.STALE_LAUNCHPAD_TTL_MS)
                : true,
            updatedAt: data.lastUpdate ? new Date(data.lastUpdate) : new Date(),
        };
    }

    // ─── Private: Bulk fetchers ──────────────────────────────────────

    private async fetchAllFiatPrices(): Promise<UnifiedPrice[]> {
        const url = `${this.fiatBaseUrl}/internal/pricing/fiat/all-rates`;
        const res = await lastValueFrom(
            this.httpService.get(url, { timeout: 8_000, headers: this.authHeaders }),
        );

        const tickers = res.data || [];
        const priceMap = new Map<string, UnifiedPrice>();

        // USD is the reference currency → always priceUsd = 1
        priceMap.set('USD', {
            assetCode: 'USD',
            priceUsd: 1,
            invertedRate: 1,
            priceChange24h: 0,
            volume24h: 0,
            marketCap: 0,
            source: 'fiat' as const,
            stale: false,
            updatedAt: new Date(),
        });

        for (const ticker of tickers) {
            const base: string = ticker.baseCurrency || ticker.pairCode?.split('_')[0] || '';
            const quote: string = ticker.quoteCurrency || ticker.pairCode?.split('_')[1] || '';
            const finalRate = ticker.finalRate || ticker.baseRate || 0;
            if (finalRate <= 0) continue;

            // USD_XXX → quote priceUsd = 1/rate (ej: USD_MXN rate=17 → MXN=$0.058)
            if (base === 'USD' && !priceMap.has(quote)) {
                priceMap.set(quote, {
                    assetCode: quote,
                    priceUsd: 1 / finalRate,
                    invertedRate: finalRate,
                    priceChange24h: ticker.rateChange24h || 0,
                    volume24h: 0,
                    marketCap: 0,
                    source: 'fiat',
                    stale: ticker.stale || false,
                    updatedAt: ticker.createdAt ? new Date(ticker.createdAt) : new Date(),
                });
            }
            // XXX_USD → base priceUsd = rate (ej: EUR_USD rate=1.08 → EUR=$1.08)
            else if (quote === 'USD' && !priceMap.has(base)) {
                priceMap.set(base, {
                    assetCode: base,
                    priceUsd: finalRate,
                    invertedRate: finalRate > 0 ? 1 / finalRate : 0,
                    priceChange24h: ticker.rateChange24h || 0,
                    volume24h: 0,
                    marketCap: 0,
                    source: 'fiat',
                    stale: ticker.stale || false,
                    updatedAt: ticker.createdAt ? new Date(ticker.createdAt) : new Date(),
                });
            }
            // Cross-rates (EUR_COP, MXN_COP, etc.) → skip, not direct USD reference
        }

        return [...priceMap.values()];
    }

    private async fetchAllCryptoPrices(): Promise<UnifiedPrice[]> {
        const url = `${this.cryptoBaseUrl}/internal/pricing/crypto/all-latest`;
        const res = await lastValueFrom(
            this.httpService.get(url, { timeout: 8_000, headers: this.authHeaders }),
        );

        return (res.data || []).map((ticker: any) => {
            const priceUsd = ticker.basePriceUsd || ticker.finalBasePriceUsd || 0;
            return {
                assetCode: ticker.assetCode,
                priceUsd,
                invertedRate: priceUsd > 0 ? 1 / priceUsd : 0,
                priceChange24h: ticker.priceChange24h || 0,
                volume24h: ticker.volume24h || 0,
                marketCap: ticker.marketCap || 0,
                source: 'crypto' as const,
                stale: ticker.stale || false,
                updatedAt: ticker.createdAt ? new Date(ticker.createdAt) : new Date(),
            };
        });
    }

    private async fetchAllLaunchpadPrices(): Promise<UnifiedPrice[]> {
        const url = `${this.launchpadBaseUrl}/internal/pricing/launchpad/all-latest`;
        const res = await lastValueFrom(
            this.httpService.get(url, { timeout: 8_000, headers: this.authHeaders }),
        );

        return (res.data || []).map((item: any) => {
            const priceUsd = item.currentPriceUsd || 0;
            const rawCode: string = item.tokenCode || '';
            return {
                assetCode: rawCode.includes('-') ? rawCode.split('-')[0] : rawCode,
                priceUsd,
                invertedRate: priceUsd > 0 ? 1 / priceUsd : 0,
                priceChange24h: item.priceChange24h || 0,
                volume24h: item.volume24h || 0,
                marketCap: item.marketCap || 0,
                source: 'launchpad' as const,
                stale: item.lastUpdate
                    ? (Date.now() - new Date(item.lastUpdate).getTime() > this.STALE_LAUNCHPAD_TTL_MS)
                    : true,
                updatedAt: item.lastUpdate ? new Date(item.lastUpdate) : new Date(),
            };
        });
    }

    // ─── Public: Conversión cruzada ──────────────────────────────────

    /**
     * Convierte entre dos assets cualesquiera usando USD como pivote.
     * Ej: convert('BTC', 'MXN', 1) → { rate: 1990250, converted: 1990250 }
     *     convert('ETH', 'COP', 2) → { rate: 13600000, converted: 27200000 }
     *     convert('COP', 'MXN')    → { rate: 0.004717 }
     */
    async convert(from: string, to: string, amount = 1): Promise<ConversionResult> {
        const fromCode = from.toUpperCase();
        const toCode = to.toUpperCase();

        // Obtener ambos precios en paralelo
        const [fromPrice, toPrice] = await Promise.all([
            this.getPrice(fromCode),
            this.getPrice(toCode),
        ]);

        // Cross-rate vía USD como pivote
        // 1 FROM = fromPriceUsd USD = fromPriceUsd / toPriceUsd TO
        const rate = toPrice.priceUsd > 0
            ? fromPrice.priceUsd / toPrice.priceUsd
            : 0;
        const inverseRate = rate > 0 ? 1 / rate : 0;

        return {
            from: fromCode,
            to: toCode,
            rate,
            inverseRate,
            amount,
            converted: amount * rate,
            fromPriceUsd: fromPrice.priceUsd,
            toPriceUsd: toPrice.priceUsd,
            timestamp: new Date(),
        };
    }

    /**
     * Genera la matriz completa de pares de intercambio.
     * Cruza todos los assets activos entre sí.
     * Útil para dashboards de trading, tablas de conversión.
     */
    async getExchangeMatrix(): Promise<{
        pairs: ExchangePair[];
        assets: UnifiedPrice[];
        summary: { totalAssets: number; totalPairs: number; fiat: number; crypto: number; launchpad: number };
    }> {
        const allPrices = await this.getAllPrices();

        // Añadir stablecoins base
        const stablecoinPrices: UnifiedPrice[] = [...this.stablecoins].map(code => ({
            assetCode: code,
            priceUsd: 1,
            invertedRate: 1,
            priceChange24h: 0,
            volume24h: 0,
            marketCap: 0,
            source: 'stablecoin' as const,
            stale: false,
            updatedAt: new Date(),
        }));

        const allAssets = [...stablecoinPrices, ...allPrices];

        // Generar pares relevantes (no all×all, solo útiles)
        // Cripto y launchpad vs todas las fiat + USD
        // Fiat vs USD y entre sí
        const fiatAssets = allAssets.filter(a => a.source === 'fiat' || a.source === 'stablecoin');
        const cryptoAssets = allAssets.filter(a => a.source === 'crypto');
        const launchpadAssets = allAssets.filter(a => a.source === 'launchpad');
        const tradableAssets = [...cryptoAssets, ...launchpadAssets];

        const pairs: ExchangePair[] = [];

        // 1) Crypto/Launchpad → cada moneda fiat/stablecoin
        for (const from of tradableAssets) {
            for (const to of fiatAssets) {
                if (from.priceUsd > 0 && to.priceUsd > 0) {
                    const rate = from.priceUsd / to.priceUsd;
                    pairs.push({
                        pair: `${from.assetCode}/${to.assetCode}`,
                        from: from.assetCode,
                        to: to.assetCode,
                        rate,
                        inverseRate: rate > 0 ? 1 / rate : 0,
                        fromSource: from.source,
                        toSource: to.source,
                    });
                }
            }
        }

        // 2) Fiat cruzadas (MXN/COP, MXN/PEN, etc.)
        for (let i = 0; i < fiatAssets.length; i++) {
            for (let j = i + 1; j < fiatAssets.length; j++) {
                const a = fiatAssets[i];
                const b = fiatAssets[j];
                if (a.priceUsd > 0 && b.priceUsd > 0) {
                    const rate = a.priceUsd / b.priceUsd;
                    pairs.push({
                        pair: `${a.assetCode}/${b.assetCode}`,
                        from: a.assetCode,
                        to: b.assetCode,
                        rate,
                        inverseRate: rate > 0 ? 1 / rate : 0,
                        fromSource: a.source,
                        toSource: b.source,
                    });
                }
            }
        }

        // 3) Crypto entre sí (BTC/ETH, ETH/BNB, etc.)
        for (let i = 0; i < tradableAssets.length; i++) {
            for (let j = i + 1; j < tradableAssets.length; j++) {
                const a = tradableAssets[i];
                const b = tradableAssets[j];
                if (a.priceUsd > 0 && b.priceUsd > 0) {
                    const rate = a.priceUsd / b.priceUsd;
                    pairs.push({
                        pair: `${a.assetCode}/${b.assetCode}`,
                        from: a.assetCode,
                        to: b.assetCode,
                        rate,
                        inverseRate: rate > 0 ? 1 / rate : 0,
                        fromSource: a.source,
                        toSource: b.source,
                    });
                }
            }
        }

        const fiatCount = allAssets.filter(a => a.source === 'fiat').length;
        const cryptoCount = cryptoAssets.length;
        const launchpadCount = launchpadAssets.length;

        return {
            pairs,
            assets: allAssets,
            summary: {
                totalAssets: allAssets.length,
                totalPairs: pairs.length,
                fiat: fiatCount,
                crypto: cryptoCount,
                launchpad: launchpadCount,
            },
        };
    }
}

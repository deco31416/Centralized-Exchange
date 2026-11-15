import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Cliente ligero para consultar el micro-pricing-fee-aggregator (port 3013).
 *
 * El aggregator es el punto único de verdad de precios unificados:
 *   - Internamente consulta micro-pricing-fee-fiat      (port 3014)
 *   - Internamente consulta micro-pricing-fee-crypto     (port 3012)
 *   - Internamente consulta micro-pricing-fee-launchpad  (port 3016)
 *   - Expone endpoints unificados: GET /prices/latest/:code y POST /prices/map
 *
 * Mantiene un cache local con TTL de 60s para no bombardear al aggregator.
 */

interface CachedRate {
  priceUsd: number;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60_000; // 60 segundos

@Injectable()
export class PricingClientService implements OnModuleInit {
  private readonly logger = new Logger(PricingClientService.name);

  private aggregatorBaseUrl: string;

  /** Cache en memoria: currency -> CachedRate */
  private cache = new Map<string, CachedRate>();

  /** Monedas que valen 1 USD (no necesitan lookup) */
  private static readonly STABLECOINS = new Set(['USD', 'USDT', 'USDC']);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.aggregatorBaseUrl =
      this.configService.get<string>('PRICING_AGGREGATOR_URL') ||
      'http://localhost:3013/api/v1';

    this.logger.log(`Pricing client → aggregator: ${this.aggregatorBaseUrl}`);
  }

  /**
   * Obtiene el precio en USD de 1 unidad de la moneda dada.
   * Ej: getPriceUsd('MXN') → 0.0488  (1 MXN = $0.0488 USD)
   *     getPriceUsd('BTC') → 97000    (1 BTC = $97,000 USD)
   *     getPriceUsd('USD') → 1
   */
  async getPriceUsd(currency: string): Promise<number> {
    if (PricingClientService.STABLECOINS.has(currency)) {
      return 1;
    }

    // Revisar cache
    const cached = this.cache.get(currency);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.priceUsd;
    }

    try {
      const url = `${this.aggregatorBaseUrl}/prices/latest/${currency}`;
      this.logger.debug(`Fetching price: ${url}`);

      const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
      if (!res.ok) throw new Error(`Aggregator HTTP ${res.status}`);

      const data = await res.json() as { priceUsd: number; assetCode: string };
      const priceUsd = data.priceUsd;

      this.cache.set(currency, { priceUsd, fetchedAt: Date.now() });
      return priceUsd;
    } catch (err) {
      this.logger.warn(`Error fetching price for ${currency}: ${err.message}`);
      if (cached) return cached.priceUsd;
      return this.getHardcodedFallback(currency);
    }
  }

  /**
   * Obtiene un mapa completo de precios para varias monedas a la vez.
   * Usa POST /prices/map del aggregator (batch en una sola llamada).
   * Retorna: { BTC: 97000, MXN: 0.0488, USD: 1, ... }
   */
  async getPriceMap(currencies: string[]): Promise<Record<string, number>> {
    const unique = [...new Set(currencies)];

    // Separar stablecoins (no necesitan fetch)
    const stables: Record<string, number> = {};
    const toFetch: string[] = [];
    for (const c of unique) {
      if (PricingClientService.STABLECOINS.has(c)) {
        stables[c] = 1;
      } else {
        // Si está en cache válido, usarlo
        const cached = this.cache.get(c);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
          stables[c] = cached.priceUsd;
        } else {
          toFetch.push(c);
        }
      }
    }

    if (toFetch.length === 0) return stables;

    try {
      const url = `${this.aggregatorBaseUrl}/prices/map`;
      this.logger.debug(`Fetching price map for: ${toFetch.join(', ')}`);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets: toFetch }),
        signal: AbortSignal.timeout(8_000),
      });

      if (!res.ok) throw new Error(`Aggregator map HTTP ${res.status}`);

      const data = await res.json() as {
        prices: Record<string, { priceUsd: number }>;
      };

      const result: Record<string, number> = { ...stables };
      for (const [code, info] of Object.entries(data.prices)) {
        result[code] = info.priceUsd;
        this.cache.set(code, { priceUsd: info.priceUsd, fetchedAt: Date.now() });
      }

      // Assets no encontrados → fallback
      for (const c of toFetch) {
        if (!(c in result)) {
          result[c] = this.getHardcodedFallback(c);
        }
      }

      return result;
    } catch (err) {
      this.logger.warn(`Error fetching price map from aggregator: ${err.message}`);
      // Fallback individual
      const result: Record<string, number> = { ...stables };
      for (const c of toFetch) {
        const cached = this.cache.get(c);
        result[c] = cached ? cached.priceUsd : this.getHardcodedFallback(c);
      }
      return result;
    }
  }

  /** Fallback de emergencia si el aggregator está completamente caído */
  private getHardcodedFallback(currency: string): number {
    const fallbacks: Record<string, number> = {
      MXN: 0.0571, COP: 0.00025, PEN: 0.27, SVC: 0.1143,
      BTC: 97000, ETH: 3400, BNB: 600,
      DECOX: 0.50, DECO: 1.20,
    };
    const price = fallbacks[currency] ?? 0;
    this.logger.warn(`Using FALLBACK price for ${currency}: $${price}`);
    return price;
  }
}

import { Controller, Get, Param, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PricesService } from './prices.service';
import { InternalAuthGuard } from '../shared/internal-auth.guard';

/**
 * Controlador unificado de precios.
 * Punto único de consulta para todos los consumidores
 * (wallet-ledger, BFF dashboard, etc.)
 *
 * Internamente orquesta los 3 micros de pricing:
 *   - micro-pricing-fee-fiat      (:3014)
 *   - micro-pricing-fee-crypto    (:3012)
 *   - micro-pricing-fee-launchpad (:3016)
 *
 * Rutas (con prefix /api/v1):
 *   GET  /prices/latest/:assetCode            → Precio individual
 *   POST /prices/map                          → Precios batch
 *   GET  /prices/all                          → Todos los precios
 *   GET  /prices/convert/:from/:to?amount=1   → Conversión cruzada
 *   GET  /prices/matrix                       → Matriz completa de pares de intercambio
 */
@Controller('prices')
@UseGuards(InternalAuthGuard)
export class PricesController {
    constructor(private readonly pricesService: PricesService) {}

    /**
     * Obtener precio actual de un asset (fiat, crypto, o launchpad).
     * GET /api/v1/prices/latest/BTC
     * GET /api/v1/prices/latest/MXN
     * GET /api/v1/prices/latest/DECOX
     */
    @Get('latest/:assetCode')
    async getLatest(@Param('assetCode') assetCode: string) {
        return this.pricesService.getPrice(assetCode);
    }

    /**
     * Obtener precios de múltiples assets en batch.
     * POST /api/v1/prices/map
     * Body: { assets: ["BTC", "MXN", "ETH", "COP", "DECOX"] }
     */
    @Post('map')
    async getPriceMap(@Body() body: { assets: string[] }) {
        const assets = body.assets || [];
        const prices = await this.pricesService.getPriceMap(assets);
        return {
            prices,
            count: Object.keys(prices).length,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Obtener TODOS los precios de todos los micros
     * (fiat + crypto + launchpad) en una sola llamada.
     * GET /api/v1/prices/all
     */
    @Get('all')
    async getAllPrices() {
        const prices = await this.pricesService.getAllPrices();
        return {
            prices,
            count: prices.length,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Conversión cruzada entre dos assets cualesquiera.
     * Usa USD como pivote: from.priceUsd / to.priceUsd = rate
     *
     * GET /api/v1/prices/convert/BTC/MXN          → 1 BTC = ~1,990,250 MXN
     * GET /api/v1/prices/convert/ETH/COP?amount=2  → 2 ETH = ~27,200,000 COP
     * GET /api/v1/prices/convert/COP/MXN           → 1 COP = ~0.004717 MXN
     * GET /api/v1/prices/convert/DECOX/USD           → 1 DECOX = ~0.50 USD
     */
    @Get('convert/:from/:to')
    async convert(
        @Param('from') from: string,
        @Param('to') to: string,
        @Query('amount') amountStr?: string,
    ) {
        const amount = amountStr ? parseFloat(amountStr) : 1;
        return this.pricesService.convert(from, to, isNaN(amount) ? 1 : amount);
    }

    /**
     * Matriz completa de pares de intercambio.
     * Retorna todos los assets + todos los pares de trading relevantes
     * con su rate calculado.
     *
     * GET /api/v1/prices/matrix
     *
     * Response: {
     *   pairs: [
     *     { pair: "BTC/MXN", from: "BTC", to: "MXN", rate: 1990250, inverseRate: 0.0000005 },
     *     { pair: "BTC/USD", from: "BTC", to: "USD", rate: 97000, inverseRate: 0.0000103 },
     *     { pair: "ETH/COP", from: "ETH", to: "COP", rate: 13600000, ... },
     *     { pair: "MXN/COP", from: "MXN", to: "COP", rate: 228.3, ... },
     *     { pair: "BTC/ETH", from: "BTC", to: "ETH", rate: 28.5, ... },
     *     ...
     *   ],
     *   assets: [ ...UnifiedPrice[] ],
     *   summary: { totalAssets, totalPairs, fiat, crypto, launchpad }
     * }
     */
    @Get('matrix')
    async getExchangeMatrix() {
        return this.pricesService.getExchangeMatrix();
    }
}

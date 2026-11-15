import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

@ApiTags('Pricing')
@ApiHeader({ name: 'x-internal-auth', description: 'Internal authentication token', required: true })
@Controller('internal/pricing/crypto')
@UseGuards(InternalAuthGuard)
export class PricingController {
    constructor(private readonly pricingService: PricingService) { }

    // ─── Price Queries ───────────────────────────────────────────────

    @ApiOperation({ summary: 'Get latest base price', description: 'Internal base price (no spreads, no deltas). Used by other microservices.' })
    @ApiParam({ name: 'assetCode', example: 'BTC', description: 'Crypto asset symbol' })
    @Get('latest/:assetCode')
    async getLatest(@Param('assetCode') assetCode: string) {
        return this.pricingService.getLatestPrice(assetCode);
    }

    @ApiOperation({ summary: 'Get all latest prices', description: 'All latest prices for all tracked assets.' })
    @Get('all-latest')
    async getAllLatest() {
        return this.pricingService.getAllLatestPrices();
    }

    @ApiOperation({ summary: 'Quick quote with full pricing', description: 'Final price with spreads, network deltas, entropy indicators, and alerts.' })
    @ApiParam({ name: 'assetCode', example: 'BTC' })
    @ApiParam({ name: 'networkCode', example: 'ERC20' })
    @ApiParam({ name: 'operation', enum: ['BUY', 'SELL'], example: 'BUY' })
    @Get('quote/:assetCode/:networkCode/:operation')
    async getQuote(
        @Param('assetCode') assetCode: string,
        @Param('networkCode') networkCode: string,
        @Param('operation') operation: 'BUY' | 'SELL',
    ) {
        return this.pricingService.calculateFinalPrice(assetCode, networkCode, operation);
    }

    @ApiOperation({ summary: 'Calculate final price (POST)', description: 'Full price calculation using request body. Same as GET /quote but via POST.' })
    @ApiBody({ schema: { type: 'object', properties: { asset: { type: 'string', example: 'BTC' }, network: { type: 'string', example: 'ERC20' }, operation: { type: 'string', enum: ['BUY', 'SELL'], example: 'BUY' } }, required: ['asset', 'network', 'operation'] } })
    @Post('calculate-final')
    async calculateFinal(@Body() body: { asset: string; network: string; operation: 'BUY' | 'SELL' }) {
        return this.pricingService.calculateFinalPrice(body.asset, body.network, body.operation);
    }

    @ApiOperation({ summary: 'Force-refresh prices', description: 'Immediately fetch fresh prices from all external APIs for all configured assets.' })
    @Post('refresh')
    async refresh() {
        await this.pricingService.refreshPrices();
        return { status: 'ok', message: 'Price refresh triggered' };
    }

    // ─── PriceConfiguration CRUD ─────────────────────────────────────

    @ApiOperation({ summary: 'List configurations', description: 'List all asset pricing configurations (sources, strategy, enabled).' })
    @Get('configurations')
    async getConfigurations() {
        return this.pricingService.getConfigurations();
    }

    @ApiOperation({ summary: 'Upsert configuration', description: 'Create or update an asset pricing configuration.' })
    @ApiBody({ schema: { type: 'object', properties: { assetCode: { type: 'string', example: 'BTC' }, sources: { type: 'array', items: { type: 'string' }, example: ['COINGECKO', 'COINMARKETCAP', 'CRYPTOCOMPARE'] }, aggregationStrategy: { type: 'string', enum: ['AVERAGE', 'MAX', 'MIN'], example: 'AVERAGE' }, enabled: { type: 'boolean', example: true } }, required: ['assetCode'] } })
    @Post('configurations')
    async upsertConfiguration(@Body() dto: {
        assetCode: string;
        sources?: string[];
        aggregationStrategy?: string;
        enabled?: boolean;
    }) {
        return this.pricingService.upsertConfiguration(dto);
    }

    @ApiOperation({ summary: 'Delete configuration', description: 'Remove an asset pricing configuration.' })
    @ApiParam({ name: 'assetCode', example: 'BTC' })
    @Delete('configurations/:assetCode')
    async deleteConfiguration(@Param('assetCode') assetCode: string) {
        await this.pricingService.deleteConfiguration(assetCode);
        return { status: 'ok', message: `Configuration for ${assetCode} deleted` };
    }
}

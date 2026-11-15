import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiHeader } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

@ApiTags('Pricing')
@ApiHeader({ name: 'x-internal-auth', description: 'Internal authentication token', required: true })
@Controller('internal/pricing/fiat')
@UseGuards(InternalAuthGuard)
export class PricingController {
    constructor(private readonly pricingService: PricingService) { }

    // ─── Rate Queries ────────────────────────────────────────────────

    @ApiOperation({ summary: 'Get latest rate for a pair', description: 'Internal base rate (no spreads, no deltas). Used by other microservices.' })
    @ApiParam({ name: 'base', example: 'USD', description: 'Base currency code' })
    @ApiParam({ name: 'quote', example: 'COP', description: 'Quote currency code' })
    @Get('rate/:base/:quote')
    async getLatestRate(
        @Param('base') base: string,
        @Param('quote') quote: string,
    ) {
        const pairCode = `${base}_${quote}`.toUpperCase();
        return this.pricingService.getLatestRate(pairCode);
    }

    @ApiOperation({ summary: 'Get all latest rates', description: 'All latest rates for all tracked currency pairs.' })
    @Get('all-rates')
    async getAllLatestRates() {
        return this.pricingService.getAllLatestRates();
    }

    @ApiOperation({ summary: 'Quick quote with full pricing', description: 'Final rate with spreads, corridor deltas, entropy indicators, and alerts.' })
    @ApiParam({ name: 'base', example: 'USD', description: 'Base currency' })
    @ApiParam({ name: 'quote', example: 'COP', description: 'Quote currency' })
    @ApiParam({ name: 'corridor', example: 'LOCAL', description: 'Transfer corridor (LOCAL, SWIFT, SEPA, etc.)' })
    @ApiParam({ name: 'operation', enum: ['BUY', 'SELL'], example: 'BUY' })
    @Get('quote/:base/:quote/:corridor/:operation')
    async getQuote(
        @Param('base') base: string,
        @Param('quote') quote: string,
        @Param('corridor') corridor: string,
        @Param('operation') operation: 'BUY' | 'SELL',
    ) {
        return this.pricingService.calculateFinalRate(base, quote, corridor, operation);
    }

    @ApiOperation({ summary: 'Calculate final rate (POST)', description: 'Full rate calculation using request body. Same as GET /quote but via POST.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                baseCurrency: { type: 'string', example: 'USD' },
                quoteCurrency: { type: 'string', example: 'COP' },
                corridor: { type: 'string', example: 'LOCAL' },
                operation: { type: 'string', enum: ['BUY', 'SELL'], example: 'BUY' },
            },
            required: ['baseCurrency', 'quoteCurrency', 'corridor', 'operation'],
        },
    })
    @Post('calculate-final')
    async calculateFinal(@Body() body: {
        baseCurrency: string;
        quoteCurrency: string;
        corridor: string;
        operation: 'BUY' | 'SELL';
    }) {
        return this.pricingService.calculateFinalRate(
            body.baseCurrency,
            body.quoteCurrency,
            body.corridor,
            body.operation,
        );
    }

    @ApiOperation({ summary: 'Force-refresh rates', description: 'Immediately fetch fresh rates from all external APIs for all configured pairs.' })
    @Post('refresh')
    async refresh() {
        await this.pricingService.refreshPrices();
        return { status: 'ok', message: 'Rate refresh triggered' };
    }

    // ─── FiatPairConfiguration CRUD ──────────────────────────────────

    @ApiOperation({ summary: 'List configurations', description: 'List all currency pair configurations (sources, strategy, enabled).' })
    @Get('configurations')
    async getConfigurations() {
        return this.pricingService.getConfigurations();
    }

    @ApiOperation({ summary: 'Upsert configuration', description: 'Create or update a currency pair configuration.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                baseCurrency: { type: 'string', example: 'USD' },
                quoteCurrency: { type: 'string', example: 'COP' },
                sources: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['EXCHANGERATE_API', 'FRANKFURTER', 'EXCHANGERATE_HOST'],
                },
                aggregationStrategy: {
                    type: 'string',
                    enum: ['AVERAGE', 'MAX', 'MIN', 'MEDIAN'],
                    example: 'AVERAGE',
                },
                enabled: { type: 'boolean', example: true },
            },
            required: ['baseCurrency', 'quoteCurrency'],
        },
    })
    @Post('configurations')
    async upsertConfiguration(@Body() dto: {
        baseCurrency: string;
        quoteCurrency: string;
        sources?: string[];
        aggregationStrategy?: string;
        enabled?: boolean;
    }) {
        return this.pricingService.upsertConfiguration(dto);
    }

    @ApiOperation({ summary: 'Delete configuration', description: 'Remove a currency pair configuration.' })
    @ApiParam({ name: 'base', example: 'USD' })
    @ApiParam({ name: 'quote', example: 'COP' })
    @Delete('configurations/:base/:quote')
    async deleteConfiguration(
        @Param('base') base: string,
        @Param('quote') quote: string,
    ) {
        await this.pricingService.deleteConfiguration(base, quote);
        return { status: 'ok', message: `Configuration for ${base}/${quote} deleted` };
    }
}

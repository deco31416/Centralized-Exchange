import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

@ApiTags('Pricing')
@ApiHeader({ name: 'x-internal-auth', description: 'Internal authentication token', required: true })
@Controller('internal/pricing/launchpad')
@UseGuards(InternalAuthGuard)
export class PricingController {
    constructor(private readonly pricingService: PricingService) { }

    // ─── Price Queries ───────────────────────────────────────────────

    @ApiOperation({ summary: 'Get latest base price', description: 'Internal base price for a custom token (no spreads, no deltas). Used by other microservices.' })
    @ApiParam({ name: 'tokenCode', example: 'DECOX-USD', description: 'Custom token code' })
    @Get('latest/:tokenCode')
    async getLatest(@Param('tokenCode') tokenCode: string) {
        return this.pricingService.getLatestPrice(tokenCode);
    }

    @ApiOperation({ summary: 'Get all latest prices', description: 'All latest prices for all enabled custom tokens.' })
    @Get('all-latest')
    async getAllLatest() {
        return this.pricingService.getAllLatestPrices();
    }

    @ApiOperation({ summary: 'Quick quote with full pricing', description: 'Final price with spreads, network deltas, entropy indicators, peg info, and alerts.' })
    @ApiParam({ name: 'tokenCode', example: 'DECOX-USD' })
    @ApiParam({ name: 'networkCode', example: 'INTERNAL' })
    @ApiParam({ name: 'operation', enum: ['BUY', 'SELL'], example: 'BUY' })
    @Get('quote/:tokenCode/:networkCode/:operation')
    async getQuote(
        @Param('tokenCode') tokenCode: string,
        @Param('networkCode') networkCode: string,
        @Param('operation') operation: 'BUY' | 'SELL',
    ) {
        return this.pricingService.calculateFinalPrice(tokenCode, networkCode, operation);
    }

    @ApiOperation({ summary: 'Calculate final price (POST)', description: 'Full price calculation using request body. Same as GET /quote but via POST.' })
    @ApiBody({ schema: { type: 'object', properties: { tokenCode: { type: 'string', example: 'DECOX-USD' }, network: { type: 'string', example: 'INTERNAL' }, operation: { type: 'string', enum: ['BUY', 'SELL'], example: 'BUY' } }, required: ['tokenCode', 'network', 'operation'] } })
    @Post('calculate-final')
    async calculateFinal(@Body() body: { tokenCode: string; network: string; operation: 'BUY' | 'SELL' }) {
        return this.pricingService.calculateFinalPrice(body.tokenCode, body.network, body.operation);
    }

    @ApiOperation({ summary: 'Bulk quotes for all tokens', description: 'Calculate final buy/sell prices for ALL enabled tokens on a given network.' })
    @ApiParam({ name: 'networkCode', example: 'INTERNAL' })
    @ApiParam({ name: 'operation', enum: ['BUY', 'SELL'], example: 'BUY' })
    @Get('bulk-quote/:networkCode/:operation')
    async bulkQuote(
        @Param('networkCode') networkCode: string,
        @Param('operation') operation: 'BUY' | 'SELL',
    ) {
        return this.pricingService.getAllQuotes(networkCode, operation);
    }
}

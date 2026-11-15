import {
    Controller, Get, Post, Put, Patch, Delete,
    Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { PegSyncService } from './peg-sync.service';
import { SimulationEngineService } from './simulation-engine.service';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { UpdatePriceDto } from './dto/update-price.dto';

@ApiTags('Custom Tokens')
@ApiHeader({ name: 'x-internal-auth', description: 'Internal authentication token', required: true })
@Controller('internal/custom-tokens')
@UseGuards(InternalAuthGuard)
export class TokensController {
    constructor(
        private readonly tokensService: TokensService,
        private readonly pegSyncService: PegSyncService,
        private readonly simulationEngine: SimulationEngineService,
    ) { }

    // ─── CRUD ────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'List all custom tokens', description: 'List all registered launchpad tokens with optional filters.' })
    @ApiQuery({ name: 'category', required: false, enum: ['STABLE', 'ALTCOIN', 'UTILITY', 'PARTNER', 'MEME'] })
    @ApiQuery({ name: 'pricingModel', required: false, enum: ['MANUAL', 'PEGGED', 'INTERNAL', 'SIMULATED'] })
    @ApiQuery({ name: 'enabled', required: false, type: Boolean })
    @Get()
    async findAll(
        @Query('category') category?: string,
        @Query('pricingModel') pricingModel?: string,
        @Query('enabled') enabled?: string,
    ) {
        return this.tokensService.findAll({
            category,
            pricingModel,
            enabled: enabled !== undefined ? enabled === 'true' : undefined,
        });
    }

    @ApiOperation({ summary: 'Get token by code', description: 'Get full details of a specific custom token.' })
    @ApiParam({ name: 'tokenCode', example: 'DECOX-USD', description: 'Token symbol code' })
    @Get(':tokenCode')
    async findByCode(@Param('tokenCode') tokenCode: string) {
        return this.tokensService.findByCode(tokenCode);
    }

    @ApiOperation({ summary: 'Create a new custom token', description: 'Register a new launchpad token with pricing model, peg config, simulation params, etc.' })
    @Post()
    async create(@Body() dto: CreateTokenDto) {
        return this.tokensService.create(dto);
    }

    @ApiOperation({ summary: 'Update token configuration', description: 'Update name, category, peg config, simulation params, volatility profile, etc.' })
    @ApiParam({ name: 'tokenCode', example: 'DECOX-USD' })
    @Put(':tokenCode')
    async update(@Param('tokenCode') tokenCode: string, @Body() dto: UpdateTokenDto) {
        return this.tokensService.update(tokenCode, dto);
    }

    @ApiOperation({ summary: 'Delist (soft-delete) a token', description: 'Disables the token and marks it as delisted. Does not remove from database.' })
    @ApiParam({ name: 'tokenCode', example: 'DECOX-USD' })
    @Delete(':tokenCode')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('tokenCode') tokenCode: string) {
        await this.tokensService.remove(tokenCode);
    }

    // ─── PRICE MANAGEMENT ────────────────────────────────────────────

    @ApiOperation({ summary: 'Update token price (admin)', description: 'Directly set the price for any token. Primary method for MANUAL model; admin override for PEGGED/SIMULATED.' })
    @ApiParam({ name: 'tokenCode', example: 'DECOX-USD' })
    @Patch(':tokenCode/price')
    async updatePrice(
        @Param('tokenCode') tokenCode: string,
        @Body() dto: UpdatePriceDto,
    ) {
        return this.tokensService.updatePrice(tokenCode, dto);
    }

    // ─── TICKER HISTORY ──────────────────────────────────────────────

    @ApiOperation({ summary: 'Get latest ticker for a token', description: 'Most recent price snapshot with source, change %, and metadata.' })
    @ApiParam({ name: 'tokenCode', example: 'DECOX-USD' })
    @Get(':tokenCode/ticker/latest')
    async getLatestTicker(@Param('tokenCode') tokenCode: string) {
        return this.tokensService.getLatestTicker(tokenCode);
    }

    @ApiOperation({ summary: 'Get all latest tickers', description: 'Latest price snapshot for every enabled token.' })
    @Get('tickers/all-latest')
    async getAllLatestTickers() {
        return this.tokensService.getAllLatestTickers();
    }

    @ApiOperation({ summary: 'Get ticker history', description: 'Price history for a token (append-only, newest first).' })
    @ApiParam({ name: 'tokenCode', example: 'DECOX-USD' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max records to return (default 100)' })
    @Get(':tokenCode/ticker/history')
    async getTickerHistory(
        @Param('tokenCode') tokenCode: string,
        @Query('limit') limit?: string,
    ) {
        return this.tokensService.getTickerHistory(tokenCode, limit ? parseInt(limit, 10) : 100);
    }

    // ─── PEG SYNC ────────────────────────────────────────────────────

    @ApiOperation({ summary: 'Trigger peg sync for a token', description: 'Manually trigger a peg check and price correction for a PEGGED token.' })
    @ApiParam({ name: 'tokenCode', example: 'DECOX-USD' })
    @ApiResponse({ status: 200, description: 'Sync result: synced, skipped, or error' })
    @Post(':tokenCode/peg-sync')
    async triggerPegSync(@Param('tokenCode') tokenCode: string) {
        const result = await this.pegSyncService.syncTokenPeg(tokenCode);
        return { tokenCode, result };
    }

    @ApiOperation({ summary: 'Trigger peg sync for ALL pegged tokens', description: 'Run peg synchronization cycle for every PEGGED token.' })
    @Post('peg-sync/all')
    async triggerAllPegSync() {
        return this.pegSyncService.syncAllPegs();
    }

    // ─── SIMULATION CONTROL ──────────────────────────────────────────

    @ApiOperation({ summary: 'Start simulation for a token', description: 'Start the algorithmic price simulation engine for a specific SIMULATED token.' })
    @ApiParam({ name: 'tokenCode', example: 'DECO-GAME' })
    @ApiBody({ schema: { type: 'object', properties: { intervalMs: { type: 'number', example: 300000, description: 'Tick interval in milliseconds (default from token config)' } } } })
    @Post(':tokenCode/simulation/start')
    async startSimulation(
        @Param('tokenCode') tokenCode: string,
        @Body('intervalMs') intervalMs?: number,
    ) {
        const token = await this.tokensService.findByCode(tokenCode);
        const interval = intervalMs || token.simulationConfig?.tickIntervalMs || 300_000;
        this.simulationEngine.startSimulation(tokenCode, interval);
        return { tokenCode, status: 'started', intervalMs: interval };
    }

    @ApiOperation({ summary: 'Stop simulation for a token', description: 'Stop the algorithmic price simulation engine for a specific token.' })
    @ApiParam({ name: 'tokenCode', example: 'DECO-GAME' })
    @Post(':tokenCode/simulation/stop')
    async stopSimulation(@Param('tokenCode') tokenCode: string) {
        this.simulationEngine.stopSimulation(tokenCode);
        return { tokenCode, status: 'stopped' };
    }

    @ApiOperation({ summary: 'Restart all simulations', description: 'Stop all current simulations and restart them from token configurations.' })
    @Post('simulation/restart-all')
    async restartAllSimulations() {
        this.simulationEngine.stopAllSimulations();
        await this.simulationEngine.startAllSimulations();
        return { status: 'restarted' };
    }
}

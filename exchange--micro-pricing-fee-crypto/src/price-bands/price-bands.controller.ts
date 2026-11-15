import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiHeader } from '@nestjs/swagger';
import { PriceBandsService } from './price-bands.service';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';
import { CreatePriceBandDto } from './dto/create-price-band.dto';
import { UpdatePriceBandDto } from './dto/update-price-band.dto';

@ApiTags('Price Bands')
@ApiHeader({ name: 'x-internal-auth', description: 'Internal authentication token', required: true })
@Controller('internal/price-bands')
@UseGuards(InternalAuthGuard)
export class PriceBandsController {
    constructor(private readonly priceBandsService: PriceBandsService) { }

    // ─── CRUD ────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'List all price bands', description: 'List all price bands with optional filters by asset, alert level, or enabled status.' })
    @ApiQuery({ name: 'assetCode', required: false, example: 'BTC' })
    @ApiQuery({ name: 'alertLevel', required: false, enum: ['SAFE', 'WARNING', 'DANGER', 'BLOCKED'] })
    @ApiQuery({ name: 'enabled', required: false, type: Boolean })
    @Get()
    async findAll(
        @Query('assetCode') assetCode?: string,
        @Query('alertLevel') alertLevel?: string,
        @Query('enabled') enabled?: string,
    ) {
        return this.priceBandsService.findAll({
            assetCode,
            alertLevel,
            enabled: enabled !== undefined ? enabled === 'true' : undefined,
        });
    }

    @ApiOperation({ summary: 'Traffic-light alert dashboard', description: 'Alert summary (SAFE/WARNING/DANGER/BLOCKED) for all enabled bands.' })
    @Get('alerts')
    async getAlerts() {
        return this.priceBandsService.getAlerts();
    }

    @ApiOperation({ summary: 'Alerts for specific asset', description: 'Alert summary for all networks of a specific asset.' })
    @ApiParam({ name: 'assetCode', example: 'BTC' })
    @Get('alerts/:assetCode')
    async getAlertForAsset(@Param('assetCode') assetCode: string) {
        return this.priceBandsService.getAlertsForAsset(assetCode);
    }

    @ApiOperation({ summary: 'Lookup band for asset+network', description: 'Find the active band for an asset, with optional network-specific override.' })
    @ApiQuery({ name: 'assetCode', required: true, example: 'BTC' })
    @ApiQuery({ name: 'networkCode', required: false, example: 'ERC20' })
    @Get('lookup')
    async lookup(
        @Query('assetCode') assetCode: string,
        @Query('networkCode') networkCode?: string,
    ) {
        const band = await this.priceBandsService.getBand(assetCode, networkCode);
        return band || { message: 'No band configured', assetCode, networkCode };
    }

    @ApiOperation({ summary: 'Get band by ID' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.priceBandsService.findById(id);
    }

    @ApiOperation({ summary: 'Create a new price band', description: 'Create a price band with manual/auto mode, spreads, and legal limits.' })
    @Post()
    async create(@Body() dto: CreatePriceBandDto) {
        return this.priceBandsService.create(dto);
    }

    @ApiOperation({ summary: 'Update a price band', description: 'Update manual spreads, legal limits, or enabled status.' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdatePriceBandDto) {
        return this.priceBandsService.update(id, dto);
    }

    @ApiOperation({ summary: 'Switch band mode (MANUAL/AUTO)', description: '"Toma el control" button — switch between admin-controlled (MANUAL) and entropy-driven (AUTO) mode.' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @ApiBody({ schema: { type: 'object', properties: { mode: { type: 'string', enum: ['MANUAL', 'AUTO'] } }, required: ['mode'] } })
    @Put(':id/mode')
    async switchMode(
        @Param('id') id: string,
        @Body('mode') mode: 'MANUAL' | 'AUTO',
    ) {
        return this.priceBandsService.switchMode(id, mode);
    }

    @ApiOperation({ summary: 'Delete a price band' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.priceBandsService.remove(id);
    }

    // ─── Entropy ─────────────────────────────────────────────────────

    @ApiOperation({ summary: 'Force-refresh entropy', description: 'Recalculate entropy indicators for all enabled bands.' })
    @Post('refresh-entropy')
    async refreshEntropy() {
        await this.priceBandsService.refreshEntropy();
        return { status: 'ok', message: 'Entropy recalculated for all bands' };
    }
}

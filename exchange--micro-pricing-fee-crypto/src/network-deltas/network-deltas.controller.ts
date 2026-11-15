import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiHeader } from '@nestjs/swagger';
import { NetworkDeltasService } from './network-deltas.service';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';
import { CreateNetworkDeltaDto } from './dto/create-network-delta.dto';
import { UpdateNetworkDeltaDto, PauseNetworkDto, DeactivateEmergencyDto } from './dto/update-network-delta.dto';

@ApiTags('Network Deltas')
@ApiHeader({ name: 'x-internal-auth', description: 'Internal authentication token', required: true })
@Controller('internal/network-deltas')
@UseGuards(InternalAuthGuard)
export class NetworkDeltasController {
    constructor(private readonly networkDeltasService: NetworkDeltasService) { }

    // ─── CRUD ────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'List all network deltas', description: 'List all network delta configurations with optional filters.' })
    @ApiQuery({ name: 'assetCode', required: false, example: 'USDT' })
    @ApiQuery({ name: 'networkCode', required: false, example: 'ERC20' })
    @ApiQuery({ name: 'enabled', required: false, type: Boolean })
    @Get()
    async findAll(
        @Query('assetCode') assetCode?: string,
        @Query('networkCode') networkCode?: string,
        @Query('enabled') enabled?: string,
    ) {
        return this.networkDeltasService.findAll({
            assetCode,
            networkCode,
            enabled: enabled !== undefined ? enabled === 'true' : undefined,
        });
    }

    @ApiOperation({ summary: 'Lookup delta for asset+network', description: 'Get the delta for a specific asset+network combination.' })
    @ApiQuery({ name: 'assetCode', required: true, example: 'USDT' })
    @ApiQuery({ name: 'networkCode', required: true, example: 'ERC20' })
    @Get('lookup')
    async lookup(
        @Query('assetCode') assetCode: string,
        @Query('networkCode') networkCode: string,
    ) {
        const delta = await this.networkDeltasService.getDelta(assetCode, networkCode);
        return delta || { totalDeltaUsd: 0, message: 'No delta configured' };
    }

    @ApiOperation({ summary: 'Get active emergencies', description: 'List all deltas with active emergency status.' })
    @Get('emergencies')
    async getEmergencies() {
        return this.networkDeltasService.getActiveEmergencies();
    }

    @ApiOperation({ summary: 'Get delta by ID' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.networkDeltasService.findById(id);
    }

    @ApiOperation({ summary: 'Create network delta', description: 'Create a new network delta with manual cost and emergency config.' })
    @Post()
    async create(@Body() dto: CreateNetworkDeltaDto) {
        return this.networkDeltasService.create(dto);
    }

    @ApiOperation({ summary: 'Update network delta', description: 'Update manual delta amount, emergency config, or enabled status.' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateNetworkDeltaDto) {
        return this.networkDeltasService.updateManualDelta(id, dto);
    }

    @ApiOperation({ summary: 'Delete network delta' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.networkDeltasService.remove(id);
    }

    // ─── Network Pause / Resume ──────────────────────────────────────

    @ApiOperation({ summary: 'Pause network', description: 'Block all transactions for this network (admin emergency action).' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Post(':id/pause')
    async pauseNetwork(@Param('id') id: string, @Body() dto: PauseNetworkDto) {
        return this.networkDeltasService.pauseNetwork(id, dto);
    }

    @ApiOperation({ summary: 'Resume paused network', description: 'Resume transactions for a previously paused network.' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @ApiBody({ schema: { type: 'object', properties: { resumedBy: { type: 'string', example: 'admin' } }, required: ['resumedBy'] } })
    @Post(':id/resume')
    async resumeNetwork(
        @Param('id') id: string,
        @Body('resumedBy') resumedBy: string,
    ) {
        return this.networkDeltasService.resumeNetwork(id, resumedBy);
    }

    // ─── Emergency ───────────────────────────────────────────────────

    @ApiOperation({ summary: 'Activate emergency', description: 'Manually activate emergency delta for a network. May auto-pause the network.' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @ApiBody({ schema: { type: 'object', properties: { deltaUsd: { type: 'number', example: 2.5 }, reason: { type: 'string', example: 'Network congestion' }, activatedBy: { type: 'string', example: 'admin' } }, required: ['deltaUsd', 'reason', 'activatedBy'] } })
    @Post(':id/activate-emergency')
    async activateEmergency(
        @Param('id') id: string,
        @Body() dto: { deltaUsd: number; reason: string; activatedBy: string },
    ) {
        return this.networkDeltasService.activateEmergency(id, dto);
    }

    @ApiOperation({ summary: 'Deactivate emergency', description: 'Deactivate an active emergency and optionally resume the network.' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Post(':id/deactivate-emergency')
    async deactivateEmergency(
        @Param('id') id: string,
        @Body() dto: DeactivateEmergencyDto,
    ) {
        return this.networkDeltasService.deactivateEmergency(id, dto);
    }
}

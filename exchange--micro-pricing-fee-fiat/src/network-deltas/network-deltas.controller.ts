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

    @ApiOperation({ summary: 'List all corridor deltas', description: 'List all corridor delta configurations with optional filters.' })
    @ApiQuery({ name: 'pairCode', required: false, example: 'USD_COP' })
    @ApiQuery({ name: 'corridorCode', required: false, example: 'SWIFT' })
    @ApiQuery({ name: 'enabled', required: false, type: Boolean })
    @Get()
    async findAll(
        @Query('pairCode') pairCode?: string,
        @Query('corridorCode') corridorCode?: string,
        @Query('enabled') enabled?: string,
    ) {
        return this.networkDeltasService.findAll({
            pairCode,
            corridorCode,
            enabled: enabled !== undefined ? enabled === 'true' : undefined,
        });
    }

    @ApiOperation({ summary: 'Lookup delta for pair+corridor', description: 'Get the delta for a specific pair+corridor combination.' })
    @ApiQuery({ name: 'pairCode', required: true, example: 'USD_COP' })
    @ApiQuery({ name: 'corridorCode', required: true, example: 'SWIFT' })
    @Get('lookup')
    async lookup(
        @Query('pairCode') pairCode: string,
        @Query('corridorCode') corridorCode: string,
    ) {
        const delta = await this.networkDeltasService.getDelta(pairCode, corridorCode);
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

    @ApiOperation({ summary: 'Create corridor delta', description: 'Create a new corridor delta with manual cost and emergency config.' })
    @Post()
    async create(@Body() dto: CreateNetworkDeltaDto) {
        return this.networkDeltasService.create(dto);
    }

    @ApiOperation({ summary: 'Update corridor delta', description: 'Update manual delta amount, emergency config, or enabled status.' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateNetworkDeltaDto) {
        return this.networkDeltasService.updateManualDelta(id, dto);
    }

    @ApiOperation({ summary: 'Delete corridor delta' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.networkDeltasService.remove(id);
    }

    // ─── Network Pause / Resume ──────────────────────────────────────

    @ApiOperation({ summary: 'Pause corridor', description: 'Block all transactions for this corridor (admin emergency action).' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Post(':id/pause')
    async pauseNetwork(@Param('id') id: string, @Body() dto: PauseNetworkDto) {
        return this.networkDeltasService.pauseNetwork(id, dto);
    }

    @ApiOperation({ summary: 'Resume paused corridor', description: 'Resume transactions for a previously paused corridor.' })
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

    @ApiOperation({ summary: 'Activate emergency', description: 'Manually activate emergency delta for a corridor. May auto-pause the corridor.' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @ApiBody({ schema: { type: 'object', properties: { deltaUsd: { type: 'number', example: 2.5 }, reason: { type: 'string', example: 'Corridor congestion' }, activatedBy: { type: 'string', example: 'admin' } }, required: ['deltaUsd', 'reason', 'activatedBy'] } })
    @Post(':id/activate-emergency')
    async activateEmergency(
        @Param('id') id: string,
        @Body() dto: { deltaUsd: number; reason: string; activatedBy: string },
    ) {
        return this.networkDeltasService.activateEmergency(id, dto);
    }

    @ApiOperation({ summary: 'Deactivate emergency', description: 'Deactivate an active emergency and optionally resume the corridor.' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @Post(':id/deactivate-emergency')
    async deactivateEmergency(
        @Param('id') id: string,
        @Body() dto: DeactivateEmergencyDto,
    ) {
        return this.networkDeltasService.deactivateEmergency(id, dto);
    }
}

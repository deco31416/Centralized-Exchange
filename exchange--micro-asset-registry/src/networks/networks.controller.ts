import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { CreateNetworkDto, UpdateNetworkDto } from './dto/network.dto';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

@Controller('internal/networks')
@UseGuards(InternalAuthGuard)
export class NetworksController {
    constructor(private readonly networksService: NetworksService) { }

    @Post()
    async create(@Body() createNetworkDto: CreateNetworkDto) {
        return this.networksService.create(createNetworkDto);
    }

    @Get()
    async findAll(
        @Query('kind') kind?: string,
        @Query('enabled') enabled?: string,
    ) {
        const filters: any = {};

        if (kind) filters.kind = kind;
        if (enabled !== undefined) filters.enabled = enabled === 'true';

        return this.networksService.findAll(filters);
    }

    @Get(':code')
    async findOne(@Param('code') code: string) {
        return this.networksService.findOne(code);
    }

    @Put(':code')
    async update(
        @Param('code') code: string,
        @Body() updateNetworkDto: UpdateNetworkDto,
    ) {
        return this.networksService.update(code, updateNetworkDto);
    }

    @Post(':code/enable')
    async enable(@Param('code') code: string) {
        return this.networksService.enable(code);
    }

    @Post(':code/disable')
    async disable(@Param('code') code: string) {
        return this.networksService.disable(code);
    }

    @Delete(':code')
    async delete(@Param('code') code: string) {
        await this.networksService.delete(code);
        return { message: `Network ${code} deleted successfully` };
    }
}

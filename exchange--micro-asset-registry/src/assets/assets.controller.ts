import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

@Controller('internal/assets')
@UseGuards(InternalAuthGuard)
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    async create(@Body() createAssetDto: CreateAssetDto) {
        return this.assetsService.create(createAssetDto);
    }

    @Get()
    async findAll(
        @Query('type') type?: string,
        @Query('enabled') enabled?: string,
    ) {
        const filters: any = {};

        if (type) filters.type = type;
        if (enabled !== undefined) filters.enabled = enabled === 'true';

        return this.assetsService.findAll(filters);
    }

    @Get(':code')
    async findOne(@Param('code') code: string) {
        return this.assetsService.findOne(code);
    }

    @Put(':code')
    async update(
        @Param('code') code: string,
        @Body() updateAssetDto: UpdateAssetDto,
    ) {
        return this.assetsService.update(code, updateAssetDto);
    }

    @Post(':code/enable')
    async enable(@Param('code') code: string) {
        return this.assetsService.enable(code);
    }

    @Post(':code/disable')
    async disable(@Param('code') code: string) {
        return this.assetsService.disable(code);
    }

    @Delete(':code')
    async delete(@Param('code') code: string) {
        await this.assetsService.delete(code);
        return { message: `Asset ${code} deleted successfully` };
    }
}

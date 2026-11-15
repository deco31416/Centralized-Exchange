import { Controller, Get, Param, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';

/**
 * Public read-only endpoints – NO InternalAuthGuard.
 * Prefix: /api/v1/assets
 * Usado por: frontends, aggregator, gateway, etc.
 */
@Controller('assets')
export class AssetsPublicController {
    constructor(private readonly assetsService: AssetsService) { }

    /** GET /assets?type=crypto&enabled=true */
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

    /** GET /assets/:code */
    @Get(':code')
    async findOne(@Param('code') code: string) {
        return this.assetsService.findOne(code);
    }
}

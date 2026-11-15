import { Controller, Get, Param, Query } from '@nestjs/common';
import { NetworksService } from './networks.service';

/**
 * Public read-only endpoints – NO InternalAuthGuard.
 * Prefix: /api/v1/networks
 * Usado por: frontends, aggregator, gateway, etc.
 */
@Controller('networks')
export class NetworksPublicController {
    constructor(private readonly networksService: NetworksService) { }

    /** GET /networks?kind=BLOCKCHAIN&enabled=true */
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

    /** GET /networks/:code */
    @Get(':code')
    async findOne(@Param('code') code: string) {
        return this.networksService.findOne(code);
    }
}

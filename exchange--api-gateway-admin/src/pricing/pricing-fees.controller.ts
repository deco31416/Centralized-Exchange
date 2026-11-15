import {
    All,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
    Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';

/**
 * Admin CRUD para fee-schedules del pricing-aggregator.
 * Rutas: /api/v1/admin/pricing/fee-schedules[/:id][/enable|/disable]
 * - Requiere admin JWT Bearer (validado por AdminJwtGuard)
 * - Proxea a aggregator :3013 /api/v1/internal/fees/schedules
 */
@ApiTags('admin/pricing')
@ApiBearerAuth()
@Controller('admin/pricing/fee-schedules')
@UseGuards(AdminJwtGuard, ThrottlerGuard)
export class PricingFeesController {
    constructor(private readonly proxyService: ProxyService) {}

    private buildAggregatorPath(rest?: string, query?: string): string {
        const base = '/api/v1/internal/fees/schedules';
        const path = rest ? `${base}/${rest}` : base;
        return query ? `${path}${query}` : path;
    }

    private getQueryString(request: Request): string {
        const idx = request.originalUrl.indexOf('?');
        return idx >= 0 ? request.originalUrl.slice(idx) : '';
    }

    /**
     * GET /api/v1/admin/pricing/fee-schedules
     * GET /api/v1/admin/pricing/fee-schedules?enabled=true
     */
    @Get()
    @ApiOperation({ summary: 'Listar fee schedules (admin)' })
    async listSchedules(@Req() request: Request, @Res() response: Response) {
        const qs = this.getQueryString(request);
        const result = await this.proxyService.forwardRequest(
            'pricing',
            'GET',
            this.buildAggregatorPath(undefined, qs),
            undefined,
            request.headers as Record<string, string>,
        );
        return response.status(result.statusCode).json(result.data);
    }

    /**
     * GET /api/v1/admin/pricing/fee-schedules/:id
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener fee schedule por ID (admin)' })
    async getSchedule(
        @Param('id') id: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const result = await this.proxyService.forwardRequest(
            'pricing',
            'GET',
            this.buildAggregatorPath(id),
            undefined,
            request.headers as Record<string, string>,
        );
        return response.status(result.statusCode).json(result.data);
    }

    /**
     * POST /api/v1/admin/pricing/fee-schedules
     */
    @Post()
    @ApiOperation({ summary: 'Crear fee schedule (admin)' })
    @HttpCode(HttpStatus.CREATED)
    async createSchedule(@Req() request: Request, @Res() response: Response) {
        const result = await this.proxyService.forwardRequest(
            'pricing',
            'POST',
            this.buildAggregatorPath(),
            request.body,
            request.headers as Record<string, string>,
        );
        return response.status(result.statusCode).json(result.data);
    }

    /**
     * PATCH /api/v1/admin/pricing/fee-schedules/:id
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar fee schedule (admin)' })
    async updateSchedule(
        @Param('id') id: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const result = await this.proxyService.forwardRequest(
            'pricing',
            'PATCH',
            this.buildAggregatorPath(id),
            request.body,
            request.headers as Record<string, string>,
        );
        return response.status(result.statusCode).json(result.data);
    }

    /**
     * DELETE /api/v1/admin/pricing/fee-schedules/:id
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar fee schedule (admin)' })
    async removeSchedule(
        @Param('id') id: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const result = await this.proxyService.forwardRequest(
            'pricing',
            'DELETE',
            this.buildAggregatorPath(id),
            undefined,
            request.headers as Record<string, string>,
        );
        return response.status(result.statusCode).json(result.data);
    }

    /**
     * POST /api/v1/admin/pricing/fee-schedules/:id/enable
     */
    @Post(':id/enable')
    @ApiOperation({ summary: 'Activar fee schedule (admin)' })
    async enableSchedule(
        @Param('id') id: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const result = await this.proxyService.forwardRequest(
            'pricing',
            'POST',
            this.buildAggregatorPath(`${id}/enable`),
            undefined,
            request.headers as Record<string, string>,
        );
        return response.status(result.statusCode).json(result.data);
    }

    /**
     * POST /api/v1/admin/pricing/fee-schedules/:id/disable
     */
    @Post(':id/disable')
    @ApiOperation({ summary: 'Desactivar fee schedule (admin)' })
    async disableSchedule(
        @Param('id') id: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const result = await this.proxyService.forwardRequest(
            'pricing',
            'POST',
            this.buildAggregatorPath(`${id}/disable`),
            undefined,
            request.headers as Record<string, string>,
        );
        return response.status(result.statusCode).json(result.data);
    }
}

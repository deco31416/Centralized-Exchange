import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { FeesService } from './fees.service';
import { CreateFeeScheduleDto } from './dto/create-fee-schedule.dto';
import { UpdateFeeScheduleDto } from './dto/update-fee-schedule.dto';
import { InternalAuthGuard } from '../shared/internal-auth.guard';

/**
 * Admin CRUD for fee-schedules.
 * All routes require X-Internal-Auth header (service-to-service only).
 * Publicly accessible fee info is served by PricesController / QuotesController.
 */
@Controller('internal/fees/schedules')
@UseGuards(InternalAuthGuard)
export class FeesAdminController {
    constructor(private readonly feesService: FeesService) {}

    /**
     * GET /api/v1/internal/fees/schedules
     * Returns all fee schedules sorted by priority asc.
     */
    @Get()
    async findAll(@Query('enabled') enabled?: string) {
        const enabledBool = enabled === undefined ? undefined : enabled === 'true';
        return this.feesService.findAll(enabledBool);
    }

    /**
     * GET /api/v1/internal/fees/schedules/:id
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.feesService.findById(id);
    }

    /**
     * POST /api/v1/internal/fees/schedules
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateFeeScheduleDto) {
        return this.feesService.create(dto);
    }

    /**
     * PATCH /api/v1/internal/fees/schedules/:id
     */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateFeeScheduleDto) {
        return this.feesService.update(id, dto);
    }

    /**
     * DELETE /api/v1/internal/fees/schedules/:id
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string) {
        return this.feesService.remove(id);
    }

    /**
     * POST /api/v1/internal/fees/schedules/:id/enable
     */
    @Post(':id/enable')
    async enable(@Param('id') id: string) {
        return this.feesService.setEnabled(id, true);
    }

    /**
     * POST /api/v1/internal/fees/schedules/:id/disable
     */
    @Post(':id/disable')
    async disable(@Param('id') id: string) {
        return this.feesService.setEnabled(id, false);
    }
}

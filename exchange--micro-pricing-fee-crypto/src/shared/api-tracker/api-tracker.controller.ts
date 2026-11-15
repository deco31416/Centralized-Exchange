import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiHeader, ApiBody } from '@nestjs/swagger';
import { ApiTrackerService } from './api-tracker.service';
import { InternalAuthGuard } from '../guards/internal-auth.guard';

@ApiTags('API Usage')
@ApiHeader({ name: 'x-internal-auth', description: 'Internal authentication token', required: true })
@Controller('internal/api-usage')
@UseGuards(InternalAuthGuard)
export class ApiTrackerController {
    constructor(private readonly apiTrackerService: ApiTrackerService) { }

    @ApiOperation({
        summary: 'API usage dashboard',
        description: 'Get current API call usage for today, remaining budget, and smart cron interval recommendation.',
    })
    @Get()
    async getUsageSummary() {
        return this.apiTrackerService.getUsageSummary();
    }

    @ApiOperation({
        summary: 'Remaining API budget',
        description: 'Get remaining API calls per source for today (UTC).',
    })
    @Get('budget')
    async getBudget() {
        return this.apiTrackerService.getRemainingBudget();
    }

    @ApiOperation({
        summary: 'Smart cron interval',
        description: 'Get optimal refresh interval based on remaining API budget and time left in UTC day.',
    })
    @Get('smart-cron')
    async getSmartCron() {
        return this.apiTrackerService.getOptimalIntervalMs();
    }

    @ApiOperation({
        summary: 'Configure smart cron interval',
        description: 'Override the auto-calculated interval. Send intervalMs to set a fixed interval, or send null/0 to return to auto mode. Example: 3600000 = 1 hour.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                intervalMs: { type: 'number', nullable: true, example: 3600000, description: 'Fixed interval in ms. Send null or 0 to return to auto mode.' },
            },
        },
    })
    @Patch('smart-cron')
    async setSmartCron(@Body() body: { intervalMs?: number | null }) {
        const ms = body.intervalMs && body.intervalMs > 0 ? body.intervalMs : null;
        return this.apiTrackerService.setIntervalOverride(ms);
    }

    @ApiOperation({
        summary: 'Interval configuration',
        description: 'Get current interval bounds (min/max), mode (auto/manual) and override value.',
    })
    @Get('smart-cron/config')
    async getSmartCronConfig() {
        return this.apiTrackerService.getIntervalConfig();
    }

    @ApiOperation({
        summary: 'Usage history',
        description: 'Get historical API call usage for the last N days.',
    })
    @ApiQuery({ name: 'days', required: false, type: Number, example: 7 })
    @Get('history')
    async getHistory(@Query('days') days?: string) {
        return this.apiTrackerService.getHistory(days ? parseInt(days) : 7);
    }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard';
import { AdminAnalyticsService } from './admin-analytics.service';

@Controller('admin-analytics')
@UseGuards(InternalAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('overview')
  getOverview(@Query('range') range?: string) {
    return this.adminAnalyticsService.getOverview(range);
  }

  @Get('series')
  getSeries(@Query('range') range?: string) {
    return this.adminAnalyticsService.getSeries(range);
  }

  @Get('kpis')
  getKpis() {
    return this.adminAnalyticsService.getKpis();
  }
}

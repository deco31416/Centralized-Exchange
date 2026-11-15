import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

/**
 * Dashboard Module
 *
 * Serves the dev-only pricing dashboard at /dashboard.
 * In production (NODE_ENV=production), the endpoint returns 404.
 */
@Module({
    controllers: [DashboardController],
    providers: [InternalAuthGuard],
})
export class DashboardModule {}

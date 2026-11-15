import { Controller, Get, Res, Logger, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

/**
 * Dev Dashboard Controller
 *
 * Serves the pricing dashboard HTML at /dashboard
 * ONLY available when NODE_ENV !== 'production'
 */
@ApiExcludeController()
@Controller()
@UseGuards(InternalAuthGuard)
export class DashboardController {
    private readonly logger = new Logger('Dashboard');
    private readonly isProduction = process.env.NODE_ENV === 'production';

    @Get('dashboard')
    serveDashboard(@Res() res: Response) {
        if (this.isProduction) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Dashboard not available in production',
            });
        }

        // Resolve path — works in both dev (src/) and compiled (dist/)
        const paths = [
            join(__dirname, '..', '..', 'public', 'dashboard.html'),  // from dist/
            join(__dirname, '..', 'public', 'dashboard.html'),        // fallback
            join(process.cwd(), 'public', 'dashboard.html'),          // from project root
        ];

        for (const p of paths) {
            if (existsSync(p)) {
                this.logger.log(`Serving dashboard from ${p}`);
                return res.sendFile(p);
            }
        }

        return res.status(404).json({
            statusCode: 404,
            message: 'Dashboard HTML not found',
        });
    }
}

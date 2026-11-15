import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { InternalAuthGuard } from '../shared/internal-auth.guard';

@Controller()
@UseGuards(InternalAuthGuard)
export class DashboardController {
    @Get('dashboard')
    serveDashboard(@Res() res: Response) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(404).json({
                statusCode: 404,
                message: 'Dashboard is only available in development mode',
            });
        }

        const candidates = [
            join(__dirname, '..', '..', 'public', 'dashboard.html'),
            join(__dirname, '..', 'public', 'dashboard.html'),
            join(process.cwd(), 'public', 'dashboard.html'),
        ];

        for (const p of candidates) {
            if (existsSync(p)) {
                return res.sendFile(p);
            }
        }

        return res.status(404).json({
            statusCode: 404,
            message: 'dashboard.html not found',
            tried: candidates,
        });
    }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    @ApiOperation({ summary: 'Health check', description: 'Returns service health status. No authentication required.' })
    @Get()
    check() {
        return {
            status: 'ok',
            service: 'pricing-fiat',
            timestamp: new Date().toISOString(),
        };
    }
}

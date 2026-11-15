import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    check() {
        return {
            status: 'ok',
            service: 'pricing-fee-aggregator',
            timestamp: new Date().toISOString(),
        };
    }
}

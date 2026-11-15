import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      ok: true,
      service: 'exchange--micro-market-data',
      timestamp: new Date().toISOString(),
    };
  }
}

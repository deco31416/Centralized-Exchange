import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      ok: true,
      service: 'Exchange--micro-DECOPAY-core',
      timestamp: new Date().toISOString(),
    };
  }
}
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      ok: true,
      service: 'exchange--micro-points-deco-core',
      timestamp: new Date().toISOString(),
    };
  }
}

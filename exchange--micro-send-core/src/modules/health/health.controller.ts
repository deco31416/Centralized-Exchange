import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'exchange--micro-send-core',
      timestamp: new Date().toISOString(),
    };
  }
}
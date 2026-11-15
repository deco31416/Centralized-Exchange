import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'micro-p2p-tunnel',
      timestamp: new Date().toISOString(),
    };
  }
}

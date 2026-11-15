import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'micro-signature-keys', timestamp: new Date().toISOString() };
  }
}

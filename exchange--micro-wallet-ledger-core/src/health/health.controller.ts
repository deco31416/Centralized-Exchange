import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'micro-wallet-ledger-core',
      timestamp: new Date().toISOString(),
    };
  }
}

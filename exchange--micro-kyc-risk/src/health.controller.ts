import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: this.config.get('SERVICE_NAME') ?? 'exchange--micro-kyc-risk',
      timestamp: new Date().toISOString(),
    };
  }
}

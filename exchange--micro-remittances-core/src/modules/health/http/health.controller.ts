import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getHealth() {
    return {
      success: true,
      message: 'Remittances core service is up',
      service: this.configService.get<string>('appName'),
      version: this.configService.get<string>('appVersion'),
      timestamp: new Date().toISOString(),
    };
  }
}
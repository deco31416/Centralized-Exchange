import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../services/health.service';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    redis: 'ok' | 'error';
    queues: 'ok' | 'error';
    providers: 'ok' | 'error';
  };
  version: string;
}

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Health check endpoint
   */
  @Get('health')
  async getHealth(): Promise<HealthResponse> {
    return this.healthService.getHealthStatus();
  }

  /**
   * Simple ping endpoint
   */
  @Get('ping')
  async ping(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
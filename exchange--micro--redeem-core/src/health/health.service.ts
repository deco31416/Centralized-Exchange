import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok',
      service: 'exchange--micro-redeem-core',
      timestamp: new Date().toISOString(),
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  health() {
    return {
      status: 'ok',
      service: 'micro-payments-core',
      timestamp: new Date().toISOString(),
    };
  }
}

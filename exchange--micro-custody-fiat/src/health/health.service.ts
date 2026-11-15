import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  health() {
    return {
      status: 'ok',
      service: 'micro-custody-fiat',
      timestamp: new Date().toISOString(),
    };
  }
}

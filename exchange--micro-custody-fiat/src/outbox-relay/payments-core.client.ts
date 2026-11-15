import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { CircuitBreaker, CircuitOpenError } from '../resilience/circuit-breaker';

export type OutboxEventPayload = {
  eventName: string;
  version: string;
  correlationId: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class PaymentsCoreClient {
  private readonly logger = new Logger(PaymentsCoreClient.name);
  private readonly breaker: CircuitBreaker | null;

  constructor(private readonly configService: ConfigService) {
    const enabled = (this.configService.get<string>('CB_PAYMENTS_CORE_ENABLED') ?? 'true') === 'true';
    if (!enabled) {
      this.breaker = null;
      return;
    }

    const failureThreshold = Number(this.configService.get<string>('CB_PAYMENTS_CORE_FAILURE_THRESHOLD') ?? 5);
    const resetTimeoutMs = Number(this.configService.get<string>('CB_PAYMENTS_CORE_RESET_TIMEOUT_MS') ?? 30_000);
    this.breaker = new CircuitBreaker({
      failureThreshold: Number.isFinite(failureThreshold) ? failureThreshold : 5,
      resetTimeoutMs: Number.isFinite(resetTimeoutMs) ? resetTimeoutMs : 30_000,
    });
  }

  async publish(event: OutboxEventPayload): Promise<void> {
    if (event.eventName !== 'FIAT_TRANSFER_DETECTED') {
      throw new Error(
        `Unsupported outbox eventName="${event.eventName}"; retain it for operator review instead of marking it published.`,
      );
    }

    const paymentsUrl =
      this.configService.get<string>('PAYMENTS_CORE_URL') ?? 'http://localhost:9000/api/v1';
    const internalAuthToken = this.configService.get<string>('INTERNAL_AUTH_TOKEN');
    if (!internalAuthToken) {
      throw new Error('INTERNAL_AUTH_TOKEN is required');
    }
    const timeoutMs = Number(this.configService.get<string>('PAYMENTS_CORE_TIMEOUT_MS') ?? 10_000);

    const request = async () => {
      await axios.post(`${paymentsUrl}/internal/events/fiat-transfer-detected`, event, {
        headers: {
          'x-internal-auth': internalAuthToken,
          'content-type': 'application/json',
          'x-idempotency-key': event.idempotencyKey,
          'x-correlation-id': event.correlationId,
        },
        timeout: Number.isFinite(timeoutMs) ? timeoutMs : 10_000,
      });
    };

    try {
      if (this.breaker) {
        await this.breaker.exec(request);
      } else {
        await request();
      }
    } catch (err: any) {
      if (err instanceof CircuitOpenError) {
        this.logger.warn(`payments-core circuit OPEN; skipping publish for ${event.idempotencyKey}`);
      }
      throw err;
    }
  }
}

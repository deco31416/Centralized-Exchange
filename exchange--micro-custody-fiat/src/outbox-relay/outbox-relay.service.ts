import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OutboxService } from '../outbox/outbox.service';
import { PaymentsCoreClient } from './payments-core.client';

function jitter(ms: number, ratio = 0.2): number {
  const delta = ms * ratio;
  const min = ms - delta;
  const max = ms + delta;
  return Math.floor(min + Math.random() * (max - min));
}

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private running = false;
  private readonly workerId: string;

  private publishTimer: NodeJS.Timeout | null = null;
  private reconcileTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly outboxService: OutboxService,
    private readonly paymentsCoreClient: PaymentsCoreClient,
    private readonly configService: ConfigService,
  ) {
    this.workerId = `outbox-relay-${process.pid}`;
  }

  onModuleInit(): void {
    const publishPollMs = Number(this.configService.get<string>('OUTBOX_RELAY_POLL_MS') ?? 5_000);
    const reconcilePollMs = Number(this.configService.get<string>('OUTBOX_RECONCILE_POLL_MS') ?? 60_000);

    const publishEvery = Number.isFinite(publishPollMs) ? Math.max(1_000, publishPollMs) : 5_000;
    const reconcileEvery = Number.isFinite(reconcilePollMs) ? Math.max(5_000, reconcilePollMs) : 60_000;

    this.publishTimer = setInterval(() => {
      void this.tickPublish().catch((err) =>
        this.logger.error(`Outbox relay tickPublish failed: ${err?.message ?? String(err)}`),
      );
    }, publishEvery);

    this.reconcileTimer = setInterval(() => {
      void this.tickReconcile().catch((err) =>
        this.logger.error(`Outbox relay tickReconcile failed: ${err?.message ?? String(err)}`),
      );
    }, reconcileEvery);

    this.logger.log(`Outbox relay timers started (publish=${publishEvery}ms, reconcile=${reconcileEvery}ms)`);
  }

  onModuleDestroy(): void {
    if (this.publishTimer) clearInterval(this.publishTimer);
    if (this.reconcileTimer) clearInterval(this.reconcileTimer);
    this.publishTimer = null;
    this.reconcileTimer = null;
  }

  async tickPublish(): Promise<void> {
    const enabled = (this.configService.get<string>('OUTBOX_RELAY_ENABLED') ?? 'true') === 'true';
    if (!enabled) return;

    if (this.running) return;
    this.running = true;

    try {
      const batchSize = Number(this.configService.get<string>('OUTBOX_RELAY_BATCH_SIZE') ?? 25);
      const lockMs = Number(this.configService.get<string>('OUTBOX_RELAY_LOCK_MS') ?? 30_000);
      const maxAttempts = Number(this.configService.get<string>('OUTBOX_RELAY_MAX_ATTEMPTS') ?? 20);
      const baseBackoffMs = Number(this.configService.get<string>('OUTBOX_RELAY_BACKOFF_BASE_MS') ?? 2_000);
      const maxBackoffMs = Number(this.configService.get<string>('OUTBOX_RELAY_BACKOFF_MAX_MS') ?? 10 * 60_000);

      const effectiveBatchSize = Number.isFinite(batchSize) ? Math.max(1, batchSize) : 25;
      const effectiveLockMs = Number.isFinite(lockMs) ? Math.max(5_000, lockMs) : 30_000;

      let processed = 0;

      while (processed < effectiveBatchSize) {
        const event = await this.outboxService.claimNext({ workerId: this.workerId, lockMs: effectiveLockMs });
        if (!event) break;

        processed += 1;

        try {
          await this.paymentsCoreClient.publish({
            eventName: event.eventName,
            version: event.version,
            correlationId: event.correlationId,
            idempotencyKey: event.idempotencyKey,
            payload: event.payload,
          });

          await this.outboxService.markPublished({ id: String(event._id), workerId: this.workerId });
        } catch (error: any) {
          const attempts = (event.attempts ?? 0) + 1;
          const terminal = Number.isFinite(maxAttempts) ? attempts >= maxAttempts : attempts >= 20;

          const backoffMs = Math.min(
            Number.isFinite(maxBackoffMs) ? maxBackoffMs : 10 * 60_000,
            (Number.isFinite(baseBackoffMs) ? baseBackoffMs : 2_000) * Math.pow(2, Math.max(0, attempts - 1)),
          );

          const nextAttemptAt = new Date(Date.now() + jitter(backoffMs));
          const lastError = error?.response?.data
            ? JSON.stringify(error.response.data)
            : error?.message ?? String(error);

          await this.outboxService.markRetry({
            id: String(event._id),
            workerId: this.workerId,
            attempts,
            nextAttemptAt: terminal ? new Date(Date.now() + (Number.isFinite(maxBackoffMs) ? maxBackoffMs : 10 * 60_000)) : nextAttemptAt,
            lastError,
            status: terminal ? 'dead_letter' : 'pending',
          });

          if (terminal) {
            this.logger.error(
              `Outbox event terminal failure after ${attempts} attempts: ${event.eventName} ${event.idempotencyKey}`,
            );
          } else {
            this.logger.warn(
              `Outbox publish failed (attempt ${attempts}) for ${event.eventName} ${event.idempotencyKey}; retry at ${nextAttemptAt.toISOString()}`,
            );
          }
        }
      }

      if (processed > 0) {
        this.logger.log(`Outbox relay processed ${processed} event(s)`);
      }
    } finally {
      this.running = false;
    }
  }

  async tickReconcile(): Promise<void> {
    const enabled = (this.configService.get<string>('OUTBOX_RECONCILE_ENABLED') ?? 'true') === 'true';
    if (!enabled) return;

    const olderThanMs = Number(this.configService.get<string>('OUTBOX_RECONCILE_STUCK_MS') ?? 15 * 60_000);
    const limit = Number(this.configService.get<string>('OUTBOX_RECONCILE_LIMIT') ?? 10);

    const stuck = await this.outboxService.listStuck({
      olderThanMs: Number.isFinite(olderThanMs) ? olderThanMs : 15 * 60_000,
      limit: Number.isFinite(limit) ? limit : 10,
    });

    if (stuck.length === 0) return;

    this.logger.warn(
      `Outbox reconcile: ${stuck.length} evento(s) pending/failed/dead_letter hace más de ${olderThanMs}ms (ej: ${stuck[0].idempotencyKey})`,
    );
  }
}

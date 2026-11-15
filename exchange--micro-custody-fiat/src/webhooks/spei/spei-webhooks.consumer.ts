import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { FiatWebhooksIngestService } from './spei-webhooks.ingest.service';

@Processor(QUEUE_NAMES.FIAT_WEBHOOKS_INGEST)
export class FiatWebhooksIngestConsumer {
  constructor(private readonly ingestService: FiatWebhooksIngestService) {}

  @Process()
  async handle(job: Job<{ inboxId: string; provider: string; correlationId: string }>) {
    await this.ingestService.ingest({
      inboxId: job.data.inboxId,
      provider: job.data.provider,
      correlationId: job.data.correlationId,
    });

    return {
      ok: true,
    };
  }
}

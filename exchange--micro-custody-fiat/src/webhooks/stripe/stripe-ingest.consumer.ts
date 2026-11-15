import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { StripeIngestService } from './stripe-ingest.service';

@Processor(QUEUE_NAMES.FIAT_WEBHOOKS_INGEST)
export class StripeIngestConsumer {
  private readonly logger = new Logger(StripeIngestConsumer.name);

  constructor(private readonly ingestService: StripeIngestService) {}

  @Process()
  async handleIngest(job: Job<{ inboxId: string; provider: string; correlationId: string }>) {
    if (job.data.provider !== 'stripe') {
      return;
    }

    this.logger.log(`Processing Stripe webhook inboxId=${job.data.inboxId}`);

    await this.ingestService.ingest({
      inboxId: job.data.inboxId,
      provider: job.data.provider,
      correlationId: job.data.correlationId,
    });
  }
}

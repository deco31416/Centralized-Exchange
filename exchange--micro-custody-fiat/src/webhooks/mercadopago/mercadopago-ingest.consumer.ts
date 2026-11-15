import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { MercadoPagoIngestService } from './mercadopago-ingest.service';

@Processor(QUEUE_NAMES.FIAT_WEBHOOKS_INGEST)
export class MercadoPagoIngestConsumer {
  private readonly logger = new Logger(MercadoPagoIngestConsumer.name);

  constructor(private readonly ingestService: MercadoPagoIngestService) {}

  @Process()
  async handleIngest(job: Job<{ inboxId: string; provider: string; correlationId: string }>) {
    if (job.data.provider !== 'mercadopago') {
      return;
    }

    this.logger.log(`Processing Mercado Pago webhook inboxId=${job.data.inboxId}`);

    await this.ingestService.ingest({
      inboxId: job.data.inboxId,
      provider: job.data.provider,
      correlationId: job.data.correlationId,
    });
  }
}

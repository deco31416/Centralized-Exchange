import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { SpeiWebhookService } from './spei-webhook.service';

@Controller('webhooks/spei')
export class SpeiWebhookController {
  constructor(private readonly speiWebhookService: SpeiWebhookService) {}

  @Post(':provider')
  async ingest(
    @Param('provider') provider: string,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.speiWebhookService.ingestWebhook({
      provider,
      headers,
      body,
    });
  }
}

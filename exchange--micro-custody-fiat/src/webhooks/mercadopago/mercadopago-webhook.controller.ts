import { Body, Controller, Headers, Post } from '@nestjs/common';
import { MercadoPagoWebhookService } from './mercadopago-webhook.service';

@Controller('webhooks/mercadopago')
export class MercadoPagoWebhookController {
  constructor(private readonly mercadoPagoWebhookService: MercadoPagoWebhookService) {}

  @Post()
  async ingest(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.mercadoPagoWebhookService.ingestWebhook({
      headers,
      body,
    });
  }
}

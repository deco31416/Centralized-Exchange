import { Body, Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { StripeWebhookService } from './stripe-webhook.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Post()
  async ingest(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    // Stripe requiere raw body para verificación de firma
    const rawBody = req.rawBody?.toString('utf8') ?? JSON.stringify(body);

    return this.stripeWebhookService.ingestWebhook({
      headers,
      body,
      rawBody,
    });
  }
}

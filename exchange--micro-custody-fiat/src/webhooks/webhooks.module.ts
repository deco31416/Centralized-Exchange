import { Module } from '@nestjs/common';
import { SpeiWebhooksModule } from './spei/spei-webhooks.module';
import { MercadoPagoWebhooksModule } from './mercadopago/mercadopago-webhooks.module';
import { StripeWebhooksModule } from './stripe/stripe-webhooks.module';
import { TestEventsController } from './test-events.controller';

@Module({
  imports: [SpeiWebhooksModule, MercadoPagoWebhooksModule, StripeWebhooksModule],
  controllers: [TestEventsController],
})
export class WebhooksModule {}

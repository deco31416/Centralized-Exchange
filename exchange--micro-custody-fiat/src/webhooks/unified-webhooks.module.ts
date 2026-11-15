import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Adapters
import { SpeiAdapter } from './adapters/spei.adapter';
import { MercadoPagoAdapter } from './adapters/mercadopago.adapter';
import { StripeAdapter } from './adapters/stripe.adapter';

// Factory
import { FiatProviderFactory } from './factories/fiat-provider.factory';

// Services
import { UnifiedWebhookService } from './services/unified-webhook.service';

// Controllers
import { UnifiedWebhookController } from './controllers/unified-webhook.controller';

// Shared
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { OutboxModule } from '../outbox/outbox.module';

/**
 * Módulo unificado de webhooks con arquitectura pluggable
 * 
 * Este módulo reemplaza los módulos individuales de cada provider
 * (SpeiWebhooksModule, MercadoPagoWebhooksModule, StripeWebhooksModule)
 * con una arquitectura basada en ports/adapters.
 * 
 * Ventajas:
 * - DRY: Elimina duplicación de código
 * - Extensible: Agregar nuevo provider = crear adapter + registrar en factory
 * - Testeable: Cada adapter es una clase independiente
 * - Mantenible: Cambios en lógica común se aplican a todos los providers
 */
@Module({
  imports: [
    ConfigModule,
    IdempotencyModule,
    OutboxModule,
  ],
  controllers: [UnifiedWebhookController],
  providers: [
    // Adapters
    SpeiAdapter,
    MercadoPagoAdapter,
    StripeAdapter,
    
    // Factory
    FiatProviderFactory,
    
    // Services
    UnifiedWebhookService,
  ],
  exports: [FiatProviderFactory, UnifiedWebhookService],
})
export class UnifiedWebhooksModule {}

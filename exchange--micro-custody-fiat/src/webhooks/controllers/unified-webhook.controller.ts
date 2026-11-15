import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { FiatProviderFactory } from '../factories/fiat-provider.factory';
import { UnifiedWebhookService } from '../services/unified-webhook.service';

/**
 * Controlador unificado para webhooks de todos los providers
 * 
 * Reemplaza los controladores individuales (SpeiWebhookController, etc.)
 * con un enfoque pluggable basado en factory pattern.
 * 
 * Endpoints:
 * - POST /webhooks/:provider (ej: /webhooks/stp, /webhooks/mercadopago, /webhooks/stripe)
 */
@Controller('webhooks')
export class UnifiedWebhookController {
  constructor(
    private readonly factory: FiatProviderFactory,
    private readonly webhookService: UnifiedWebhookService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Endpoint genérico que maneja cualquier provider
   * 
   * @param provider - Nombre del provider (stp, mercadopago, stripe, etc.)
   * @param body - Payload del webhook
   * @param req - Request object (para raw body en Stripe)
   * @param headers - Headers del request
   */
  @Post(':provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() body: any,
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
  ) {
    // Obtener adapter del provider
    const adapter = this.factory.getProvider(provider);

    // Obtener secret del provider desde config
    const secret = this.getProviderSecret(provider);

    // Obtener signature del header correspondiente
    const signature = headers[adapter.signatureHeader.toLowerCase()];
    if (!signature) {
      throw new UnauthorizedException(`Missing ${adapter.signatureHeader} header`);
    }

    // Preparar payload para verificación
    // Si el adapter requiere raw body (Stripe), usar req.rawBody
    if (adapter.requiresRawBody && !req.rawBody) {
      throw new BadRequestException('Raw request body is required for this provider');
    }
    const payloadForVerification = adapter.requiresRawBody
      ? req.rawBody!.toString('utf-8')
      : body;

    // Delegar procesamiento al servicio unificado
    const result = await this.webhookService.processWebhook(
      adapter,
      payloadForVerification,
      signature,
      secret,
      body, // Body parsed para normalización
    );

    if (!result.success) {
      if (result.error === 'Invalid signature') {
        throw new UnauthorizedException('Invalid webhook signature');
      }
      if (result.shouldRetry) {
        throw new ServiceUnavailableException('Webhook processing failed; provider should retry');
      }
      throw new BadRequestException('Webhook payload was rejected');
    }

    return result;
  }

  /**
   * Obtiene el secret del provider desde configuración
   */
  private getProviderSecret(provider: string): string {
    const normalized = provider.toLowerCase();
    
    // Mapeo de providers a variables de entorno
    const secretMap: Record<string, string> = {
      stp: this.configService.get<string>('SPEI_STP_SECRET') || '',
      banorte: this.configService.get<string>('SPEI_BANORTE_SECRET') || '',
      spei: this.configService.get<string>('SPEI_STP_SECRET') || '', // Default a STP
      mercadopago: this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET') || '',
      mp: this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET') || '',
      stripe: this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '',
    };

    return secretMap[normalized] || '';
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { FiatProviderPort } from '../ports/fiat-provider.port';
import { SpeiAdapter } from '../adapters/spei.adapter';
import { MercadoPagoAdapter } from '../adapters/mercadopago.adapter';
import { StripeAdapter } from '../adapters/stripe.adapter';

/**
 * Factory para obtener el adapter correcto según el provider
 * 
 * Patrón Factory: Centraliza la lógica de creación de providers
 * y facilita agregar nuevos sin modificar código existente.
 */
@Injectable()
export class FiatProviderFactory {
  private readonly providers: Map<string, FiatProviderPort>;

  constructor(
    private readonly speiAdapter: SpeiAdapter,
    private readonly mercadoPagoAdapter: MercadoPagoAdapter,
    private readonly stripeAdapter: StripeAdapter,
  ) {
    // Registrar todos los providers disponibles
    this.providers = new Map<string, FiatProviderPort>([
      ['stp', this.speiAdapter],
      ['banorte', this.speiAdapter], // Ambos usan mismo adapter
      ['spei', this.speiAdapter],
      ['mercadopago', this.mercadoPagoAdapter],
      ['mp', this.mercadoPagoAdapter], // Alias
      ['stripe', this.stripeAdapter],
    ]);
  }

  /**
   * Obtiene el adapter para un provider específico
   * 
   * @param providerName - Nombre del provider ('stp', 'mercadopago', 'stripe')
   * @returns Adapter que implementa FiatProviderPort
   * @throws BadRequestException si el provider no está soportado
   */
  getProvider(providerName: string): FiatProviderPort {
    const normalized = providerName.toLowerCase().trim();
    const provider = this.providers.get(normalized);

    if (!provider) {
      throw new BadRequestException(
        `Provider '${providerName}' not supported. Available: ${Array.from(this.providers.keys()).join(', ')}`,
      );
    }

    return provider;
  }

  /**
   * Lista todos los providers disponibles
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Verifica si un provider está soportado
   */
  isSupported(providerName: string): boolean {
    return this.providers.has(providerName.toLowerCase().trim());
  }
}

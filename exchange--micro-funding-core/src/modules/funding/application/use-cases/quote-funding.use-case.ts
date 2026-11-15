import { Inject, Injectable, BadGatewayException } from '@nestjs/common';
import { PAYMENT_GATEWAY_PORT } from '../tokens';
import type {
  PaymentGatewayPort,
  QuoteFundingPayload,
} from '../ports/payment-gateway.port';

@Injectable()
export class QuoteFundingUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_PORT)
    private readonly paymentGatewayPort: PaymentGatewayPort,
  ) {}

  async execute(payload: QuoteFundingPayload) {
    try {
      const result = await this.paymentGatewayPort.quoteFunding(payload);

      return result;
    } catch (error) {
      throw new BadGatewayException(
        'No fue posible obtener la cotización desde el servicio de payments',
      );
    }
  }
}
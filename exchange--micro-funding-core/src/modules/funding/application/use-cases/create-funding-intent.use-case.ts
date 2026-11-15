import { Inject, Injectable, BadGatewayException } from '@nestjs/common';
import { PAYMENT_GATEWAY_PORT } from '../tokens';
import type {
  CreateFundingIntentPayload,
  PaymentGatewayPort,
} from '../ports/payment-gateway.port';

@Injectable()
export class CreateFundingIntentUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_PORT)
    private readonly paymentGatewayPort: PaymentGatewayPort,
  ) {}

  async execute(payload: CreateFundingIntentPayload) {
    try {
      const result = await this.paymentGatewayPort.createFundingIntent(payload);

      return result;
    } catch (error) {
      throw new BadGatewayException(
        'No fue posible crear la intención de fondeo en el servicio de payments',
      );
    }
  }
}
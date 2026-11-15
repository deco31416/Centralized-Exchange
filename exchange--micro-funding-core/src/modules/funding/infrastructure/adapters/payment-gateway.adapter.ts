import { Injectable, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type {
  ConfirmFundingPayload,
  CreateFundingIntentPayload,
  PaymentGatewayConfirmationResult,
  PaymentGatewayPort,
  QuoteFundingPayload,
} from '../../application/ports/payment-gateway.port';
import type { FundingIntentEntity } from '../../domain/entities/funding-intent.entity';
import type { FundingQuoteEntity } from '../../domain/entities/funding-quote.entity';

@Injectable()
export class PaymentGatewayAdapter implements PaymentGatewayPort {
  private readonly baseUrl = process.env.PAYMENTS_SERVICE_URL;

  constructor(private readonly http: HttpService) {}

  async createFundingIntent(
    payload: CreateFundingIntentPayload,
  ): Promise<FundingIntentEntity> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/payments/intent`, payload, {
          headers: this.headers(),
        }),
      );

      return response.data;
    } catch (error) {
      throw new BadGatewayException(
        'No fue posible crear la intención de fondeo en payments',
      );
    }
  }

  async quoteFunding(
    payload: QuoteFundingPayload,
  ): Promise<FundingQuoteEntity> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/payments/quote`, payload, {
          headers: this.headers(),
        }),
      );

      return response.data;
    } catch (error) {
      throw new BadGatewayException(
        'No fue posible obtener la cotización en payments',
      );
    }
  }

  async confirmFunding(
    payload: ConfirmFundingPayload,
  ): Promise<PaymentGatewayConfirmationResult> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/payments/confirm`, payload, {
          headers: this.headers(),
        }),
      );

      return response.data;
    } catch (error) {
      throw new BadGatewayException(
        'No fue posible confirmar el fondeo en payments',
      );
    }
  }

  private headers() {
    return {
      Authorization: `Bearer ${process.env.INTERNAL_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }
}
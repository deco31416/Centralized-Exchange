import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import {
  PricingAggregatorClientPort,
  RemittanceQuoteResult,
} from '../../domain/ports/pricing-aggregator-client.port';

@Injectable()
export class PricingAggregatorClient implements PricingAggregatorClientPort {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getQuote(
    amount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<RemittanceQuoteResult> {
    const baseUrl = this.configService.get<string>('services.pricingAggregator');
    const token = this.configService.get<string>('internalAuthToken');
    const timeout = this.configService.get<number>('requestTimeoutMs');

    if (!baseUrl) {
      throw new BadGatewayException(
        'PRICING_AGGREGATOR_URL no está configurado',
      );
    }

    // Usar GET /prices/convert/{from}/{to}?amount={n} — endpoint estable del aggregator
    // que NO depende de pricing-crypto estando levantado (a diferencia de POST /quotes).
    const url = `${baseUrl}/prices/convert/${encodeURIComponent(sourceCurrency)}/${encodeURIComponent(targetCurrency)}`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(
          url,
          {
            params: { amount },
            timeout,
            headers: {
              'x-internal-auth': token,
            },
          },
        ),
      );

      const data = response?.data?.data ?? response?.data;
      const converted = Number(data.converted ?? 0);
      const rate = Number(data.rate ?? 0);

      return {
        sourceAmount: amount,
        sourceCurrency,
        targetAmount: converted,
        targetCurrency,
        fxRate: rate,
        fee: 0,
        quoteId: undefined,
      };
    } catch (error: any) {
      throw new BadGatewayException(
        error?.response?.data?.message ||
          'Error consultando pricing-aggregator',
      );
    }
  }
}
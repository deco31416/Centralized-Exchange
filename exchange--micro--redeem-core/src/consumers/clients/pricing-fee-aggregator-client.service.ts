import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type AggregatorQuoteResponse = {
  quoteId: string;
  userId?: string;
  operation: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  exchangeRate: number;
  toAmountBeforeFees: number;
  fees?: {
    networkFee?: { value: number; type: string };
    platformFee?: { value: number; type: string };
    total?: number;
  };
  toAmountAfterFees: number;
  pricingSource?: string;
  feeScheduleId?: string;
  expiresAt: string;
  used?: boolean;
};

@Injectable()
export class PricingFeeAggregatorClientService {
  private readonly logger = new Logger(
    PricingFeeAggregatorClientService.name,
  );

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getQuote(payload: {
    userId: string;
    sourceAsset: string;
    targetAsset: string;
    sourceAmount: number;
  }) {
    const baseUrl =
      this.configService
        .get<string>('services.pricingFeeAggregator')
        ?.replace(/\/$/, '') || '';
    const token =
      this.configService.get<string>('internalAuthToken') || '';

    if (!baseUrl || !token) {
      throw new ServiceUnavailableException(
        'Pricing Fee Aggregator service is not configured correctly',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<AggregatorQuoteResponse>(
          `${baseUrl}/quotes`,
          {
            operation: 'SWAP',
            fromAsset: payload.sourceAsset,
            toAsset: payload.targetAsset,
            fromAmount: payload.sourceAmount,
            userId: payload.userId,
          },
          {
            headers: {
              'x-internal-auth': token,
            },
            timeout: 15000,
          },
        ),
      );

      const data = response.data;

      return {
        source: 'pricing-fee-aggregator',
        connected: true,
        quoteId: data.quoteId,
        rate: data.exchangeRate,
        fee: data.fees?.total ?? 0,
        sourceAmount: data.fromAmount,
        targetAmount: data.toAmountAfterFees,
        expiresAt: data.expiresAt,
        raw: data,
      };
    } catch (error: any) {
      this.logger.error(
        `Quote generation failed for ${payload.sourceAsset}/${payload.targetAsset}: ${error?.message || error}`,
      );

      throw new ServiceUnavailableException(
        'Unable to generate quote from pricing fee aggregator',
      );
    }
  }

  async getQuoteById(quoteId: string) {
    const baseUrl =
      this.configService
        .get<string>('services.pricingFeeAggregator')
        ?.replace(/\/$/, '') || '';
    const token =
      this.configService.get<string>('internalAuthToken') || '';

    if (!baseUrl || !token) {
      throw new ServiceUnavailableException(
        'Pricing Fee Aggregator service is not configured correctly',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<AggregatorQuoteResponse>(
          `${baseUrl}/quotes/${encodeURIComponent(quoteId)}`,
          {
            headers: {
              'x-internal-auth': token,
            },
            timeout: 10000,
          },
        ),
      );

      const data = response.data;

      return {
        source: 'pricing-fee-aggregator',
        connected: true,
        quoteId: data.quoteId,
        rate: data.exchangeRate,
        fee: data.fees?.total ?? 0,
        sourceAmount: data.fromAmount,
        targetAmount: data.toAmountAfterFees,
        expiresAt: data.expiresAt,
        raw: data,
      };
    } catch (error: any) {
      this.logger.error(
        `Quote lookup failed for quoteId=${quoteId}: ${error?.message || error}`,
      );

      throw new ServiceUnavailableException(
        'Unable to fetch quote from pricing fee aggregator',
      );
    }
  }
}
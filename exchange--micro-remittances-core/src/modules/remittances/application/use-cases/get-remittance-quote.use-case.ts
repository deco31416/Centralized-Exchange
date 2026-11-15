import { Inject, Injectable } from '@nestjs/common';
import { QuoteRemittanceDto } from '../dto/quote-remittance.dto';
import { PRICING_AGGREGATOR_CLIENT } from '../../domain/ports/pricing-aggregator-client.port';
import type { PricingAggregatorClientPort } from '../../domain/ports/pricing-aggregator-client.port';

@Injectable()
export class GetRemittanceQuoteUseCase {
  constructor(
    @Inject(PRICING_AGGREGATOR_CLIENT)
    private readonly pricingAggregatorClient: PricingAggregatorClientPort,
  ) {}

  async execute(dto: QuoteRemittanceDto) {
    return this.pricingAggregatorClient.getQuote(
      dto.amount,
      dto.sourceCurrency,
      dto.targetCurrency,
    );
  }
}
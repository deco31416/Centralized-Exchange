import { Inject, Injectable } from '@nestjs/common';
import { FUNDING_METHODS_PORT } from '../tokens';
import type { FundingMethodsPort } from '../ports/funding-methods.port';

@Injectable()
export class GetFundingMethodsUseCase {
  constructor(
    @Inject(FUNDING_METHODS_PORT)
    private readonly fundingMethodsPort: FundingMethodsPort,
  ) {}

  async execute(filters?: { fiatCode?: string; countryCode?: string }) {
    return this.fundingMethodsPort.getAvailableMethods(filters);
  }
}
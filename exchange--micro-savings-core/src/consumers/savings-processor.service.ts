import { Injectable } from '@nestjs/common';

@Injectable()
export class SavingsProcessorService {
  async processContributionSettled(event: Record<string, any>) {
    return {
      message: 'Contribution settled event processed (mock)',
      processed: true,
      event,
    };
  }

  async processWithdrawalSettled(event: Record<string, any>) {
    return {
      message: 'Withdrawal settled event processed (mock)',
      processed: true,
      event,
    };
  }
}
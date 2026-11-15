import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';
import { SavingsProcessorService } from './savings-processor.service';

@Controller('internal/savings-events')
@UseGuards(InternalAuthGuard)
export class SavingsEventsConsumerController {
  constructor(
    private readonly savingsProcessorService: SavingsProcessorService,
  ) {}

  @Post('contribution-settled')
  handleContributionSettled(@Body() event: Record<string, any>) {
    return this.savingsProcessorService.processContributionSettled(event);
  }

  @Post('withdrawal-settled')
  handleWithdrawalSettled(@Body() event: Record<string, any>) {
    return this.savingsProcessorService.processWithdrawalSettled(event);
  }
}
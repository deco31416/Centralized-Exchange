import { Module } from '@nestjs/common';
import { SavingsEventsConsumerController } from './savings-events.consumer.controller';
import { SavingsProcessorService } from './savings-processor.service';

@Module({
  controllers: [SavingsEventsConsumerController],
  providers: [SavingsProcessorService],
})
export class ConsumersModule {}
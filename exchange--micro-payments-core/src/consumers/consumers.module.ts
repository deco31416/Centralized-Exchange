import { Module } from '@nestjs/common';
import { FiatEventsConsumerController } from './fiat-events-consumer.controller';
import { FiatTransferProcessor } from './fiat-transfer-processor.service';
import { WalletLedgerClient } from './wallet-ledger-client.service';

@Module({
  controllers: [FiatEventsConsumerController],
  providers: [FiatTransferProcessor, WalletLedgerClient],
})
export class ConsumersModule {}

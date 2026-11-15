import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { OutboxModule } from '../outbox/outbox.module';
import { PaymentsCoreClient } from './payments-core.client';
import { OutboxRelayService } from './outbox-relay.service';

@Module({
  imports: [ConfigModule, OutboxModule],
  providers: [PaymentsCoreClient, OutboxRelayService],
})
export class OutboxRelayModule {}

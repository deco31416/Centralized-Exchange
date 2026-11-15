import { Module } from '@nestjs/common';
import { AdminP2PController } from './admin-p2p.controller';
import { DisputesModule } from '../domain/disputes/disputes.module';
import { PaymentMethodsModule } from '../domain/payment-methods/payment-methods.module';
import { OrdersModule } from '../domain/orders/orders.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [DisputesModule, PaymentMethodsModule, OrdersModule, SharedModule],
  controllers: [AdminP2PController],
})
export class AdminP2PModule {}

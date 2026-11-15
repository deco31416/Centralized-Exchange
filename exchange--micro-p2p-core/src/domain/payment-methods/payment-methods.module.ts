import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { P2PPaymentMethod, P2PPaymentMethodSchema } from './schemas/p2p-payment-method.schema';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: P2PPaymentMethod.name, schema: P2PPaymentMethodSchema }]),
    SharedModule,
  ],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}

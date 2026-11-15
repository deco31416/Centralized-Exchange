import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { P2PPaymentMethodCatalog, P2PPaymentMethodCatalogSchema } from './schemas/p2p-payment-method-catalog.schema';
import { PaymentMethodCatalogService } from './payment-method-catalog.service';
import { PaymentMethodCatalogController } from './payment-method-catalog.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: P2PPaymentMethodCatalog.name, schema: P2PPaymentMethodCatalogSchema }]),
    SharedModule,
  ],
  controllers: [PaymentMethodCatalogController],
  providers: [PaymentMethodCatalogService],
  exports: [PaymentMethodCatalogService],
})
export class PaymentMethodCatalogModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { P2POrder, P2POrderSchema } from './schemas/p2p-order.schema';
import { P2PAd, P2PAdSchema } from '../ads/schemas/p2p-ad.schema';
import { P2PEscrow, P2PEscrowSchema } from '../escrow/schemas/p2p-escrow.schema';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: P2POrder.name, schema: P2POrderSchema },
      { name: P2PAd.name, schema: P2PAdSchema },
      { name: P2PEscrow.name, schema: P2PEscrowSchema },
    ]),
    SharedModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, MongooseModule],
})
export class OrdersModule {}

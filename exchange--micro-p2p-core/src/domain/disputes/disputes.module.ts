import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { P2PDispute, P2PDisputeSchema } from './schemas/p2p-dispute.schema';
import { P2POrder, P2POrderSchema } from '../orders/schemas/p2p-order.schema';
import { P2PEscrow, P2PEscrowSchema } from '../escrow/schemas/p2p-escrow.schema';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: P2PDispute.name, schema: P2PDisputeSchema },
      { name: P2POrder.name, schema: P2POrderSchema },
      { name: P2PEscrow.name, schema: P2PEscrowSchema },
    ]),
    SharedModule,
  ],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}

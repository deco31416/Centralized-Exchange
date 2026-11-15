import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { P2PChatMessage, P2PChatMessageSchema } from './schemas/p2p-chat-message.schema';
import { P2POrder, P2POrderSchema } from '../orders/schemas/p2p-order.schema';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: P2PChatMessage.name, schema: P2PChatMessageSchema },
      { name: P2POrder.name, schema: P2POrderSchema },
    ]),
    SharedModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}

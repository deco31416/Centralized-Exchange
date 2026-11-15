import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { P2PChatMessage, P2PChatMessageDocument } from './schemas/p2p-chat-message.schema';
import { P2POrder, P2POrderDocument } from '../orders/schemas/p2p-order.schema';
import { CreateMessageDto } from './dto/create-message.dto';

// P2P-CHAT-REALTIME-001: Solo persistencia. WebSocket pendiente.
@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(P2PChatMessage.name) private readonly msgModel: Model<P2PChatMessageDocument>,
    @InjectModel(P2POrder.name) private readonly orderModel: Model<P2POrderDocument>,
  ) {}

  private async assertParticipant(orderId: string, userId: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId }).lean();
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('No eres participante de esta orden');
    }
    return order;
  }

  async send(userId: string, orderId: string, dto: CreateMessageDto): Promise<P2PChatMessage> {
    await this.assertParticipant(orderId, userId);
    const msg = await this.msgModel.create({
      messageId: uuidv4(),
      orderId,
      senderId: userId,
      text: dto.text,
    });
    this.logger.log(`[Chat] message sent | orderId=${orderId} | senderId=${userId}`);
    return msg;
  }

  async findByOrder(orderId: string, userId: string): Promise<P2PChatMessage[]> {
    await this.assertParticipant(orderId, userId);
    return this.msgModel.find({ orderId }).sort({ createdAt: 1 }).lean();
  }
}

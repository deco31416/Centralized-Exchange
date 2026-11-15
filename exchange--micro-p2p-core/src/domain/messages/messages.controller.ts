import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';
import { UserContextGuard } from '../../shared/guards/user-context.guard';
import { UserId } from '../../shared/decorators/user-context.decorator';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('P2P — Chat de Órdenes')
@ApiSecurity('x-internal-auth')
@ApiSecurity('x-user-id')
@UseGuards(InternalAuthGuard, UserContextGuard)
@Controller('p2p/orders/:orderId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar mensaje en el chat de la orden' })
  send(@UserId() userId: string, @Param('orderId') orderId: string, @Body() dto: CreateMessageDto) {
    return this.messagesService.send(userId, orderId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Historial de chat de la orden' })
  findAll(@UserId() userId: string, @Param('orderId') orderId: string) {
    return this.messagesService.findByOrder(orderId, userId);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';
import { UserContextGuard } from '../../shared/guards/user-context.guard';
import { UserId } from '../../shared/decorators/user-context.decorator';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@ApiTags('P2P — Disputas')
@ApiSecurity('x-internal-auth')
@ApiSecurity('x-user-id')
@UseGuards(InternalAuthGuard, UserContextGuard)
@Controller('p2p/disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post('orders/:orderId')
  @ApiOperation({ summary: 'Abrir disputa en una orden' })
  open(@UserId() userId: string, @Param('orderId') orderId: string, @Body() dto: CreateDisputeDto) {
    return this.disputesService.open(userId, orderId, dto);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Ver disputas de una orden' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.disputesService.findByOrder(orderId);
  }
}

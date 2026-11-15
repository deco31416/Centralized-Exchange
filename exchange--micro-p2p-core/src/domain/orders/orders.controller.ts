import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';
import { UserContextGuard } from '../../shared/guards/user-context.guard';
import { UserId } from '../../shared/decorators/user-context.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';

export class DisputeOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

@ApiTags('P2P — Órdenes')
@ApiSecurity('x-internal-auth')
@ApiSecurity('x-user-id')
@UseGuards(InternalAuthGuard, UserContextGuard)
@Controller('p2p/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear orden de compra desde un anuncio' })
  create(@UserId() userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mis órdenes (como comprador o vendedor)' })
  findMine(@UserId() userId: string, @Query() query: QueryOrdersDto) {
    return this.ordersService.findByUser(userId, query);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Detalle de orden' })
  findOne(@Param('orderId') orderId: string) {
    return this.ordersService.findById(orderId);
  }

  @Post(':orderId/mark-paid')
  @ApiOperation({ summary: 'Comprador marca que pagó en fiat externo' })
  markPaid(@UserId() userId: string, @Param('orderId') orderId: string) {
    return this.ordersService.markPaid(userId, orderId);
  }

  @Post(':orderId/confirm-received')
  @ApiOperation({ summary: 'Vendedor confirma recepción del pago fiat externo' })
  confirmReceived(@UserId() userId: string, @Param('orderId') orderId: string) {
    return this.ordersService.confirmReceived(userId, orderId);
  }

  @Post(':orderId/release')
  @ApiOperation({ summary: 'Vendedor libera el crypto al comprador (solo si escrow LOCKED y pago confirmado)' })
  release(@UserId() userId: string, @Param('orderId') orderId: string) {
    return this.ordersService.releaseCrypto(userId, orderId);
  }

  @Post(':orderId/cancel')
  @ApiOperation({ summary: 'Cancelar orden (prohibido si pago ya marcado — abrir disputa)' })
  cancel(@UserId() userId: string, @Param('orderId') orderId: string) {
    return this.ordersService.cancel(userId, orderId);
  }

  @Post(':orderId/dispute')
  @ApiOperation({ summary: 'Abrir disputa — bloquea release/refund automático hasta resolución manual' })
  dispute(@UserId() userId: string, @Param('orderId') orderId: string, @Body() dto: DisputeOrderDto) {
    return this.ordersService.dispute(userId, orderId, dto.reason);
  }
}

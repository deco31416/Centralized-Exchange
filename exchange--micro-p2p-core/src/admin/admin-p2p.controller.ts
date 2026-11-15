import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeaders, ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';
import { DisputesService } from '../domain/disputes/disputes.service';
import { ResolveDisputeDto } from '../domain/disputes/dto/resolve-dispute.dto';
import { PaymentMethodsService } from '../domain/payment-methods/payment-methods.service';
import { OrdersService } from '../domain/orders/orders.service';
import { ForceReleaseDto } from './dto/force-release.dto';
import { ForceRefundDto } from './dto/force-refund.dto';

@ApiTags('Admin P2P')
@ApiSecurity('x-internal-auth')
@ApiHeaders([{ name: 'x-internal-auth', required: true }, { name: 'x-admin-id', required: false }])
@UseGuards(InternalAuthGuard)
@Controller('admin/p2p')
export class AdminP2PController {
  constructor(
    private readonly disputesService: DisputesService,
    private readonly pmService: PaymentMethodsService,
    private readonly ordersService: OrdersService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Disputes
  // ─────────────────────────────────────────────────────────────────────────

  @Get('disputes/open')
  @ApiOperation({ summary: '[Admin] Disputas abiertas pendientes de resolución' })
  openDisputes() {
    return this.disputesService.findOpen();
  }

  @Get('disputes')
  @ApiOperation({ summary: '[Admin] Lista paginada de todas las disputas con filtros opcionales' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listDisputes(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.disputesService.findAll({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('disputes/:disputeId')
  @ApiOperation({ summary: '[Admin] Detalle de una disputa' })
  getDispute(@Param('disputeId') disputeId: string) {
    return this.disputesService.findOne(disputeId);
  }

  @Post('disputes/:disputeId/resolve')
  @ApiOperation({
    summary: '[Admin] Resolver disputa — RELEASE (libera al comprador), REFUND (devuelve al vendedor), REJECT (cierra sin mover cripto)',
  })
  resolve(
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveDisputeDto,
    @Headers('x-admin-id') adminId?: string,
  ) {
    return this.disputesService.resolve(adminId || 'admin-system', disputeId, dto);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Orders
  // ─────────────────────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: '[Admin] Lista paginada de todas las órdenes con filtros opcionales' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'buyerId', required: false })
  @ApiQuery({ name: 'sellerId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listOrders(
    @Query('status') status?: string,
    @Query('buyerId') buyerId?: string,
    @Query('sellerId') sellerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.adminFindAll({
      status,
      buyerId,
      sellerId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: '[Admin] Detalle de una orden' })
  getOrder(@Param('orderId') orderId: string) {
    return this.ordersService.adminFindOne(orderId);
  }

  @Post('orders/:orderId/force-release')
  @ApiOperation({ summary: '[Admin] Forzar liberación de escrow al comprador (omite flujo normal)' })
  forceRelease(
    @Param('orderId') orderId: string,
    @Body() dto: ForceReleaseDto,
    @Headers('x-admin-id') adminId?: string,
  ) {
    return this.ordersService.adminForceRelease(adminId || 'admin-system', orderId, dto.reason);
  }

  @Post('orders/:orderId/force-refund')
  @ApiOperation({ summary: '[Admin] Forzar devolución de escrow al vendedor (omite flujo normal)' })
  forceRefund(
    @Param('orderId') orderId: string,
    @Body() dto: ForceRefundDto,
    @Headers('x-admin-id') adminId?: string,
  ) {
    return this.ordersService.adminForceRefund(adminId || 'admin-system', orderId, dto.reason);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Payment Methods
  // ─────────────────────────────────────────────────────────────────────────

  @Get('payment-methods/pending')
  @ApiOperation({ summary: '[Admin] Métodos de pago pendientes de aprobación (PENDING_REVIEW)' })
  pendingPaymentMethods() {
    return this.pmService.findPendingApproval();
  }

  @Post('payment-methods/:paymentMethodId/approve')
  @ApiOperation({ summary: '[Admin] Aprobar método de pago de usuario' })
  approvePaymentMethod(
    @Param('paymentMethodId') paymentMethodId: string,
    @Body() body: { notes?: string },
    @Headers('x-admin-id') adminId?: string,
  ) {
    return this.pmService.adminApprove(paymentMethodId, adminId || 'admin-system', body?.notes);
  }
}

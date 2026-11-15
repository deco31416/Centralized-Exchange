import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';
import { UserContextGuard } from '../../shared/guards/user-context.guard';
import { UserId } from '../../shared/decorators/user-context.decorator';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@ApiTags('P2P — Métodos de Pago del Usuario')
@ApiSecurity('x-internal-auth')
@ApiSecurity('x-user-id')
@UseGuards(InternalAuthGuard, UserContextGuard)
@Controller('p2p/payment-methods')
export class PaymentMethodsController {
  constructor(private readonly pmService: PaymentMethodsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar método de pago externo (banco, billetera, etc.)' })
  create(@UserId() userId: string, @Body() dto: CreatePaymentMethodDto) {
    return this.pmService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mis métodos de pago registrados (sin datos sensibles)' })
  findMine(@UserId() userId: string) {
    return this.pmService.findByUser(userId);
  }

  @Patch(':paymentMethodId')
  @ApiOperation({ summary: 'Actualizar un método de pago propio' })
  update(
    @UserId() userId: string,
    @Param('paymentMethodId') paymentMethodId: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.pmService.update(userId, paymentMethodId, dto);
  }

  @Delete(':paymentMethodId')
  @ApiOperation({ summary: 'Eliminar un método de pago propio' })
  remove(@UserId() userId: string, @Param('paymentMethodId') paymentMethodId: string) {
    return this.pmService.delete(userId, paymentMethodId);
  }

  @Get(':paymentMethodId/reveal')
  @ApiOperation({ summary: 'Ver detalles completos descifrados (solo propietario)' })
  async reveal(@UserId() userId: string, @Param('paymentMethodId') paymentMethodId: string) {
    const pm = await this.pmService.findById(paymentMethodId);
    return this.pmService.revealDetails(pm, userId, false);
  }
}

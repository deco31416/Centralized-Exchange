import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';
import { PaymentMethodCatalogService } from './payment-method-catalog.service';

@ApiTags('P2P — Catálogo de Métodos de Pago')
@ApiSecurity('x-internal-auth')
@UseGuards(InternalAuthGuard)
@Controller('p2p/payment-method-catalog')
export class PaymentMethodCatalogController {
  constructor(private readonly catalogService: PaymentMethodCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar métodos de pago del catálogo (filtrar por país/moneda)' })
  find(
    @Query('country') country?: string,
    @Query('currency') currency?: string,
  ) {
    return this.catalogService.findByCountryAndCurrency(country, currency);
  }

  @Get('all')
  @ApiOperation({ summary: 'Catálogo completo (admin/debug)' })
  findAll() {
    return this.catalogService.findAll();
  }
}

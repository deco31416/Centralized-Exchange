import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { STPPaymentService, CreatePaymentOrderDto } from './stp-payment.service';
import { InternalAuthGuard } from '../../../shared/guards/internal-auth.guard';

/**
 * Controlador REST para operaciones SPEI con STP
 * 
 * SEGURIDAD:
 * - Protegido con InternalAuthGuard (ubicación estandarizada)
 * - Solo otros microservicios pueden llamar estos endpoints
 * - Requiere header: x-internal-auth con INTERNAL_AUTH_TOKEN
 * 
 * Endpoints:
 * - POST /api/v1/spei/stp/payment-orders - Crear orden de pago
 * - GET /api/v1/spei/stp/payment-orders/:claveRastreo - Consultar estado
 * - GET /api/v1/spei/stp/health - Health check
 */
@Controller('spei/stp')
@UseGuards(InternalAuthGuard)
export class STPPaymentController {
  private readonly logger = new Logger(STPPaymentController.name);

  constructor(private readonly stpPaymentService: STPPaymentService) {}

  /**
   * Crea una nueva orden de pago SPEI
   * 
   * POST /api/v1/spei/stp/payment-orders
   */
  @Post('payment-orders')
  @HttpCode(HttpStatus.CREATED)
  async createPaymentOrder(@Body() dto: CreatePaymentOrderDto) {
    this.logger.log(`[POST /spei/stp/payment-orders] Creando orden - Monto: $${dto.monto}`);

    const result = await this.stpPaymentService.createPaymentOrder(dto);

    if (!result.success) {
      this.logger.warn(`Orden rechazada: ${result.error?.message}`);
    }

    return {
      success: result.success,
      data: result.success ? {
        claveRastreo: result.claveRastreo,
        stpTransactionId: result.stpTransactionId,
        estado: result.estado,
        monto: result.monto,
        beneficiario: result.beneficiario,
        timestamp: result.timestamp,
      } : undefined,
      error: result.error,
      meta: {
        durationMs: result.durationMs,
      },
    };
  }

  /**
   * Consulta el estado de una orden de pago
   * 
   * GET /api/v1/spei/stp/payment-orders/:claveRastreo
   */
  @Get('payment-orders/:claveRastreo')
  async getPaymentStatus(@Param('claveRastreo') claveRastreo: string) {
    this.logger.log(`[GET /spei/stp/payment-orders/${claveRastreo}] Consultando estado`);

    const result = await this.stpPaymentService.checkPaymentStatus(claveRastreo);

    return {
      success: result.success,
      data: result.success ? {
        claveRastreo: result.claveRastreo,
        estado: result.estado,
        causaDevolucion: result.causaDevolucion,
        tsLiquidacion: result.tsLiquidacion,
        monto: result.monto,
      } : undefined,
      error: result.error,
      timestamp: result.timestamp,
    };
  }

  /**
   * Health check del servicio STP
   * 
   * GET /api/v1/spei/stp/health
   */
  @Get('health')
  async healthCheck() {
    // El health check se implementará más adelante
    return {
      status: 'healthy',
      service: 'stp-spei',
      timestamp: new Date().toISOString(),
    };
  }
}

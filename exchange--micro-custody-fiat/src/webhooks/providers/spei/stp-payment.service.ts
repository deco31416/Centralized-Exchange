import { Injectable, Logger } from '@nestjs/common';
import { STPClientService } from './stp-client.service';
import { STPPaymentOrderData } from './stp-signature.service';

/**
 * Servicio de alto nivel para manejo de pagos SPEI vía STP
 * 
 * Este servicio orquesta:
 * - Envío de órdenes de pago
 * - Validación de datos
 * - Manejo de errores
 * - Logging y auditoría
 */
@Injectable()
export class STPPaymentService {
  private readonly logger = new Logger(STPPaymentService.name);

  constructor(private readonly stpClient: STPClientService) {}

  /**
   * Crea y envía una orden de pago SPEI
   * 
   * @param payment Datos del pago a realizar
   * @returns Resultado de la operación
   */
  async createPaymentOrder(payment: CreatePaymentOrderDto): Promise<PaymentOrderResult> {
    const startTime = Date.now();

    try {
      // 1. Validar datos
      this.validatePaymentData(payment);

      // 2. Generar clave de rastreo única (si no viene)
      const claveRastreo = payment.claveRastreo || this.generateClaveRastreo();

      // 3. Construir datos para STP
      const orderData: STPPaymentOrderData = {
        // Datos de la operación
        institucionContraparte: payment.institucionBeneficiario,
        fechaOperacion: this.formatFecha(new Date()),
        claveRastreo,
        institucionOperante: payment.institucionOrdenante || '90646', // Tu banco
        monto: payment.monto,
        tipoPago: '1', // 1 = Transferencia

        // Ordenante
        nombreOrdenante: payment.nombreOrdenante,
        cuentaOrdenante: payment.cuentaOrdenante,
        rfcCurpOrdenante: payment.rfcCurpOrdenante,
        tipoCuentaOrdenante: '40', // 40 = CLABE

        // Beneficiario
        nombreBeneficiario: payment.nombreBeneficiario,
        cuentaBeneficiario: payment.cuentaBeneficiario,
        rfcCurpBeneficiario: payment.rfcCurpBeneficiario,
        tipoCuentaBeneficiario: '40', // 40 = CLABE
        emailBeneficiario: payment.emailBeneficiario,

        // Concepto
        conceptoPago: payment.concepto.substring(0, 150), // Max 150 caracteres
        referenciaCobranza: payment.referenciaNumerica,

        // Configuración
        topologia: 'T', // T = Tercero a tercero
        medioEntrega: '3', // 3 = SPEI
        prioridad: payment.prioridad || '0', // 0 = Normal, 1 = Alta
      };

      this.logger.log(`Enviando orden de pago SPEI - Monto: $${payment.monto} - Beneficiario: ${payment.nombreBeneficiario}`);

      // 4. Enviar a STP
      const response = await this.stpClient.registrarOrden(orderData);

      const duration = Date.now() - startTime;

      if (response.success) {
        this.logger.log(`✓ Orden exitosa - Clave: ${claveRastreo} - Duración: ${duration}ms`);
        
        return {
          success: true,
          claveRastreo,
          stpTransactionId: response.data?.id,
          estado: response.data?.estado || 'ENVIADA',
          monto: payment.monto,
          beneficiario: payment.nombreBeneficiario,
          timestamp: response.timestamp,
          durationMs: duration,
        };
      } else {
        this.logger.error(`✗ Orden rechazada - Clave: ${claveRastreo} - Error: ${response.error?.message}`);
        
        return {
          success: false,
          claveRastreo,
          error: response.error,
          monto: payment.monto,
          beneficiario: payment.nombreBeneficiario,
          timestamp: response.timestamp,
          durationMs: duration,
        };
      }

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Error crítico al crear orden SPEI: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          message: error.message,
          code: 'INTERNAL_ERROR',
        },
        monto: payment.monto,
        beneficiario: payment.nombreBeneficiario,
        timestamp: new Date().toISOString(),
        durationMs: duration,
      };
    }
  }

  /**
   * Consulta el estado de una orden de pago
   */
  async checkPaymentStatus(claveRastreo: string): Promise<PaymentStatusResult> {
    try {
      const response = await this.stpClient.consultarEstadoOrden(claveRastreo);

      return {
        success: response.success,
        claveRastreo,
        estado: response.data?.estado,
        causaDevolucion: response.data?.causaDevolucion,
        tsLiquidacion: response.data?.tsLiquidacion,
        monto: response.data?.monto,
        error: response.error,
        timestamp: response.timestamp,
      };

    } catch (error: any) {
      this.logger.error(`Error al consultar estado: ${error.message}`);
      
      return {
        success: false,
        claveRastreo,
        error: {
          message: error.message,
          code: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Valida los datos del pago antes de enviarlo
   */
  private validatePaymentData(payment: CreatePaymentOrderDto): void {
    if (!payment.monto || payment.monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    if (!payment.cuentaBeneficiario || payment.cuentaBeneficiario.length !== 18) {
      throw new Error('La CLABE del beneficiario debe tener 18 dígitos');
    }

    if (!payment.nombreBeneficiario || payment.nombreBeneficiario.trim().length === 0) {
      throw new Error('El nombre del beneficiario es requerido');
    }

    if (!payment.concepto || payment.concepto.trim().length === 0) {
      throw new Error('El concepto del pago es requerido');
    }

    // Validar que la CLABE sea numérica
    if (!/^\d{18}$/.test(payment.cuentaBeneficiario)) {
      throw new Error('La CLABE del beneficiario debe contener solo dígitos');
    }
  }

  /**
   * Genera una clave de rastreo única
   * 
   * Formato: decoYYYYMMDDHHMMSS + random
   */
  private generateClaveRastreo(): string {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:T.Z]/g, '')
      .substring(0, 14); // YYYYMMDDHHMMSS
    
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    return `DECOX${timestamp}${random}`;
  }

  /**
   * Formatea fecha a YYYYMMDD para STP
   */
  private formatFecha(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}${month}${day}`;
  }
}

/**
 * DTO para crear una orden de pago
 */
export interface CreatePaymentOrderDto {
  // Ordenante
  nombreOrdenante: string;
  cuentaOrdenante: string;
  rfcCurpOrdenante?: string;
  institucionOrdenante?: string;

  // Beneficiario
  nombreBeneficiario: string;
  cuentaBeneficiario: string;
  rfcCurpBeneficiario?: string;
  emailBeneficiario?: string;
  institucionBeneficiario: string;

  // Pago
  monto: number;
  concepto: string;
  referenciaNumerica?: string;
  claveRastreo?: string;
  prioridad?: '0' | '1'; // 0=Normal, 1=Alta
}

/**
 * Resultado de crear una orden de pago
 */
export interface PaymentOrderResult {
  success: boolean;
  claveRastreo?: string;
  stpTransactionId?: number;
  estado?: string;
  error?: {
    message: string;
    code: string;
    detail?: any;
  };
  monto: number;
  beneficiario: string;
  timestamp: string;
  durationMs: number;
}

/**
 * Resultado de consultar estado
 */
export interface PaymentStatusResult {
  success: boolean;
  claveRastreo: string;
  estado?: string;
  causaDevolucion?: string;
  tsLiquidacion?: string;
  monto?: number;
  error?: {
    message: string;
    code: string;
  };
  timestamp: string;
}

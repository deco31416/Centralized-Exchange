import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { STPSignatureService, STPPaymentOrderData } from './stp-signature.service';

/**
 * Cliente HTTP para API de STP (Sistema de Transferencias y Pagos)
 * 
 * Documentación: Ver SPEI_STP_SIGNATURE.md
 */
@Injectable()
export class STPClientService {
  private readonly logger = new Logger(STPClientService.name);
  private readonly apiUrl: string;
  private readonly empresa: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly signatureService: STPSignatureService,
  ) {
    const env = this.configService.get<string>('NODE_ENV', 'development');
    
    // URLs de STP
    this.apiUrl = env === 'production'
      ? this.configService.get<string>('SPEI_STP_API_URL_PROD', 'https://demo.stpmex.com:7024/spei/webservices')
      : this.configService.get<string>('SPEI_STP_API_URL_DEV', 'https://demo.stpmex.com:7024/spei/webservices');
    
    this.empresa = this.configService.get<string>('SPEI_STP_EMPRESA', 'DECOEXCHANGE');
    
    this.logger.log(`STP Client inicializado - Ambiente: ${env}`);
    this.logger.log(`API URL: ${this.apiUrl}`);
  }

  /**
   * Registra una orden de pago SPEI en STP
   * 
   * @param orderData Datos de la orden de pago
   * @returns Respuesta de STP con el resultado de la operación
   */
  async registrarOrden(orderData: STPPaymentOrderData): Promise<STPRegistrarOrdenResponse> {
    try {
      // 1. Generar firma digital
      const { cadenaOriginal, firma } = this.signatureService.signPaymentOrder(orderData);

      this.logger.debug(`Registrando orden SPEI - Clave Rastreo: ${orderData.claveRastreo}`);
      this.logger.debug(`Cadena Original: ${cadenaOriginal}`);

      // 2. Construir request para STP
      const requestPayload = {
        ...orderData,
        empresa: orderData.empresa || this.empresa,
        firma,
      };

      // 3. Enviar a STP
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/RegistraOrden`,
          requestPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            timeout: 30000, // 30 segundos
          },
        ),
      );

      this.logger.log(`✓ Orden registrada exitosamente - Clave Rastreo: ${orderData.claveRastreo}`);

      return {
        success: true,
        data: response.data,
        claveRastreo: orderData.claveRastreo,
        timestamp: new Date().toISOString(),
      };

    } catch (error: any) {
      this.logger.error(
        `Error al registrar orden SPEI - Clave Rastreo: ${orderData.claveRastreo}`,
        error?.response?.data || error?.message,
      );

      return {
        success: false,
        error: {
          message: error?.response?.data?.descripcionError || error?.message || 'Error desconocido',
          code: error?.response?.data?.id || 'UNKNOWN_ERROR',
          detail: error?.response?.data,
        },
        claveRastreo: orderData.claveRastreo,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Consulta el estado de una orden de pago
   * 
   * @param claveRastreo Clave de rastreo de la orden
   * @returns Estado actual de la orden
   */
  async consultarEstadoOrden(claveRastreo: string): Promise<STPConsultaEstadoResponse> {
    try {
      // Construir cadena original para consulta
      const cadenaOriginal = `||${claveRastreo}|${this.empresa}||`;
      const firma = this.signatureService.sign(cadenaOriginal);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/ConsultaOrden`,
          {
            empresa: this.empresa,
            claveRastreo,
            firma,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            timeout: 15000,
          },
        ),
      );

      this.logger.debug(`Estado consultado - Clave Rastreo: ${claveRastreo} - Estado: ${response.data?.estado}`);

      return {
        success: true,
        data: response.data,
        claveRastreo,
        timestamp: new Date().toISOString(),
      };

    } catch (error: any) {
      this.logger.error(
        `Error al consultar estado - Clave Rastreo: ${claveRastreo}`,
        error?.response?.data || error?.message,
      );

      return {
        success: false,
        error: {
          message: error?.response?.data?.descripcionError || error?.message || 'Error desconocido',
          code: error?.response?.data?.id || 'UNKNOWN_ERROR',
        },
        claveRastreo,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Valida que el cliente esté configurado correctamente
   */
  healthCheck(): { healthy: boolean; details: Record<string, any> } {
    const signatureHealthy = this.signatureService.healthCheck();

    return {
      healthy: signatureHealthy && !!this.apiUrl && !!this.empresa,
      details: {
        apiUrl: this.apiUrl,
        empresa: this.empresa,
        signatureService: signatureHealthy,
      },
    };
  }
}

/**
 * Respuesta de STP al registrar una orden
 */
export interface STPRegistrarOrdenResponse {
  success: boolean;
  data?: {
    id: number;                    // ID de la transacción en STP
    estado: string;                // Estado de la orden
    descripcion?: string;          // Descripción del resultado
    causaDevolucion?: string;      // Causa si fue devuelta
    tsLiquidacion?: string;        // Timestamp de liquidación
  };
  error?: {
    message: string;
    code: string;
    detail?: any;
  };
  claveRastreo: string;
  timestamp: string;
}

/**
 * Respuesta de STP al consultar estado
 */
export interface STPConsultaEstadoResponse {
  success: boolean;
  data?: {
    estado: string;                // LIQUIDACION, DEVOLUCION, CANCELADA, etc.
    causaDevolucion?: string;
    tsLiquidacion?: string;
    claveRastreo: string;
    monto: number;
  };
  error?: {
    message: string;
    code: string;
  };
  claveRastreo: string;
  timestamp: string;
}

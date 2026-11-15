import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Servicio para generar firmas digitales RSA-SHA256 según especificación STP
 * 
 * Documentación: Ver SPEI_STP_SIGNATURE.md
 */
@Injectable()
export class STPSignatureService {
  private readonly logger = new Logger(STPSignatureService.name);
  private privateKey: Buffer;
  private empresa: string;

  constructor(private configService: ConfigService) {
    this.loadPrivateKey();
    this.empresa = this.configService.get<string>('SPEI_STP_EMPRESA', 'DECOEXCHANGE');
  }

  /**
   * Carga la llave privada desde el sistema de archivos
   */
  private loadPrivateKey(): void {
    const keyPath = this.configService.get<string>('SPEI_STP_PRIVATE_KEY_PATH');
    
    if (!keyPath) {
      throw new Error('SPEI_STP_PRIVATE_KEY_PATH no configurado en variables de entorno');
    }

    const resolvedPath = path.resolve(process.cwd(), keyPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Llave privada STP no encontrada en: ${resolvedPath}`);
    }

    try {
      this.privateKey = fs.readFileSync(resolvedPath);
      this.logger.log('✓ Llave privada STP cargada correctamente');
    } catch (error) {
      this.logger.error(`Error al cargar llave privada: ${error.message}`);
      throw error;
    }
  }

  /**
   * Construye la cadena original según especificación STP para RegistraOrden
   * 
   * Formato: ||CAMPO1|CAMPO2|CAMPO3|...|CAMPOn||
   * 
   * @param data Datos de la orden de pago
   * @returns Cadena original lista para firmar
   */
  buildCadenaOriginal(data: STPPaymentOrderData): string {
    // Normalizar montos a 2 decimales
    const formatMonto = (value?: number): string => {
      return value !== undefined && value !== null ? value.toFixed(2) : '';
    };

    // Limpiar espacios al inicio/fin
    const trim = (value?: string): string => {
      return value ? value.trim() : '';
    };

    // Campos según orden especificado por STP para RegistraOrden
    const campos = [
      trim(data.institucionContraparte),      // 0
      trim(data.empresa || this.empresa),     // 1
      trim(data.fechaOperacion),              // 2
      trim(data.folioOrigen),                 // 3
      trim(data.claveRastreo),                // 4
      trim(data.institucionOperante),         // 5
      formatMonto(data.monto),                // 6
      trim(data.tipoPago),                    // 7
      trim(data.tipoCuentaOrdenante),         // 8
      trim(data.nombreOrdenante),             // 9
      trim(data.cuentaOrdenante),             // 10
      trim(data.rfcCurpOrdenante),            // 11
      trim(data.tipoCuentaBeneficiario),      // 12
      trim(data.nombreBeneficiario),          // 13
      trim(data.cuentaBeneficiario),          // 14
      trim(data.rfcCurpBeneficiario),         // 15
      trim(data.emailBeneficiario),           // 16
      trim(data.tipoCuentaBeneficiario2),     // 17
      trim(data.nombreBeneficiario2),         // 18
      trim(data.cuentaBeneficiario2),         // 19
      trim(data.rfcCurpBeneficiario2),        // 20
      trim(data.conceptoPago),                // 21
      trim(data.conceptoPago2),               // 22
      trim(data.claveCatUsuario1),            // 23
      trim(data.claveCatUsuario2),            // 24
      trim(data.clavePago),                   // 25
      trim(data.referenciaCobranza),          // 26
      trim(data.referenciaNumerica),          // 27
      trim(data.tipoOperacion),               // 28
      trim(data.topologia),                   // 29
      trim(data.usuario),                     // 30
      trim(data.medioEntrega),                // 31
      trim(data.prioridad),                   // 32
      formatMonto(data.iva),                  // 33
    ];

    const cadena = `||${campos.join('|')}||`;

    this.logger.debug(`Cadena original generada: ${cadena}`);

    return cadena;
  }

  /**
   * Genera la firma digital RSA-SHA256 en Base64
   * 
   * @param cadenaOriginal Cadena a firmar
   * @returns Firma en formato Base64
   */
  sign(cadenaOriginal: string): string {
    try {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(cadenaOriginal, 'utf8');
      sign.end();

      const signature = sign.sign(this.privateKey, 'base64');

      this.logger.debug(`Firma generada: ${signature.substring(0, 50)}...`);

      return signature;
    } catch (error) {
      this.logger.error(`Error al generar firma: ${error.message}`);
      throw new Error(`Error al firmar orden de pago: ${error.message}`);
    }
  }

  /**
   * Método todo-en-uno: construir cadena original y firmar
   * 
   * @param data Datos de la orden de pago
   * @returns Objeto con cadena original y firma
   */
  signPaymentOrder(data: STPPaymentOrderData): STPSignatureResult {
    const cadenaOriginal = this.buildCadenaOriginal(data);
    const firma = this.sign(cadenaOriginal);

    return {
      cadenaOriginal,
      firma,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verifica que la llave privada esté cargada correctamente
   */
  healthCheck(): boolean {
    return this.privateKey !== undefined && this.privateKey.length > 0;
  }
}

/**
 * Estructura de datos para orden de pago STP
 */
export interface STPPaymentOrderData {
  // Campos requeridos
  institucionContraparte: string;    // Institución destino
  empresa?: string;                   // Tu empresa (default: DECOEXCHANGE)
  fechaOperacion: string;            // YYYYMMDD
  folioOrigen?: string;              // Folio interno
  claveRastreo: string;              // Clave de rastreo única
  institucionOperante: string;       // Institución origen
  monto: number;                     // Monto con 2 decimales
  tipoPago: string;                  // Tipo de pago (1=Transferencia)

  // Datos del ordenante
  tipoCuentaOrdenante?: string;      // 40=CLABE, 03=Tarjeta
  nombreOrdenante: string;
  cuentaOrdenante: string;           // CLABE ordenante
  rfcCurpOrdenante?: string;

  // Datos del beneficiario
  tipoCuentaBeneficiario: string;    // 40=CLABE, 03=Tarjeta
  nombreBeneficiario: string;
  cuentaBeneficiario: string;        // CLABE beneficiario
  rfcCurpBeneficiario?: string;
  emailBeneficiario?: string;

  // Beneficiario 2 (opcional)
  tipoCuentaBeneficiario2?: string;
  nombreBeneficiario2?: string;
  cuentaBeneficiario2?: string;
  rfcCurpBeneficiario2?: string;

  // Concepto y referencias
  conceptoPago: string;              // Máx 150 caracteres
  conceptoPago2?: string;
  claveCatUsuario1?: string;
  claveCatUsuario2?: string;
  clavePago?: string;
  referenciaCobranza?: string;       // Referencia numérica
  referenciaNumerica?: string;       // Referencia numérica 2

  // Operación
  tipoOperacion?: string;
  topologia?: string;                // T=Tercero a tercero
  usuario?: string;
  medioEntrega?: string;             // 3=SPEI
  prioridad?: string;                // 0=Normal, 1=Alta
  iva?: number;                      // IVA si aplica
}

/**
 * Resultado de la firma digital
 */
export interface STPSignatureResult {
  cadenaOriginal: string;
  firma: string;
  timestamp: string;
}

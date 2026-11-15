import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { STPSignatureService } from './stp-signature.service';
import { STPClientService } from './stp-client.service';
import { STPPaymentService, CreatePaymentOrderDto } from './stp-payment.service';

/**
 * Ejemplo de uso del servicio STP/SPEI
 * 
 * Este archivo muestra cómo integrar los servicios STP en tu aplicación
 */

describe('STP Payment Integration Example', () => {
  let paymentService: STPPaymentService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.local',
        }),
        HttpModule,
      ],
      providers: [
        STPSignatureService,
        STPClientService,
        STPPaymentService,
      ],
    }).compile();

    paymentService = module.get<STPPaymentService>(STPPaymentService);
  });

  /**
   * Ejemplo 1: Crear una orden de pago SPEI
   */
  it('Ejemplo: Crear orden de pago', async () => {
    const paymentData: CreatePaymentOrderDto = {
      // Datos del ordenante (quien envía el dinero)
      nombreOrdenante: 'DECO EXCHANGE SA de CV',
      cuentaOrdenante: '012180001111111111',      // CLABE de DECO EXCHANGE
      rfcCurpOrdenante: 'TWI200101AAA',
      institucionOrdenante: '90646',               // Código del banco

      // Datos del beneficiario (quien recibe el dinero)
      nombreBeneficiario: 'Juan Pérez González',
      cuentaBeneficiario: '012180002222222222',    // CLABE del beneficiario
      rfcCurpBeneficiario: 'PEGJ800101XXX',
      emailBeneficiario: 'juan.perez@example.com',
      institucionBeneficiario: '40072',            // Banco del beneficiario (Banorte)

      // Información del pago
      monto: 1500.50,                              // Monto en pesos mexicanos
      concepto: 'Retiro de fondos - Wallet 12345',
      referenciaNumerica: '123456',
      prioridad: '0',                              // 0 = Normal, 1 = Alta prioridad
    };

    const result = await paymentService.createPaymentOrder(paymentData);

    if (result.success) {
      console.log('✓ Orden creada exitosamente');
      console.log(`  Clave de Rastreo: ${result.claveRastreo}`);
      console.log(`  ID Transacción STP: ${result.stpTransactionId}`);
      console.log(`  Estado: ${result.estado}`);
      console.log(`  Duración: ${result.durationMs}ms`);
    } else {
      console.error('✗ Error al crear orden');
      console.error(`  ${result.error?.message}`);
    }

    expect(result).toBeDefined();
  });

  /**
   * Ejemplo 2: Consultar estado de una orden
   */
  it('Ejemplo: Consultar estado de orden', async () => {
    const claveRastreo = 'deco20250127120530123456';

    const result = await paymentService.checkPaymentStatus(claveRastreo);

    if (result.success) {
      console.log('✓ Estado consultado');
      console.log(`  Estado: ${result.estado}`);
      console.log(`  Monto: $${result.monto}`);
      console.log(`  Liquidación: ${result.tsLiquidacion || 'Pendiente'}`);
    } else {
      console.error('✗ Error al consultar');
      console.error(`  ${result.error?.message}`);
    }

    expect(result).toBeDefined();
  });

  /**
   * Ejemplo 3: Integración con tu flujo de retiros
   */
  it('Ejemplo: Flujo completo de retiro de usuario', async () => {
    // Simulación de un retiro de usuario
    const userId = 'user-12345';
    const withdrawalRequest = {
      amount: 5000.00,
      destinationCLABE: '012180003333333333',
      destinationName: 'María López Sánchez',
      userEmail: 'maria.lopez@example.com',
    };

    console.log(`\n=== Procesando retiro de usuario ${userId} ===`);

    // 1. Validar saldo del usuario (implementar tu lógica)
    console.log('1. Validando saldo...');
    // const hasBalance = await checkUserBalance(userId, withdrawalRequest.amount);
    const hasBalance = true; // Simulado

    if (!hasBalance) {
      console.log('✗ Saldo insuficiente');
      return;
    }

    // 2. Crear orden de pago SPEI
    console.log('2. Creando orden SPEI...');
    const paymentOrder: CreatePaymentOrderDto = {
      nombreOrdenante: 'DECO EXCHANGE',
      cuentaOrdenante: '012180001111111111',
      nombreBeneficiario: withdrawalRequest.destinationName,
      cuentaBeneficiario: withdrawalRequest.destinationCLABE,
      emailBeneficiario: withdrawalRequest.userEmail,
      institucionBeneficiario: '40072',
      monto: withdrawalRequest.amount,
      concepto: `Retiro usuario ${userId}`,
      referenciaNumerica: userId,
    };

    const result = await paymentService.createPaymentOrder(paymentOrder);

    if (result.success) {
      console.log('✓ Orden enviada a STP');
      console.log(`  Clave Rastreo: ${result.claveRastreo}`);

      // 3. Guardar en base de datos (implementar tu lógica)
      console.log('3. Guardando en BD...');
      // await saveWithdrawalRecord({
      //   userId,
      //   claveRastreo: result.claveRastreo,
      //   amount: withdrawalRequest.amount,
      //   status: 'PROCESSING',
      // });

      // 4. Descontar saldo del usuario (implementar tu lógica)
      console.log('4. Descontando saldo...');
      // await deductUserBalance(userId, withdrawalRequest.amount);

      // 5. Notificar al usuario (implementar tu lógica)
      console.log('5. Notificando usuario...');
      // await sendNotification(userId, {
      //   type: 'WITHDRAWAL_PROCESSING',
      //   claveRastreo: result.claveRastreo,
      // });

      console.log('✅ Retiro procesado exitosamente');

    } else {
      console.error('✗ Error en el retiro');
      console.error(`  ${result.error?.message}`);

      // Manejar error: notificar al usuario, revertir, etc.
    }

    expect(result).toBeDefined();
  });
});

/**
 * Ejemplo de uso directo (sin tests)
 */
export async function exampleDirectUsage() {
  // Importar servicios
  const { ConfigModule } = require('@nestjs/config');
  const { HttpModule } = require('@nestjs/axios');
  const { NestFactory } = require('@nestjs/core');
  const { Module } = require('@nestjs/common');

  // Crear módulo temporal
  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.local',
      }),
      HttpModule,
    ],
    providers: [
      STPSignatureService,
      STPClientService,
      STPPaymentService,
    ],
  })
  class TempModule {}

  // Crear app
  const app = await NestFactory.createApplicationContext(TempModule);
  const paymentService = app.get(STPPaymentService);

  // Usar el servicio
  const result = await paymentService.createPaymentOrder({
    nombreOrdenante: 'DECO EXCHANGE',
    cuentaOrdenante: '012180001111111111',
    nombreBeneficiario: 'Juan Pérez',
    cuentaBeneficiario: '012180002222222222',
    institucionBeneficiario: '40072',
    monto: 100.00,
    concepto: 'Pago de prueba',
  });

  console.log(result);

  await app.close();
}

/**
 * Ejemplo de integración en un controlador existente
 */
// import { Controller, Post, Body } from '@nestjs/common';
// import { STPPaymentService } from './providers/spei/stp-payment.service';
//
// @Controller('withdrawals')
// export class WithdrawalsController {
//   constructor(private readonly stpPaymentService: STPPaymentService) {}
//
//   @Post('spei')
//   async createSPEIWithdrawal(@Body() dto: CreateWithdrawalDto) {
//     // Tu lógica de validación
//     
//     // Crear orden SPEI
//     const result = await this.stpPaymentService.createPaymentOrder({
//       nombreOrdenante: 'DECO EXCHANGE',
//       cuentaOrdenante: '012180001111111111',
//       nombreBeneficiario: dto.beneficiaryName,
//       cuentaBeneficiario: dto.beneficiaryCLABE,
//       institucionBeneficiario: dto.bankCode,
//       monto: dto.amount,
//       concepto: dto.concept,
//     });
//
//     return result;
//   }
// }

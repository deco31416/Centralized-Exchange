import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  BadRequestException,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { InternalAuthGuard } from '../../shared/security/internal-auth.guard';
import { P2PCodeService } from './p2p-code.service';
import { WalletLedgerClient } from './wallet-ledger.client';
import { GenerateCodeDto, GenerateBatchDto, ReceiveWithCodeDto, RequestOtpDto } from './dto';

/**
 * Controller de transferencias P2P internas.
 *
 * Rutas:
 *   POST /internal/p2p/generate-code     → Cobrador genera código QR
 *   POST /internal/p2p/receive-with-code → Pagador reclama pago con código
 *   POST /internal/p2p/request-otp       → Solicitar OTP pre-pago
 *   POST /internal/p2p/cancel            → Cobrador cancela código
 *   GET  /internal/p2p/active/:userId    → Códigos activos de un usuario
 *
 * Guard: InternalAuthGuard — solo accesible desde api-gateway con token interno.
 */
@Controller('internal/p2p')
@UseGuards(InternalAuthGuard)
export class P2PController {
  private readonly logger = new Logger(P2PController.name);

  constructor(
    private readonly p2pCodeService: P2PCodeService,
    private readonly walletLedgerClient: WalletLedgerClient,
  ) {}

  // ─── Generate Code (Cobrar QR) ────────────────────────────

  /**
   * El cobrador genera un código de 6 dígitos + datos QR.
   * El código se muestra como QR para que el pagador lo escanee.
   */
  @Post('generate-code')
  async generateCode(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: GenerateCodeDto,
  ) {
    const result = await this.p2pCodeService.createCode({
      fromUserId: body.fromUserId,
      currency: body.currency,
      amountMinorUnits: body.amountMinorUnits,
      ttlMinutes: body.ttlMinutes || 10,
      concept: body.concept,
    });

    return {
      success: true,
      code: result.code,
      expiresAt: result.expiresAt,
      qrData: result.qrData,
      currency: body.currency,
      amountMinorUnits: body.amountMinorUnits,
    };
  }

  // ─── Generate Batch (Split Payments) ──────────────────────

  /**
   * Genera múltiples códigos P2P en lote para dividir pagos.
   * Cada item tiene su propio monto (ya dividido por el frontend).
   */
  @Post('generate-batch')
  async generateBatch(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: GenerateBatchDto,
  ) {
    const results = await this.p2pCodeService.createBatch(
      body.items.map((item) => ({
        fromUserId: body.fromUserId,
        currency: item.currency,
        amountMinorUnits: item.amountMinorUnits,
        ttlMinutes: body.ttlMinutes || 10,
        concept: item.concept,
        transferType: 'COLLECT_QR' as const,
      })),
    );

    return {
      success: true,
      codes: results.map((r, i) => ({
        code: r.code,
        expiresAt: r.expiresAt,
        qrData: r.qrData,
        currency: body.items[i].currency,
        amountMinorUnits: body.items[i].amountMinorUnits,
      })),
    };
  }

  // ─── Receive With Code (Pagos QR) ─────────────────────────

  /**
   * El pagador escanea el QR → extrae el code → confirma el pago.
   *
   * Flujo:
   * 1. Valida el código (existe, no expirado, no self-pay)
   * 2. Llama a wallet-ledger-core para ejecutar la transferencia
   * 3. Registra el ledgerTxId en el documento del código
   */
  @Post('receive-with-code')
  async receiveWithCode(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: ReceiveWithCodeDto,
  ) {
    // 1. Validar y consumir código
    const codeResult = await this.p2pCodeService.consumeCode({
      code: body.code,
      toUserId: body.toUserId,
    });

    if (!codeResult.valid) {
      return { success: false, reason: codeResult.reason };
    }

    // 2. Ejecutar transferencia en wallet-ledger-core
    // En QR: fromUserId = cobrador (recibe dinero), toUserId = pagador (envía dinero)
    // En ledger: fromUserId = debitado (pierde), toUserId = acreditado (recibe)
    // → Invertimos: pagador es debitado, cobrador es acreditado
    try {
      const transfer = await this.walletLedgerClient.executeP2PTransfer({
        fromUserId: body.toUserId,
        toUserId: codeResult.fromUserId,
        currency: codeResult.currency,
        amountMinorUnits: codeResult.amountMinorUnits,
        otp: body.otp,
        concept: codeResult.concept,
      });

      // 3. Si fue rechazada por OTP, informar
      if (transfer.status === 'rejected') {
        return {
          success: false,
          reason: transfer.reason,
          requiresOtp: transfer.reason === 'INVALID_OTP',
        };
      }

      // 4. Guardar referencia del ledger
      if (transfer.txId) {
        await this.p2pCodeService.setLedgerTxId(
          codeResult.codeDocId,
          transfer.txId,
        );
      }

      return {
        success: true,
        transfer: {
          txId: transfer.txId,
          correlationId: transfer.correlationId,
          fromAccountNumber: transfer.fromAccountNumber,
          toAccountNumber: transfer.toAccountNumber,
          currency: codeResult.currency,
          amountMinorUnits: codeResult.amountMinorUnits,
          concept: codeResult.concept,
        },
      };
    } catch (error: any) {
      this.logger.error(
        `Transfer execution failed for code ${body.code}: ${error?.message}`,
      );
      throw new BadRequestException(
        error?.response?.data?.message || 'Transfer failed',
      );
    }
  }

  // ─── Request OTP ──────────────────────────────────────────

  /**
   * Solicita OTP antes de confirmar el pago.
   * Wallet-ledger-core genera el OTP y lo envía vía micro-notifications.
   */
  @Post('request-otp')
  async requestOtp(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: RequestOtpDto,
  ) {
    const result = await this.walletLedgerClient.requestP2POtp({
      userId: body.userId,
      email: body.email,
      correlationId: body.correlationId,
    });

    return {
      success: true,
      correlationId: result.correlationId,
      expiresInSeconds: result.expiresInSeconds,
      notification: result.notification,
      // Solo en modo dev — en producción el OTP no se retorna
      ...(result.otp ? { otp: result.otp } : {}),
    };
  }

  // ─── Resolve Code (peek) ──────────────────────────────────

  /**
   * Busca un código P2P por su código de 6 dígitos.
   * Retorna datos del pago SIN consumir el código.
   * Usado cuando el scanner lee un barcode (solo dígitos, no JSON).
   */
  @Post('resolve-code')
  async resolveCode(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: { code: string },
  ) {
    if (!body.code || !/^\d{6}$/.test(body.code)) {
      throw new BadRequestException('code must be a 6-digit string');
    }

    const result = await this.p2pCodeService.resolveCode(body.code);

    if (!result.valid) {
      return { success: false, reason: result.reason };
    }

    return {
      success: true,
      code: body.code,
      fromUserId: result.fromUserId,
      currency: result.currency,
      amountMinorUnits: result.amountMinorUnits,
      concept: result.concept,
      expiresAt: result.expiresAt,
      transferType: result.transferType,
    };
  }

  // ─── Cancel Code ──────────────────────────────────────────

  /**
   * El cobrador cancela un código activo.
   */
  @Post('cancel')
  async cancelCode(
    @Body() body: { code: string; userId: string },
  ) {
    const result = await this.p2pCodeService.cancelCode(
      body.code,
      body.userId,
    );

    return {
      success: result.cancelled,
      ...(result.reason ? { reason: result.reason } : {}),
    };
  }

  // ─── Active Codes ─────────────────────────────────────────

  /**
   * Lista los códigos activos (PENDING) de un usuario.
   */
  @Get('active/:userId')
  async getActiveCodes(@Param('userId') userId: string) {
    const codes = await this.p2pCodeService.getActiveCodes(userId);
    return {
      success: true,
      codes: codes.map((c) => ({
        code: c.code,
        currency: c.currency,
        amountMinorUnits: c.amountMinorUnits,
        concept: c.concept,
        expiresAt: c.expiresAt,
        transferType: c.transferType,
      })),
    };
  }
}

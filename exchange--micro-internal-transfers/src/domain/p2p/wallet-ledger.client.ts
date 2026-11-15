import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// ─── Response types from wallet-ledger-core ─────────────────

export interface P2PTransferResponse {
  status: 'applied' | 'rejected';
  reason?: 'INVALID_OTP' | 'AMOUNT_EXCEEDS_LIMIT' | 'INSUFFICIENT_FUNDS';
  correlationId?: string;
  txId?: string;
  fromAccountNumber?: string;
  toAccountNumber?: string;
}

export interface RequestOtpResponse {
  status: 'created';
  correlationId: string;
  expiresInSeconds: number;
  notification: {
    status: 'skipped' | 'accepted' | 'failed';
    jobId?: string;
    error?: string;
  };
  otp?: string; // Solo en modo dev
}

/**
 * Cliente HTTP para comunicarse con wallet-ledger-core.
 *
 * Este servicio es el ÚNICO punto de contacto con el ledger.
 * Todas las transferencias internas (P2P, QR, DECOPAY) pasan por aquí.
 *
 * Endpoints destino en wallet-ledger-core:
 * - POST /internal/transfers/p2p          → Ejecutar transferencia P2P
 * - POST /internal/transfers/p2p/request-otp → Solicitar OTP pre-transferencia
 */
@Injectable()
export class WalletLedgerClient {
  private readonly logger = new Logger(WalletLedgerClient.name);
  private readonly baseUrl: string;
  private readonly internalToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      configService.get<string>('WALLET_LEDGER_URL') ||
      'http://localhost:9001/api/v1';
    this.internalToken =
      configService.get<string>('INTERNAL_AUTH_TOKEN') || '';
  }

  // ─── P2P Transfer ─────────────────────────────────────────

  /**
   * Ejecuta una transferencia P2P en wallet-ledger-core.
   *
   * Flujo en wallet-ledger:
   * 1. Verifica OTP (si aplica)
   * 2. Valida límite de monto
   * 3. Asegura cuentas + wallets para ambos usuarios
   * 4. Ejecuta ledger entry (débito + crédito atómico)
   */
  async executeP2PTransfer(input: {
    fromUserId: string;
    toUserId: string;
    currency: string;
    amountMinorUnits: string;
    otp?: string;
    correlationId?: string;
    concept?: string;
  }): Promise<P2PTransferResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<P2PTransferResponse>(
          `${this.baseUrl}/internal/transfers/p2p`,
          input,
          {
            headers: {
              Authorization: `Bearer ${this.internalToken}`,
              'x-internal-auth': this.internalToken,
            },
            timeout: 15000,
          },
        ),
      );

      this.logger.log(
        `P2P transfer ${response.data.status}: ${input.fromUserId} → ${input.toUserId} | ${input.currency} ${input.amountMinorUnits}`,
      );

      return response.data;
    } catch (error: any) {
      const errorData = error?.response?.data;
      this.logger.error(
        `P2P transfer failed: ${errorData?.message || error?.message || 'unknown'}`,
      );
      throw error;
    }
  }

  // ─── Request OTP ──────────────────────────────────────────

  /**
   * Solicita generación de OTP para una transferencia P2P.
   * El OTP se envía por email al usuario via micro-notifications.
   */
  async requestP2POtp(input: {
    userId: string;
    email?: string;
    correlationId?: string;
  }): Promise<RequestOtpResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<RequestOtpResponse>(
          `${this.baseUrl}/internal/transfers/p2p/request-otp`,
          input,
          {
            headers: {
              Authorization: `Bearer ${this.internalToken}`,
              'x-internal-auth': this.internalToken,
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log(
        `OTP requested for ${input.userId} — expires in ${response.data.expiresInSeconds}s`,
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        `OTP request failed: ${error?.response?.data?.message || error?.message || 'unknown'}`,
      );
      throw error;
    }
  }
}

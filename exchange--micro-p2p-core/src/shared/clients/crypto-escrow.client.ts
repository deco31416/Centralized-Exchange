import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { EscrowStatus } from '../enums/p2p.enums';

export interface LockCryptoDto {
  userId: string;
  assetCode: string;
  amount: number;
  reference: string;
}

export interface ReleaseEscrowDto {
  escrowId: string;             // holdId en custody-crypto ledger
  orderId: string;
  sellerCustodyAccountId: string; // MongoDB ObjectId de la cuenta del vendedor en custody-crypto
  buyerUserId: string;            // userId del comprador (para ensure account)
  assetCode: string;
  cryptoAmount: number;
}

export interface RefundEscrowDto {
  escrowId: string;
  orderId: string;
}

export interface EscrowResult {
  success: boolean;
  status: EscrowStatus;
  escrowId: string | null;
  custodyAccountId?: string;    // MongoDB ObjectId de la cuenta del vendedor en custody-crypto
  ledgerTxId?: string;
  message?: string;
}

/**
 * CryptoEscrowClient — Integración real con custody-crypto ledger (:9003).
 *
 * Flujo:
 *  lockCrypto   → POST /ledger/accounts/ensure (vendedor) + POST /ledger/holds
 *  releaseCrypto → POST /ledger/accounts/ensure (comprador) + POST /ledger/holds/:id/cancel + POST /ledger/entries
 *  refundCrypto  → POST /ledger/holds/:id/cancel
 *
 * Escala: 1 unidad = 1e8 minor units (8 decimales para BTC/ETH/USDT/USDC/BNB/TON)
 * Si el endpoint falla → EscrowStatus.NOT_AVAILABLE — NUNCA simula éxito.
 */
@Injectable()
export class CryptoEscrowClient {
  private readonly logger = new Logger(CryptoEscrowClient.name);
  private readonly custodyUrl: string;
  private readonly internalToken: string;

  /** Escala de minor units — 8 decimales para todos los assets P2P soportados */
  private static readonly MINOR_SCALE = 1e8;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // custody-crypto NO tiene prefijo global — base URL sin /api/v1
    this.custodyUrl = this.configService.get<string>('services.custodyCrypto') || 'http://localhost:9003';
    this.internalToken = this.configService.get<string>('internalAuthToken') || '';
  }

  private get headers() {
    return {
      'x-internal-auth': this.internalToken,
      Authorization: `Bearer ${this.internalToken}`,
    };
  }

  private toMinorUnits(amount: number): number {
    return Math.round(amount * CryptoEscrowClient.MINOR_SCALE);
  }

  /**
   * Asegura que existe una cuenta de tipo ASSET en el ledger de custody-crypto
   * para un usuario + asset dado. Idempotente.
   */
  private async ensureAccount(userId: string, assetCode: string): Promise<string> {
    const res = await this.httpService.axiosRef.post(
      `${this.custodyUrl}/ledger/accounts/ensure`,
      {
        ownerType: 'user',
        ownerId: userId,
        assetCode,
        accountType: 'asset',
      },
      { headers: this.headers, timeout: 8000 },
    );
    const accountId: string = res.data?._id || res.data?.id;
    if (!accountId) {
      throw new Error(`ensure account did not return an ID for userId=${userId} assetCode=${assetCode}`);
    }
    return accountId;
  }

  async lockCrypto(dto: LockCryptoDto): Promise<EscrowResult> {
    try {
      // 1. Asegurar cuenta del vendedor en custody-crypto
      const accountId = await this.ensureAccount(dto.userId, dto.assetCode);

      // 2. Crear hold sobre esa cuenta
      const amountMinor = this.toMinorUnits(dto.amount);
      const holdRes = await this.httpService.axiosRef.post(
        `${this.custodyUrl}/ledger/holds`,
        {
          accountId,
          amountMinor,
          reason: dto.reference,
          metadata: { userId: dto.userId, assetCode: dto.assetCode, reference: dto.reference },
        },
        { headers: this.headers, timeout: 8000 },
      );

      const holdId: string = holdRes.data?._id || holdRes.data?.id;
      if (!holdId) {
        this.logger.warn(`[EscrowClient] lockCrypto: hold response sin _id | userId=${dto.userId}`);
        return { success: false, status: EscrowStatus.NOT_AVAILABLE, escrowId: null, message: 'Hold endpoint did not return holdId' };
      }

      this.logger.log(
        `[EscrowClient] lockCrypto OK | userId=${dto.userId} | asset=${dto.assetCode} | amount=${dto.amount} | holdId=${holdId} | accountId=${accountId}`,
      );
      return {
        success: true,
        status: EscrowStatus.LOCKED,
        escrowId: holdId,
        custodyAccountId: accountId,
      };
    } catch (err: any) {
      const isInsufficientBalance = err.response?.status === 400 &&
        (err.response?.data?.message || '').toLowerCase().includes('insufficient');

      if (isInsufficientBalance) {
        this.logger.warn(
          `[EscrowClient] lockCrypto: saldo insuficiente en custody | userId=${dto.userId} | asset=${dto.assetCode} | amount=${dto.amount}`,
        );
        return {
          success: false,
          status: EscrowStatus.NOT_AVAILABLE,
          escrowId: null,
          message: `Saldo insuficiente en custody para el asset ${dto.assetCode}`,
        };
      }

      this.logger.warn(
        `[EscrowClient] lockCrypto error | userId=${dto.userId} | asset=${dto.assetCode} | ${err.message}`,
      );
      return {
        success: false,
        status: EscrowStatus.NOT_AVAILABLE,
        escrowId: null,
        message: err.message,
      };
    }
  }

  async releaseCrypto(dto: ReleaseEscrowDto): Promise<EscrowResult> {
    try {
      // 1. Asegurar cuenta del comprador en custody-crypto
      const buyerAccountId = await this.ensureAccount(dto.buyerUserId, dto.assetCode);

      // 2. Cancelar el hold (libera disponible del vendedor temporalmente)
      await this.httpService.axiosRef.post(
        `${this.custodyUrl}/ledger/holds/${dto.escrowId}/cancel`,
        {},
        { headers: this.headers, timeout: 8000 },
      );

      // 3. Journal entry: DEBIT vendedor → CREDIT comprador (transferencia interna)
      const amountMinor = this.toMinorUnits(dto.cryptoAmount);
      const idempotencyKey = `p2p-release-${dto.orderId}`;
      const entryRes = await this.httpService.axiosRef.post(
        `${this.custodyUrl}/ledger/entries`,
        {
          externalIdempotencyKey: idempotencyKey,
          narration: `P2P order release — orderId=${dto.orderId}`,
          correlationId: dto.orderId,
          lines: [
            {
              accountId: dto.sellerCustodyAccountId,
              direction: 'debit',
              amountMinor,
              assetCode: dto.assetCode,
            },
            {
              accountId: buyerAccountId,
              direction: 'credit',
              amountMinor,
              assetCode: dto.assetCode,
            },
          ],
          metadata: { orderId: dto.orderId, type: 'p2p_release' },
        },
        { headers: this.headers, timeout: 10000 },
      );

      const ledgerTxId: string = entryRes.data?._id || entryRes.data?.entryId;
      this.logger.log(
        `[EscrowClient] releaseCrypto OK | escrowId=${dto.escrowId} | orderId=${dto.orderId} | ledgerTxId=${ledgerTxId}`,
      );
      return { success: true, status: EscrowStatus.RELEASED, escrowId: dto.escrowId, ledgerTxId };
    } catch (err: any) {
      this.logger.error(`[EscrowClient] releaseCrypto FAILED | escrowId=${dto.escrowId} | ${err.message}`);
      return {
        success: false,
        status: EscrowStatus.FAILED,
        escrowId: dto.escrowId,
        message: err.message,
      };
    }
  }

  async refundCrypto(dto: RefundEscrowDto): Promise<EscrowResult> {
    try {
      // Cancelar el hold — los fondos quedan disponibles de nuevo para el vendedor
      await this.httpService.axiosRef.post(
        `${this.custodyUrl}/ledger/holds/${dto.escrowId}/cancel`,
        {},
        { headers: this.headers, timeout: 8000 },
      );
      this.logger.log(`[EscrowClient] refundCrypto OK | escrowId=${dto.escrowId} | orderId=${dto.orderId}`);
      return { success: true, status: EscrowStatus.REFUNDED, escrowId: dto.escrowId };
    } catch (err: any) {
      this.logger.error(`[EscrowClient] refundCrypto FAILED | escrowId=${dto.escrowId} | ${err.message}`);
      return {
        success: false,
        status: EscrowStatus.FAILED,
        escrowId: dto.escrowId,
        message: err.message,
      };
    }
  }
}

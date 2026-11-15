import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { FiatSettlementUnavailableException } from '../exceptions/fiat-settlement-unavailable.exception';

export interface FiatBalanceResult {
  availableMinorUnits: string;
  currency: string;
  accountId: string;
}

export interface LockFiatDto {
  buyerUserId: string;
  currency: string;
  /** Monto en minor units (entero BigInt string) */
  amountMinorUnits: string;
  /** ID único de correlación para idempotencia */
  holdCorrelationId: string;
}

export interface LockFiatResult {
  success: boolean;
  holdId: string;
  ledgerTxId: string;
}

export interface ReleaseFiatDto {
  holdId: string;
  sellerUserId: string;
  currency: string;
}

export interface ReleaseFiatResult {
  success: boolean;
  ledgerTxId: string;
}

export interface RefundFiatDto {
  holdId: string;
}

export interface RefundFiatResult {
  success: boolean;
  ledgerTxId: string;
}

/**
 * FiatWalletSettlementClient — Cliente para operaciones de hold/release/refund fiat
 * usando el saldo interno de BlackCEX Wallet (rail INTERNAL_FIAT_WALLET).
 *
 * ⛔ BLOQUEADO — ningún método está operativo.
 *
 * Infraestructura faltante (P2P-FIAT-HOLD-INTEGRATION-001):
 *   - wallet-ledger (:9001) NO implementa lockAvailable / releaseLockedToAccount / refundLocked
 *   - custody-fiat (:9002) es solo webhook ingestion — NO tiene capa de holds fiat
 *
 * Implementación real pendiente:
 *   1. wallet-ledger.LedgerService.lockAvailable(accountId, currency, amountMinorUnits, holdId)
 *      — mueve available → locked, escribe ledger_tx tipo P2P_FIAT_LOCK
 *   2. wallet-ledger.LedgerService.releaseLockedToAccount(holdId, sellerAccountId, currency)
 *      — debita locked del buyer, acredita available del seller, escribe P2P_FIAT_RELEASE
 *   3. wallet-ledger.LedgerService.refundLocked(holdId)
 *      — mueve locked → available del mismo usuario, escribe P2P_FIAT_REFUND
 *
 * getAvailableBalance() SÍ funciona — lee wallet-ledger GET /wallets/user/:userId.
 * Todas las demás operaciones lanzan FiatSettlementUnavailableException (503).
 */
@Injectable()
export class FiatWalletSettlementClient {
  private readonly logger = new Logger(FiatWalletSettlementClient.name);
  private readonly walletLedgerUrl: string;
  private readonly internalToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.walletLedgerUrl =
      this.configService.get<string>('services.walletLedger') || 'http://localhost:9001/api/v1';
    this.internalToken = this.configService.get<string>('internalAuthToken') || '';
  }

  private get headers() {
    return {
      'x-internal-auth': this.internalToken,
      Authorization: `Bearer ${this.internalToken}`,
    };
  }

  /**
   * Obtiene el saldo fiat disponible de un usuario en wallet-ledger.
   * Esta operación SÍ está disponible — es una lectura de wallet-ledger.
   */
  async getAvailableBalance(userId: string, currency: string): Promise<FiatBalanceResult | null> {
    try {
      const url = `${this.walletLedgerUrl}/internal/wallets/user/${userId}`;
      const resp = await this.httpService.axiosRef.get<{ wallets: { currency: string; availableMinorUnits: string; accountId: string }[] }>(
        url,
        { headers: this.headers },
      );
      const wallet = resp.data.wallets?.find((w) => w.currency === currency);
      if (!wallet) return null;
      return {
        availableMinorUnits: wallet.availableMinorUnits,
        currency: wallet.currency,
        accountId: wallet.accountId,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`[FiatWalletSettlement] getAvailableBalance failed: ${message}`);
      return null;
    }
  }

  /**
   * Bloquea (hold) fiat del comprador para una orden P2P.
   *
   * ⛔ NO IMPLEMENTADO — lanza FiatSettlementUnavailableException (503)
   * Requiere: wallet-ledger.LedgerService.lockAvailable()
   */
  async lockFiat(_dto: LockFiatDto): Promise<LockFiatResult> {
    this.logger.error('[FiatWalletSettlement] lockFiat() invocado pero no implementado en wallet-ledger');
    throw new FiatSettlementUnavailableException('lockFiat');
  }

  /**
   * Libera el fiat bloqueado al vendedor al completar la orden.
   *
   * ⛔ NO IMPLEMENTADO — lanza FiatSettlementUnavailableException (503)
   * Requiere: wallet-ledger.LedgerService.releaseLockedToAccount()
   */
  async releaseFiatToSeller(_dto: ReleaseFiatDto): Promise<ReleaseFiatResult> {
    this.logger.error('[FiatWalletSettlement] releaseFiatToSeller() invocado pero no implementado en wallet-ledger');
    throw new FiatSettlementUnavailableException('releaseFiatToSeller');
  }

  /**
   * Devuelve al comprador el fiat bloqueado al cancelar/rechazar la orden.
   *
   * ⛔ NO IMPLEMENTADO — lanza FiatSettlementUnavailableException (503)
   * Requiere: wallet-ledger.LedgerService.refundLocked()
   */
  async refundFiatToBuyer(_dto: RefundFiatDto): Promise<RefundFiatResult> {
    this.logger.error('[FiatWalletSettlement] refundFiatToBuyer() invocado pero no implementado en wallet-ledger');
    throw new FiatSettlementUnavailableException('refundFiatToBuyer');
  }
}

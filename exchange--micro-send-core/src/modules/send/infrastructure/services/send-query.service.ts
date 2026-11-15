import { Injectable, Logger } from '@nestjs/common';
import { BaseHttpClientService } from './base-http-client.service';
import { BeneficiaryService } from './beneficiary.service';
import { WalletLedgerClient } from '../clients/wallet-ledger.client';
import { AuthClient } from '../clients/auth.client';

@Injectable()
export class SendQueryService {
  private readonly logger = new Logger(SendQueryService.name);

  constructor(
    private readonly walletLedgerClient: WalletLedgerClient,
    private readonly authClient: AuthClient,
    private readonly beneficiaryService: BeneficiaryService,
  ) {}

  private get authBaseUrl(): string {
    return (
      this.authClient['configService'].get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:7000/api/v1'
    );
  }

  /**
   * Obtiene la wallet principal del usuario desde wallet-ledger.
   * Mapea al formato SourceWallet que espera el dashboard.
   */
  async getWalletSource(userId: string) {
    const wallets = await this.walletLedgerClient.getUserWallets(userId);
    const primary = Array.isArray(wallets) && wallets.length > 0 ? wallets[0] : null;
    if (!primary) return null;

    return {
      id: primary.walletId,
      name: primary.currency,
      balance: parseFloat(primary.availableFormatted) || 0,
      currency: primary.currency,
    };
  }

  /**
   * Obtiene las wallets destino disponibles desde wallet-ledger.
   * Mapea al formato WalletDestination que espera el dashboard.
   */
  async getWalletDestinations(userId: string) {
    const wallets = await this.walletLedgerClient.getUserWallets(userId);
    return (Array.isArray(wallets) ? wallets : []).map((w, index) => ({
      id: index + 1,
      name: w.currency,
      balance: parseFloat(w.availableFormatted) || 0,
      currency: w.currency,
      destinationWalletId: w.walletId,
    }));
  }

  /**
   * Obtiene las cuentas bancarias registradas del usuario.
   */
  async getBankAccounts(userId: string) {
    return this.beneficiaryService.getBankAccounts(userId);
  }

  /**
   * Busca cuentas bancarias por alias, nombre de beneficiario o número de cuenta.
   */
  async searchBankAccounts(userId: string, query: string) {
    return this.beneficiaryService.searchBankAccounts(userId, query);
  }

  /**
   * Obtiene las cuentas SPEI registradas del usuario.
   */
  async getSpeiAccounts(userId: string) {
    return this.beneficiaryService.getSpeiAccounts(userId);
  }

  /**
   * Lista usuarios DECOX para envíos P2P.
   *
   * TEMPORAL DEFENSIVE PATCH — backend gap remains.
   * El endpoint GET /internal/users NO existe en micro-auth.
   * Solo existe /internal/users/search?q= (búsqueda por query).
   * La lista inicial de usuarios DECOX queda deshabilitada hasta que
   * micro-auth implemente un endpoint GET /internal/users paginado.
   *
   * NO conectado. NO integrado. Retorna vacío de forma explícita.
   */
  async getdecoUsers(userId: string) {
    this.logger.warn(
      `getdecoUsers called for userId=${userId} — BACKEND GAP: GET /internal/users not implemented in micro-auth. Returning empty list until endpoint exists.`,
    );
    return [];
  }

  /**
   * Busca usuarios DECOX por query, delegando a auth service.
   */
  async searchdecoUsers(userId: string, query: string) {
    const result = await this.authClient['request']<{ data: unknown[] }>({
      baseUrl: this.authBaseUrl,
      path: `/internal/users/search?q=${encodeURIComponent(query)}`,
      source: 'auth',
      headers: this.authClient['buildInternalHeaders']({ 'x-user-id': userId }),
      allow404: true,
    });

    return result?.data ?? [];
  }
}

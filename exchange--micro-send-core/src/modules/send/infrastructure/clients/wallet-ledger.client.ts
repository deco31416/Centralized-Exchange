import { Injectable, Logger } from '@nestjs/common';
import { BaseHttpClientService } from '../services/base-http-client.service';

export interface WalletBalance {
  walletId: string;
  accountId: string;
  accountNumber?: string;
  currency: string;
  availableMinorUnits: string;
  lockedMinorUnits: string;
  availableFormatted: string;
  lockedFormatted: string;
  status: string;
}

@Injectable()
export class WalletLedgerClient extends BaseHttpClientService {
  private readonly log = new Logger(WalletLedgerClient.name);

  private get baseUrl(): string {
    return (
      this.configService.get<string>('WALLET_LEDGER_SERVICE_URL') ||
      'http://localhost:9001/api/v1'
    );
  }

  async getUserWallets(userId: string): Promise<WalletBalance[]> {
    const result = await this.request<{ balances: WalletBalance[] }>({
      baseUrl: this.baseUrl,
      path: `/internal/wallets/user/${userId}`,
      source: 'wallet-ledger',
      headers: this.buildInternalHeaders({ 'x-user-id': userId }),
      allow404: true,
    });

    return result?.balances ?? [];
  }
}

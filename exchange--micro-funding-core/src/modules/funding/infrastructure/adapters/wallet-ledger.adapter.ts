import { Injectable, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type {
  CreditWalletPayload,
  CreditWalletResult,
  WalletLedgerPort,
} from '../../application/ports/wallet-ledger.port';

@Injectable()
export class WalletLedgerAdapter implements WalletLedgerPort {
  private readonly baseUrl = process.env.WALLET_LEDGER_SERVICE_URL;

  constructor(private readonly http: HttpService) {}

  async creditWallet(payload: CreditWalletPayload): Promise<CreditWalletResult> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/wallet/credit`, payload, {
          headers: this.headers(),
        }),
      );

      return response.data;
    } catch (error) {
      throw new BadGatewayException(
        'No fue posible acreditar el saldo en wallet-ledger',
      );
    }
  }

  private headers() {
    return {
      Authorization: `Bearer ${process.env.INTERNAL_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }
}
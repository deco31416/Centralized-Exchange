import { Inject, Injectable } from '@nestjs/common';
import { AUTH_CLIENT } from '../../domain/ports/auth-client.port';
import type { AuthClientPort } from '../../domain/ports/auth-client.port';
import { WALLET_LEDGER_CLIENT } from '../../domain/ports/wallet-ledger-client.port';
import type { WalletLedgerClientPort } from '../../domain/ports/wallet-ledger-client.port';

@Injectable()
export class GetRemittanceSummaryUseCase {
  constructor(
    @Inject(AUTH_CLIENT)
    private readonly authClient: AuthClientPort,
    @Inject(WALLET_LEDGER_CLIENT)
    private readonly walletLedgerClient: WalletLedgerClientPort,
  ) {}

  async execute(userId: string) {
    const user = await this.authClient.validateUser(userId);
    const wallet = await this.walletLedgerClient.getSummary(userId);

    return {
      user,
      wallet,
    };
  }
}
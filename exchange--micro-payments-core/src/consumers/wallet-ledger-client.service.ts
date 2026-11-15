import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FiatDepositConfirmedEvent } from '../domain/payment-events.types';

@Injectable()
export class WalletLedgerClient {
  private readonly logger = new Logger(WalletLedgerClient.name);
  private readonly baseUrl: string;
  private readonly internalAuthToken: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = configService.get<string>('WALLET_LEDGER_CORE_URL') ?? 'http://localhost:9001/api/v1';
    const internalAuthToken = configService.get<string>('INTERNAL_AUTH_TOKEN');
    if (!internalAuthToken) {
      throw new Error('INTERNAL_AUTH_TOKEN is required');
    }
    this.internalAuthToken = internalAuthToken;
  }

  /**
   * Envía evento FIAT_DEPOSIT_CONFIRMED a wallet-ledger-core
   */
  async notifyDepositConfirmed(event: FiatDepositConfirmedEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/internal/ledger/fiat-deposit-confirmed`,
        event.payload,
        {
          headers: {
            'x-internal-auth': this.internalAuthToken,
            'content-type': 'application/json',
          },
          timeout: 10000,
        },
      );

      this.logger.log(`Notified wallet-ledger-core: deposit ${event.payload.eventId} → ${response.data.status}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(
        `Failed to notify wallet-ledger-core: ${error?.response?.data?.message ?? error?.message ?? String(error)}`,
      );
      return { success: false, error: error?.message ?? 'unknown_error' };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Cliente HTTP para wallet-ledger-core.
 *
 * Endpoints usados:
 *  - POST /internal/transfers/p2p/request-otp → Solicitar OTP email
 *  - POST /internal/transfers/p2p             → Ejecutar transferencia P2P
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

  private headers() {
    return {
      Authorization: `Bearer ${this.internalToken}`,
      'x-internal-auth': this.internalToken,
    };
  }

  /** Solicitar OTP por email para un usuario antes de la transferencia. */
  async requestOtp(input: {
    userId: string;
    email?: string;
    correlationId?: string;
  }): Promise<{
    status: string;
    correlationId: string;
    expiresInSeconds: number;
    otp?: string; // solo en dev mode
  }> {
    const res = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/internal/transfers/p2p/request-otp`,
        input,
        { headers: this.headers(), timeout: 10000 },
      ),
    );
    return res.data;
  }

  /** Ejecutar transferencia P2P en el ledger. */
  async executeP2PTransfer(input: {
    fromUserId: string;
    toUserId: string;
    currency: string;
    amountMinorUnits: string;
    otp?: string;
    correlationId?: string;
    concept?: string;
  }): Promise<{
    status: 'applied' | 'rejected';
    reason?: string;
    correlationId?: string;
    txId?: string;
    fromAccountNumber?: string;
    toAccountNumber?: string;
  }> {
    const res = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/internal/transfers/p2p`,
        input,
        { headers: this.headers(), timeout: 15000 },
      ),
    );
    return res.data;
  }
}

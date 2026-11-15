import { Injectable } from '@nestjs/common';
import { InternalTransfersPort } from '../../application/ports/internal-transfers.port';
import { BaseHttpClientService } from '../services/base-http-client.service';

@Injectable()
export class InternalTransfersClient
  extends BaseHttpClientService
  implements InternalTransfersPort
{
  async quotedeco(payload: {
    userId: string;
    destinationUserId: string;
    amount: number;
    currency: string;
    sourceWalletId?: string;
    reference?: string;
    otpCode?: string;
  }): Promise<{ fee: number; totalDebit: number; estimatedDelivery: string }> {
    const feeRate = this.configService.get<number>('SEND_deco_FEE_RATE') ?? 0.01;
    const fee = this.feeFromRate(payload.amount, feeRate);

    return {
      fee,
      totalDebit: Number((payload.amount + fee).toFixed(2)),
      estimatedDelivery: 'immediate',
    };
  }

  async executedeco(payload: {
    userId: string;
    destinationUserId: string;
    amount: number;
    currency: string;
    sourceWalletId?: string;
    reference?: string;
    otpCode?: string;
  }): Promise<{
    operationId: string;
    providerReference: string;
    executedAt: string;
    message: string;
  }> {
    const baseUrl =
      this.configService.get<string>('WALLET_LEDGER_SERVICE_URL') ||
      'http://localhost:9001/api/v1';
    const path =
      this.configService.get<string>('deco_EXECUTE_PATH') ||
      '/internal/transfers/p2p';

    const minorUnitsFactor =
      this.configService.get<number>('MONEY_MINOR_UNITS_FACTOR') ?? 100;

    const response = await this.request<{
      status: 'applied' | 'rejected';
      reason?: string;
      txId?: string;
      correlationId?: string;
    }>({
      baseUrl,
      path,
      method: 'POST',
      source: 'wallet-ledger',
      headers: this.buildInternalHeaders(),
      data: {
        fromUserId: payload.userId,
        toUserId: payload.destinationUserId,
        currency: payload.currency,
        amountMinorUnits: Math.round(payload.amount * minorUnitsFactor).toString(),
        otp: payload.otpCode,
        concept: payload.reference,
      },
    });

    return {
      operationId: response?.txId || response?.correlationId || `DECOX-${Date.now()}`,
      providerReference: response?.correlationId || response?.txId || `DECOX-${Date.now()}`,
      executedAt: new Date().toISOString(),
      message:
        response?.status === 'applied'
          ? `DECOX transfer executed for ${payload.destinationUserId}`
          : response?.reason || 'DECOX transfer rejected',
    };
  }

  async quoteWallet(payload: {
    userId: string;
    destinationWalletId: string;
    amount: number;
    currency: string;
    sourceWalletId?: string;
    reference?: string;
    otpCode?: string;
  }): Promise<{ fee: number; totalDebit: number; estimatedDelivery: string }> {
    const feeRate = this.configService.get<number>('SEND_WALLET_FEE_RATE') ?? 0.005;
    const fee = this.feeFromRate(payload.amount, feeRate);

    return {
      fee,
      totalDebit: Number((payload.amount + fee).toFixed(2)),
      estimatedDelivery: 'immediate',
    };
  }

  async executeWallet(payload: {
    userId: string;
    destinationWalletId: string;
    amount: number;
    currency: string;
    sourceWalletId?: string;
    reference?: string;
    otpCode?: string;
  }): Promise<{
    operationId: string;
    providerReference: string;
    executedAt: string;
    message: string;
  }> {
    const baseUrl =
      this.configService.get<string>('INTERNAL_TRANSFERS_SERVICE_URL') ||
      'http://localhost:3006/api/v1';
    const path =
      this.configService.get<string>('WALLET_EXECUTE_PATH') ||
      '/internal/wallet/transfers';

    const response = await this.request<{
      operationId?: string;
      providerReference?: string;
      message?: string;
      executedAt?: string;
    }>({
      baseUrl,
      path,
      method: 'POST',
      source: 'internal-transfers',
      headers: this.buildInternalHeaders(),
      data: {
        userId: payload.userId,
        destinationWalletId: payload.destinationWalletId,
        amount: payload.amount,
        currency: payload.currency,
        sourceWalletId: payload.sourceWalletId,
        reference: payload.reference,
        otpCode: payload.otpCode,
      },
    });

    return {
      operationId: response?.operationId || `wallet-${Date.now()}`,
      providerReference:
        response?.providerReference || response?.operationId || `wallet-${Date.now()}`,
      executedAt: response?.executedAt || new Date().toISOString(),
      message:
        response?.message ||
        `Wallet transfer executed to ${payload.destinationWalletId}`,
    };
  }
}
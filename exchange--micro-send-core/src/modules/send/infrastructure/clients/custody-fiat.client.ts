import { Injectable } from '@nestjs/common';
import { CustodyFiatPort } from '../../application/ports/custody-fiat.port';
import { BaseHttpClientService } from '../services/base-http-client.service';

@Injectable()
export class CustodyFiatClient
  extends BaseHttpClientService
  implements CustodyFiatPort
{
  async quoteBank(payload: {
    userId: string;
    bankCode: string;
    accountNumber: string;
    beneficiaryName: string;
    accountType?: string;
    amount: number;
    currency: string;
    sourceWalletId?: string;
    reference?: string;
    otpCode?: string;
  }): Promise<{
    fee: number;
    totalDebit: number;
    estimatedDelivery: string;
  }> {
    const feeRate = this.configService.get<number>('SEND_BANK_FEE_RATE') ?? 0.015;
    const fee = this.feeFromRate(payload.amount, feeRate);

    return {
      fee,
      totalDebit: Number((payload.amount + fee).toFixed(2)),
      estimatedDelivery: 'same-day',
    };
  }

  async executeBank(payload: {
    userId: string;
    bankCode: string;
    accountNumber: string;
    beneficiaryName: string;
    accountType?: string;
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
      this.configService.get<string>('PAYMENTS_SERVICE_URL') ||
      'http://localhost:9000/api/v1';
    const path =
      this.configService.get<string>('BANK_TRANSFER_PATH') ||
      '/bank-transfers';

    const response = await this.request<{
      operationId?: string;
      providerReference?: string;
      message?: string;
      executedAt?: string;
      id?: string;
      reference?: string;
    }>({
      baseUrl,
      path,
      method: 'POST',
      source: 'payments',
      headers: this.buildInternalHeaders(),
      data: {
        userId: payload.userId,
        bankCode: payload.bankCode,
        accountNumber: payload.accountNumber,
        beneficiaryName: payload.beneficiaryName,
        accountType: payload.accountType,
        amount: payload.amount,
        currency: payload.currency,
        sourceWalletId: payload.sourceWalletId,
        reference: payload.reference,
        otpCode: payload.otpCode,
      },
    });

    return {
      operationId: response?.operationId || response?.id || `bank-${Date.now()}`,
      providerReference:
        response?.providerReference || response?.reference || response?.id || `bank-${Date.now()}`,
      executedAt: response?.executedAt || new Date().toISOString(),
      message:
        response?.message || `Bank transfer executed to ${payload.accountNumber}`,
    };
  }

  async quoteSpei(payload: {
    userId: string;
    bankCode: string;
    clabe: string;
    beneficiaryName: string;
    concept?: string;
    amount: number;
    currency: string;
    sourceWalletId?: string;
    reference?: string;
    otpCode?: string;
  }): Promise<{
    fee: number;
    totalDebit: number;
    estimatedDelivery: string;
  }> {
    const feeRate = this.configService.get<number>('SEND_SPEI_FEE_RATE') ?? 0.012;
    const fee = this.feeFromRate(payload.amount, feeRate);

    return {
      fee,
      totalDebit: Number((payload.amount + fee).toFixed(2)),
      estimatedDelivery: 'minutes',
    };
  }

  async executeSpei(payload: {
    userId: string;
    bankCode: string;
    clabe: string;
    beneficiaryName: string;
    concept?: string;
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
      this.configService.get<string>('PAYMENTS_SERVICE_URL') ||
      'http://localhost:9000/api/v1';
    const path =
      this.configService.get<string>('SPEI_PAYMENT_ORDERS_PATH') ||
      '/spei/stp/payment-orders';

    const response = await this.request<{
      success?: boolean;
      claveRastreo?: string;
      stpTransactionId?: number;
      timestamp?: string;
      error?: { message?: string };
    }>({
      baseUrl,
      path,
      method: 'POST',
      source: 'payments',
      headers: this.buildInternalHeaders(),
      data: {
        nombreOrdenante:
          this.configService.get<string>('SPEI_ORDENANTE_NAME') || 'DECO EXCHANGE',
        cuentaOrdenante:
          this.configService.get<string>('SPEI_ORDENANTE_ACCOUNT') ||
          '000000000000000000',
        institucionOrdenante:
          this.configService.get<string>('SPEI_ORDENANTE_BANK') || '90646',
        nombreBeneficiario: payload.beneficiaryName,
        cuentaBeneficiario: payload.clabe,
        institucionBeneficiario: payload.bankCode,
        monto: payload.amount,
        concepto: payload.concept || payload.reference || 'SPEI transfer',
        referenciaNumerica: payload.reference,
      },
    });

    return {
      operationId:
        response?.claveRastreo ||
        String(response?.stpTransactionId || `spei-${Date.now()}`),
      providerReference:
        response?.claveRastreo ||
        String(response?.stpTransactionId || `spei-${Date.now()}`),
      executedAt: response?.timestamp || new Date().toISOString(),
      message:
        response?.success === false
          ? response?.error?.message || `SPEI transfer rejected for ${payload.clabe}`
          : `SPEI transfer executed to ${payload.clabe}`,
    };
  }
}
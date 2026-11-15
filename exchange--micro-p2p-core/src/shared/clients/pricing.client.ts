import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

export interface ConversionResult {
  success: boolean;
  rate: number;
  converted: number;
  message?: string;
}

export interface FeeResult {
  feeAmount: number;
  feeAsset: string;
  feeRate: number;
  feeSource: string;
}

@Injectable()
export class PricingClient {
  private readonly logger = new Logger(PricingClient.name);
  private readonly aggregatorUrl: string;
  private readonly internalToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aggregatorUrl = this.configService.get<string>('services.pricingAggregator') || 'http://localhost:3013/api/v1';
    this.internalToken = this.configService.get<string>('internalAuthToken') || '';
  }

  async getConversion(from: string, to: string, amount: number): Promise<ConversionResult> {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.aggregatorUrl}/prices/convert/${from}/${to}`,
        {
          params: { amount },
          headers: { 'x-internal-auth': this.internalToken },
          timeout: 5000,
        },
      );
      const data = response.data;
      return {
        success: true,
        rate: data.rate || data.price || 0,
        converted: data.converted || data.result || 0,
      };
    } catch (err: any) {
      this.logger.error(`[PricingClient] Conversion failed | ${from}→${to} | amount=${amount} | ${err.message}`);
      return { success: false, rate: 0, converted: 0, message: err.message };
    }
  }

  /**
   * P2P-FEES-ADMIN-001: Fee schedules para P2P no están configurados todavía.
   * En Fase 1: fee = 0 con feeSource='not_configured'.
   * Registrar deuda técnica para configurar via admin panel.
   */
  async getP2PFee(assetCode: string, _cryptoAmount: number): Promise<FeeResult> {
    this.logger.warn(
      `[PricingClient] P2P fee schedule no configurado — fee=0% para MVP | P2P-FEES-ADMIN-001 | asset=${assetCode}`,
    );
    return {
      feeAmount: 0,
      feeAsset: assetCode,
      feeRate: 0,
      feeSource: 'not_configured',
    };
  }
}

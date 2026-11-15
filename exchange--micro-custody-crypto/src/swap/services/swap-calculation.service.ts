import { Injectable, BadRequestException } from '@nestjs/common';

interface CalculateSwapParams {
  fromAsset: string;
  toAsset: string;
  fromAmount?: number;
  toAmount?: number;
  rate: number;
}

interface SwapCalculationResult {
  fromAmount: number;
  toAmount: number;
  rate: number;
}

/**
 * Service responsible for swap amount calculations.
 * Handles both direct (fromAmount known) and inverse (toAmount known) swaps.
 */
@Injectable()
export class SwapCalculationService {
  /**
   * Calculate swap amounts based on rate and input amount.
   */
  calculateSwap(params: CalculateSwapParams): SwapCalculationResult {
    const { fromAmount, toAmount, rate } = params;

    if (!fromAmount && !toAmount) {
      throw new BadRequestException(
        'Must specify either fromAmount or toAmount',
      );
    }

    if (fromAmount && toAmount) {
      throw new BadRequestException(
        'Cannot specify both fromAmount and toAmount',
      );
    }

    if (rate <= 0) {
      throw new BadRequestException('Invalid rate');
    }

    // Case 1: User specifies how much they want to GIVE (fromAmount)
    if (fromAmount !== undefined) {
      const calculatedToAmount = this.roundToDecimals(fromAmount / rate, 8);
      return {
        fromAmount,
        toAmount: calculatedToAmount,
        rate,
      };
    }

    // Case 2: User specifies how much they want to RECEIVE (toAmount)
    if (toAmount !== undefined) {
      const calculatedFromAmount = this.roundToDecimals(toAmount * rate, 8);
      return {
        fromAmount: calculatedFromAmount,
        toAmount,
        rate,
      };
    }

    throw new BadRequestException('Invalid swap calculation parameters');
  }

  /**
   * Convert amount to minor units (cents, satoshis, etc.)
   * For crypto: 8 decimals, for fiat: 2 decimals
   */
  toMinorUnits(amount: number, assetCode: string): number {
    const decimals = this.getAssetDecimals(assetCode);
    return Math.round(amount * Math.pow(10, decimals));
  }

  /**
   * Convert from minor units to major units
   */
  fromMinorUnits(amountMinor: number, assetCode: string): number {
    const decimals = this.getAssetDecimals(assetCode);
    return amountMinor / Math.pow(10, decimals);
  }

  /**
   * Get number of decimals for an asset
   */
  private getAssetDecimals(assetCode: string): number {
    const cryptoAssets = ['BTC', 'ETH', 'USDT', 'USDC'];
    return cryptoAssets.includes(assetCode.toUpperCase()) ? 8 : 2;
  }

  /**
   * Round to specific number of decimal places
   */
  private roundToDecimals(value: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Validate amounts are within acceptable range
   */
  validateAmounts(fromAmount: number, toAmount: number): void {
    if (fromAmount <= 0) {
      throw new BadRequestException('fromAmount must be greater than 0');
    }
    if (toAmount <= 0) {
      throw new BadRequestException('toAmount must be greater than 0');
    }
  }
}

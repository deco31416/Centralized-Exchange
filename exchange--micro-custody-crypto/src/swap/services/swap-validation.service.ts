import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SwapLimit } from '../models/swap-limit.schema';
import { PlatformReserve } from '../models/platform-reserve.schema';
import { BalanceService } from '../../ledger/services/balance.service';
import { AccountService } from '../../ledger/services/account.service';

interface SwapValidationParams {
  userId: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  toAmount: number;
}

/**
 * Service responsible for validating swap requests before execution.
 * Checks balance, limits, reserves, and business rules.
 */
@Injectable()
export class SwapValidationService {
  constructor(
    @InjectModel(SwapLimit.name) private swapLimitModel: Model<SwapLimit>,
    @InjectModel(PlatformReserve.name)
    private platformReserveModel: Model<PlatformReserve>,
    private balanceService: BalanceService,
    private accountService: AccountService,
  ) {}

  /**
   * Validate all pre-conditions for a swap.
   */
  async validateSwap(params: SwapValidationParams): Promise<void> {
    await this.validateAssets(params.fromAsset, params.toAsset);
    await this.validateUserBalance(
      params.userId,
      params.fromAsset,
      params.fromAmount,
    );
    await this.validateDailyLimit(
      params.userId,
      params.fromAsset,
      params.toAsset,
      params.fromAmount,
    );
    await this.validatePlatformReserves(params.toAsset, params.toAmount);
  }

  /**
   * Validate that assets are different.
   */
  private async validateAssets(
    fromAsset: string,
    toAsset: string,
  ): Promise<void> {
    if (fromAsset === toAsset) {
      throw new BadRequestException('Cannot swap same asset');
    }
  }

  /**
   * Validate that user has sufficient balance in fromAsset.
   */
  private async validateUserBalance(
    userId: string,
    assetCode: string,
    amount: number,
  ): Promise<void> {
    // First, get the account
    const account = await this.accountService.findAccountByOwnerAndAsset({
      ownerId: userId,
      assetCode,
    });

    if (!account) {
      throw new BadRequestException(`No account found for asset: ${assetCode}`);
    }

    const balance = await this.balanceService.getAccountBalance({
      accountId: String(account._id),
      assetCode,
    });

    const amountMinor = this.toMinorUnits(amount, assetCode);

    if (balance.availableMinor < amountMinor) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${this.fromMinorUnits(balance.availableMinor, assetCode)}, Required: ${amount}`,
      );
    }
  }

  /**
   * Convert amount to minor units
   */
  private toMinorUnits(amount: number, assetCode: string): number {
    const decimals = this.getAssetDecimals(assetCode);
    return Math.round(amount * Math.pow(10, decimals));
  }

  /**
   * Convert from minor units
   */
  private fromMinorUnits(amountMinor: number, assetCode: string): number {
    const decimals = this.getAssetDecimals(assetCode);
    return amountMinor / Math.pow(10, decimals);
  }

  /**
   * Get asset decimals
   */
  private getAssetDecimals(assetCode: string): number {
    const cryptoAssets = ['BTC', 'ETH', 'USDT', 'USDC'];
    return cryptoAssets.includes(assetCode.toUpperCase()) ? 8 : 2;
  }

  /**
   * Validate daily swap limit for user.
   */
  private async validateDailyLimit(
    userId: string,
    fromAsset: string,
    toAsset: string,
    amount: number,
  ): Promise<void> {
    const assetPair = `${fromAsset}/${toAsset}`;
    const today = this.getStartOfDay(new Date());

    let limit = await this.swapLimitModel.findOne({ userId, assetPair }).exec();

    if (!limit) {
      // Create default limit for new user/pair
      limit = new this.swapLimitModel({
        userId,
        assetPair,
        dailyLimit: 10000, // Default $10k equivalent
        dailyUsed: 0,
        lastResetDate: today,
      });
      await limit.save();
    }

    // Reset if new day
    if (limit.lastResetDate < today) {
      limit.dailyUsed = 0;
      limit.lastResetDate = today;
      await limit.save();
    }

    const newUsed = limit.dailyUsed + amount;
    if (newUsed > limit.dailyLimit) {
      throw new BadRequestException(
        `Daily limit exceeded. Limit: ${limit.dailyLimit}, Used: ${limit.dailyUsed}, Requested: ${amount}`,
      );
    }
  }

  /**
   * Validate that platform has sufficient reserves to fulfill swap.
   */
  private async validatePlatformReserves(
    assetCode: string,
    amount: number,
  ): Promise<void> {
    const reserve = await this.platformReserveModel
      .findOne({ assetCode })
      .exec();

    if (!reserve) {
      throw new NotFoundException(
        `Platform reserve not found for asset: ${assetCode}`,
      );
    }

    if (reserve.virtualBalance < amount) {
      throw new BadRequestException(
        `Insufficient platform reserves for ${assetCode}. Available: ${reserve.virtualBalance}, Required: ${amount}`,
      );
    }

    // Check exposure limit
    const newExposure = reserve.virtualBalance - amount;
    if (Math.abs(newExposure) > reserve.exposureLimit) {
      throw new BadRequestException(
        `Platform exposure limit would be exceeded for ${assetCode}`,
      );
    }
  }

  /**
   * Update daily usage after successful swap.
   */
  async updateDailyUsage(
    userId: string,
    fromAsset: string,
    toAsset: string,
    amount: number,
  ): Promise<void> {
    const assetPair = `${fromAsset}/${toAsset}`;
    const limit = await this.swapLimitModel
      .findOne({ userId, assetPair })
      .exec();

    if (limit) {
      limit.dailyUsed += amount;
      await limit.save();
    }
  }

  private getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }
}

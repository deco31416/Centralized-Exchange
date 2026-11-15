import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformReserve } from '../models/platform-reserve.schema';

/**
 * Service for managing platform virtual reserves.
 * Tracks virtual balances, real balances, and coverage ratios.
 */
@Injectable()
export class PlatformReservesService {
  constructor(
    @InjectModel(PlatformReserve.name)
    private platformReserveModel: Model<PlatformReserve>,
  ) {}

  /**
   * Get reserve information for an asset.
   */
  async getReserve(assetCode: string): Promise<PlatformReserve> {
    const reserve = await this.platformReserveModel
      .findOne({ assetCode })
      .exec();

    if (!reserve) {
      throw new NotFoundException(
        `Platform reserve not found for asset: ${assetCode}`,
      );
    }

    return reserve;
  }

  /**
   * Get all platform reserves.
   */
  async getAllReserves(): Promise<PlatformReserve[]> {
    return this.platformReserveModel.find().exec();
  }

  /**
   * Create or initialize reserve for an asset.
   */
  async createReserve(params: {
    assetCode: string;
    virtualBalance: number;
    realBalance: number;
    exposureLimit: number;
  }): Promise<PlatformReserve> {
    const existing = await this.platformReserveModel
      .findOne({ assetCode: params.assetCode })
      .exec();

    if (existing) {
      return existing;
    }

    const reserve = new this.platformReserveModel({
      assetCode: params.assetCode,
      virtualBalance: params.virtualBalance,
      realBalance: params.realBalance,
      exposureLimit: params.exposureLimit,
      lastUpdated: new Date(),
    });

    await reserve.save();
    return reserve;
  }

  /**
   * Update virtual balance after swap execution.
   * This is called after ledger entry is posted.
   */
  async updateVirtualBalance(assetCode: string, delta: number): Promise<void> {
    const reserve = await this.getReserve(assetCode);
    reserve.virtualBalance += delta;
    reserve.lastUpdated = new Date();
    await reserve.save();
  }

  /**
   * Update real balance when deposits/withdrawals occur.
   */
  async updateRealBalance(
    assetCode: string,
    newRealBalance: number,
  ): Promise<void> {
    const reserve = await this.getReserve(assetCode);
    reserve.realBalance = newRealBalance;
    reserve.lastUpdated = new Date();
    await reserve.save();
  }

  /**
   * Get coverage ratio for an asset (virtual/real).
   * Should be >= 1.0 for healthy reserves.
   */
  async getCoverageRatio(assetCode: string): Promise<number> {
    const reserve = await this.getReserve(assetCode);
    return reserve.coverage || 0;
  }

  /**
   * Get current exposure for an asset.
   * Positive = platform owes users, Negative = users owe platform
   */
  async getExposure(assetCode: string): Promise<number> {
    const reserve = await this.getReserve(assetCode);
    return reserve.virtualBalance - reserve.realBalance;
  }

  /**
   * Check if asset has sufficient reserves for a withdrawal amount.
   */
  async hasSufficientReserves(
    assetCode: string,
    amount: number,
  ): Promise<boolean> {
    const reserve = await this.getReserve(assetCode);
    return reserve.virtualBalance >= amount;
  }
}

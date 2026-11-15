import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustodyWallet } from '../models/custody-wallet.schema';
import { SupportedBlockchain } from '../models/user-address.schema';

/**
 * Service for managing hot wallet custody and limits
 */
@Injectable()
export class CustodyService {
  private readonly logger = new Logger(CustodyService.name);

  constructor(
    @InjectModel(CustodyWallet.name)
    private readonly custodyWalletModel: Model<CustodyWallet>,
  ) {}

  /**
   * Get custody wallet for an asset
   */
  async getWallet(assetCode: string): Promise<CustodyWallet> {
    const wallet = await this.custodyWalletModel.findOne({ assetCode, isActive: true });

    if (!wallet) {
      throw new NotFoundException(`Custody wallet not found for ${assetCode}`);
    }

    return wallet;
  }

  /**
   * Get all custody wallets
   */
  async getAllWallets(): Promise<CustodyWallet[]> {
    return this.custodyWalletModel.find({ isActive: true });
  }

  /**
   * Create a new custody wallet
   */
  async createWallet(params: {
    assetCode: string;
    blockchain: SupportedBlockchain;
    mainAddress: string;
    maxWithdrawalPerTx: number;
    maxWithdrawalPerHour: number;
    maxWithdrawalPerDay: number;
    minOperationalBalance: number;
    alertThresholdPercentage: number;
    multiSigThreshold: number;
    signaturesRequired?: number;
    kmsKeyId: string;
  }): Promise<CustodyWallet> {
    // Check if wallet already exists
    const existing = await this.custodyWalletModel.findOne({
      assetCode: params.assetCode,
    });

    if (existing) {
      throw new BadRequestException(`Custody wallet already exists for ${params.assetCode}`);
    }

    const wallet = new this.custodyWalletModel({
      ...params,
      balance: 0,
      balanceMinor: 0,
      requiresMultiSig: params.multiSigThreshold > 0,
      signaturesRequired: params.signaturesRequired || 2,
      currentHourWithdrawals: 0,
      currentDayWithdrawals: 0,
      withdrawalWindowReset: new Date(),
      isActive: true,
      isLocked: false,
      lastBalanceCheck: new Date(),
      lastKeyRotation: new Date(),
      keyRotationPolicy: '6-months',
    });

    await wallet.save();

    this.logger.log(`✅ Created custody wallet for ${params.assetCode}`);

    return wallet;
  }

  /**
   * Update wallet balance
   */
  async updateBalance(assetCode: string, balance: number, balanceMinor: number): Promise<void> {
    const wallet = await this.getWallet(assetCode);

    const oldBalance = wallet.balance;
    wallet.balance = balance;
    wallet.balanceMinor = balanceMinor;
    wallet.lastBalanceCheck = new Date();

    await wallet.save();

    // Check if balance dropped significantly
    if (oldBalance > 0) {
      const percentageChange = Math.abs(((balance - oldBalance) / oldBalance) * 100);
      if (percentageChange > wallet.alertThresholdPercentage) {
        this.logger.warn(
          `⚠️ Balance changed by ${percentageChange.toFixed(2)}% for ${assetCode}: ${oldBalance} -> ${balance}`,
        );
      }
    }
  }

  /**
   * Increment withdrawal counter for rate limiting
   */
  async incrementWithdrawalCounter(assetCode: string, amount: number): Promise<void> {
    const wallet = await this.getWallet(assetCode);

    // Reset counters if window expired
    const now = new Date();
    const hoursSinceReset = (now.getTime() - wallet.withdrawalWindowReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      wallet.currentDayWithdrawals = 0;
      wallet.currentHourWithdrawals = 0;
      wallet.withdrawalWindowReset = now;
    } else if (hoursSinceReset >= 1) {
      wallet.currentHourWithdrawals = 0;
    }

    wallet.currentHourWithdrawals += amount;
    wallet.currentDayWithdrawals += amount;

    await wallet.save();
  }

  /**
   * Reset withdrawal counters (called by cron job)
   */
  async resetWithdrawalCounters(): Promise<void> {
    const wallets = await this.getAllWallets();

    for (const wallet of wallets) {
      const now = new Date();
      const hoursSinceReset = (now.getTime() - wallet.withdrawalWindowReset.getTime()) / (1000 * 60 * 60);

      if (hoursSinceReset >= 24) {
        wallet.currentDayWithdrawals = 0;
        wallet.currentHourWithdrawals = 0;
        wallet.withdrawalWindowReset = now;
        await wallet.save();
      }
    }
  }

  /**
   * Validate if withdrawal is within limits
   */
  async validateWithdrawalLimits(assetCode: string, amount: number): Promise<void> {
    const wallet = await this.getWallet(assetCode);

    if (!wallet.isActive) {
      throw new BadRequestException(`Wallet for ${assetCode} is not active`);
    }

    if (wallet.isLocked) {
      throw new BadRequestException(`Wallet for ${assetCode} is locked`);
    }

    if (amount > wallet.maxWithdrawalPerTx) {
      throw new BadRequestException(
        `Withdrawal amount exceeds maximum per transaction: ${wallet.maxWithdrawalPerTx} ${assetCode}`,
      );
    }

    if (wallet.currentHourWithdrawals + amount > wallet.maxWithdrawalPerHour) {
      throw new BadRequestException(
        `Hourly withdrawal limit exceeded for ${assetCode}`,
      );
    }

    if (wallet.currentDayWithdrawals + amount > wallet.maxWithdrawalPerDay) {
      throw new BadRequestException(
        `Daily withdrawal limit exceeded for ${assetCode}`,
      );
    }

    if (wallet.balance < amount) {
      throw new BadRequestException(
        `Insufficient hot wallet balance for ${assetCode}: available ${wallet.balance}, requested ${amount}`,
      );
    }

    const balanceAfterWithdrawal = wallet.balance - amount;
    if (balanceAfterWithdrawal < wallet.minOperationalBalance) {
      this.logger.warn(
        `⚠️ Withdrawal will bring ${assetCode} balance below minimum: ${balanceAfterWithdrawal} < ${wallet.minOperationalBalance}`,
      );
    }
  }

  /**
   * Check if amount requires multi-sig approval
   */
  async requiresMultiSig(assetCode: string, amount: number): Promise<boolean> {
    const wallet = await this.custodyWalletModel.findOne({ assetCode });
    if (!wallet) return false;
    return wallet.requiresMultiSig && amount > wallet.multiSigThreshold;
  }

  /**
   * Lock a wallet (emergency)
   */
  async lockWallet(assetCode: string, reason: string): Promise<void> {
    const wallet = await this.getWallet(assetCode);
    wallet.isLocked = true;
    await wallet.save();

    this.logger.error(`🔒 Wallet locked for ${assetCode}: ${reason}`);
  }

  /**
   * Unlock a wallet
   */
  async unlockWallet(assetCode: string): Promise<void> {
    const wallet = await this.getWallet(assetCode);
    wallet.isLocked = false;
    await wallet.save();

    this.logger.log(`🔓 Wallet unlocked for ${assetCode}`);
  }

  /**
   * Update wallet limits
   */
  async updateLimits(
    assetCode: string,
    limits: {
      maxWithdrawalPerTx?: number;
      maxWithdrawalPerHour?: number;
      maxWithdrawalPerDay?: number;
      minOperationalBalance?: number;
      alertThresholdPercentage?: number;
    },
  ): Promise<CustodyWallet> {
    const wallet = await this.getWallet(assetCode);

    if (limits.maxWithdrawalPerTx !== undefined) {
      wallet.maxWithdrawalPerTx = limits.maxWithdrawalPerTx;
    }
    if (limits.maxWithdrawalPerHour !== undefined) {
      wallet.maxWithdrawalPerHour = limits.maxWithdrawalPerHour;
    }
    if (limits.maxWithdrawalPerDay !== undefined) {
      wallet.maxWithdrawalPerDay = limits.maxWithdrawalPerDay;
    }
    if (limits.minOperationalBalance !== undefined) {
      wallet.minOperationalBalance = limits.minOperationalBalance;
    }
    if (limits.alertThresholdPercentage !== undefined) {
      wallet.alertThresholdPercentage = limits.alertThresholdPercentage;
    }

    await wallet.save();

    this.logger.log(`✅ Updated limits for ${assetCode}`);

    return wallet;
  }

  /**
   * Sign transaction with KMS (placeholder - requires actual KMS integration)
   */
  async signTransactionWithKMS(params: {
    blockchain: SupportedBlockchain;
    unsignedTx: any;
  }): Promise<any> {
    // In production, this would integrate with AWS KMS, Azure Key Vault, or HashiCorp Vault
    this.logger.warn('⚠️ KMS integration not implemented - using mock signing');

    // For now, return the unsigned transaction
    // Real implementation would:
    // 1. Get the KMS key ID for this blockchain
    // 2. Call KMS API to sign the transaction hash
    // 3. Combine signature with transaction
    // 4. Return signed transaction

    return {
      raw: params.unsignedTx,
      hash: 'mock-hash-' + Date.now(),
    };
  }
}

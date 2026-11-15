import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Withdrawal, WithdrawalStatus } from '../models/withdrawal.schema';
import { SupportedBlockchain } from '../models/user-address.schema';
import { AccountService } from '../../ledger/services/account.service';
import { BalanceService } from '../../ledger/services/balance.service';
import { HoldService } from '../../ledger/services/hold.service';
import { PostingService } from '../../ledger/services/posting.service';
import { LineDirection } from '../../ledger/models/journal-line.schema';
import { OwnerType, AccountType } from '../../ledger/models/account.schema';
import { CustodyService } from './custody.service';
import { BSCBlockchainService } from './blockchain/bsc-blockchain.service';
import { BitcoinBlockchainService } from './blockchain/bitcoin-blockchain.service';
import { StellarBlockchainService } from './blockchain/stellar-blockchain.service';
import { TronBlockchainService } from './blockchain/tron-blockchain.service';
import { mapToLedgerAssetCode } from '../utils/asset-mapping';

/**
 * Service for processing cryptocurrency withdrawals
 */
@Injectable()
export class WithdrawalService {
  private readonly logger = new Logger(WithdrawalService.name);

  constructor(
    @InjectModel(Withdrawal.name)
    private readonly withdrawalModel: Model<Withdrawal>,
    private readonly accountService: AccountService,
    private readonly balanceService: BalanceService,
    private readonly holdService: HoldService,
    private readonly postingService: PostingService,
    private readonly custodyService: CustodyService,
    private readonly bscBlockchainService: BSCBlockchainService,
    private readonly bitcoinBlockchainService: BitcoinBlockchainService,
    private readonly stellarBlockchainService: StellarBlockchainService,
    private readonly tronBlockchainService: TronBlockchainService,
  ) {}

  /**
   * Request a withdrawal
   */
  async requestWithdrawal(params: {
    userId: string;
    assetCode: string;
    amount: number;
    destinationAddress: string;
    idempotencyKey: string;
  }): Promise<Withdrawal> {
    const { userId, assetCode, amount, destinationAddress, idempotencyKey } =
      params;

    // Check idempotency
    const existing = await this.withdrawalModel.findOne({ idempotencyKey });
    if (existing) {
      this.logger.log(
        `Withdrawal request already exists: ${idempotencyKey}`,
      );
      return existing;
    }

    // Get blockchain for asset
    const blockchain = this.getBlockchainForAsset(assetCode);
    const blockchainService = this.getBlockchainService(blockchain);

    // Validate destination address
    if (!blockchainService.isValidAddress(destinationAddress)) {
      throw new BadRequestException('Invalid destination address');
    }

    // Map blockchain-specific asset code to unified ledger code
    // Example: USDT_BSC → USDT, USDC_ETH → USDC
    const ledgerAssetCode = mapToLedgerAssetCode(assetCode);
    
    this.logger.log(
      `Withdrawal request: ${assetCode} (blockchain) → ${ledgerAssetCode} (ledger)`,
    );

    // Get user account (using unified asset code)
    const userAccount = await this.accountService.getOrCreateAccount({
      ownerType: OwnerType.USER,
      ownerId: userId,
      assetCode: ledgerAssetCode,
      accountType: AccountType.ASSET,
    });

    if (!userAccount) {
      throw new NotFoundException(`Account not found for ${ledgerAssetCode}`);
    }

    // Check balance (using unified asset code)
    const balance = await this.balanceService.getAccountBalance({
      accountId: String(userAccount._id),
      assetCode: ledgerAssetCode,
    });

    const amountMinor = this.toMinorUnits(amount, ledgerAssetCode);

    if (balance.availableMinor < amountMinor) {
      throw new BadRequestException(
        `Insufficient balance: available ${this.fromMinorUnits(balance.availableMinor, ledgerAssetCode)} ${ledgerAssetCode}`,
      );
    }

    // Validate custody wallet limits
    await this.custodyService.validateWithdrawalLimits(assetCode, amount);

    // Create withdrawal record
    const withdrawal = new this.withdrawalModel({
      userId,
      assetCode,
      blockchain,
      amount,
      amountMinor,
      destinationAddress,
      status: 'pending_approval',
      confirmations: 0,
      requiresMultiSig: await this.custodyService.requiresMultiSig(
        assetCode,
        amount,
      ),
      idempotencyKey,
      requestedAt: new Date(),
    });

    await withdrawal.save();

    // Create hold in ledger to lock funds
    const hold = await this.holdService.createHold({
      accountId: String(userAccount._id),
      amountMinor,
      reason: `Withdrawal request ${String(withdrawal._id)}`,
      metadata: {
        withdrawalId: String(withdrawal._id),
      },
    });

    withdrawal.holdId = String(hold._id);
    await withdrawal.save();

    this.logger.log(
      `📤 Withdrawal requested: ${amount} ${assetCode} for user ${userId} (${withdrawal._id})`,
    );

    // Auto-process if doesn't require manual approval
    if (!withdrawal.requiresMultiSig) {
      // Process asynchronously
      this.processWithdrawal(withdrawal).catch((error) => {
        this.logger.error(
          `Failed to auto-process withdrawal ${withdrawal._id}:`,
          error,
        );
      });
    }

    return withdrawal;
  }

  /**
   * Process a withdrawal
   */
  async processWithdrawal(withdrawal: Withdrawal): Promise<void> {
    try {
      // Update status
      withdrawal.status = 'processing';
      await withdrawal.save();

      // Get blockchain service
      const blockchainService = this.getBlockchainService(
        withdrawal.blockchain,
      );

      // Ensure blockchain is connected
      if (!blockchainService.isConnected()) {
        await blockchainService.connect();
      }

      // Estimate gas fee
      const gasEstimate = await blockchainService.estimateGasFee({
        to: withdrawal.destinationAddress,
        amount: withdrawal.amount,
        assetCode: withdrawal.assetCode,
      });

      withdrawal.gasFee = gasEstimate.fee;
      withdrawal.gasFeeAsset = gasEstimate.assetCode;
      await withdrawal.save();

      // Create unsigned transaction
      const unsignedTx = await blockchainService.createTransaction({
        to: withdrawal.destinationAddress,
        amount: withdrawal.amount,
        assetCode: withdrawal.assetCode,
      });

      // Sign transaction (in production, use KMS)
      const signedTx = await this.custodyService.signTransactionWithKMS({
        blockchain: withdrawal.blockchain,
        unsignedTx,
      });

      // Update withdrawal counters
      await this.custodyService.incrementWithdrawalCounter(
        withdrawal.assetCode,
        withdrawal.amount,
      );

      // Broadcast transaction
      const txHash = await blockchainService.broadcastTransaction(
        signedTx.raw || signedTx,
      );

      withdrawal.txHash = txHash;
      withdrawal.status = 'broadcasted';
      withdrawal.broadcastedAt = new Date();
      await withdrawal.save();

      this.logger.log(
        `✅ Withdrawal broadcasted: ${withdrawal.amount} ${withdrawal.assetCode} - TxHash: ${txHash}`,
      );

      // Monitor confirmations in background
      this.monitorWithdrawalConfirmations(withdrawal).catch((error) => {
        this.logger.error(
          `Failed to monitor confirmations for ${withdrawal._id}:`,
          error,
        );
      });
    } catch (error) {
      // Handle errors
      withdrawal.status = 'failed';
      withdrawal.errorMessage = error.message;
      await withdrawal.save();

      // Release hold
      if (withdrawal.holdId) {
        await this.holdService.cancelHold(withdrawal.holdId);
      }

      this.logger.error(
        `Failed to process withdrawal ${withdrawal._id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Monitor withdrawal confirmations
   */
  private async monitorWithdrawalConfirmations(
    withdrawal: Withdrawal,
  ): Promise<void> {
    const blockchainService = this.getBlockchainService(
      withdrawal.blockchain,
    );
    const requiredConfirmations = this.getRequiredConfirmations(
      withdrawal.blockchain,
    );

    let confirmations = 0;

    while (confirmations < requiredConfirmations) {
      await this.wait(this.getBlockTime(withdrawal.blockchain));

      try {
        const tx = await blockchainService.getTransaction(withdrawal.txHash!);
        confirmations = tx.confirmations;

        withdrawal.confirmations = confirmations;
        await withdrawal.save();

        this.logger.debug(
          `Withdrawal ${withdrawal.txHash}: ${confirmations}/${requiredConfirmations} confirmations`,
        );
      } catch (error) {
        this.logger.error(
          `Error checking confirmations for ${withdrawal.txHash}:`,
          error,
        );
      }
    }

    // Finalize withdrawal
    await this.finalizeWithdrawal(withdrawal);
  }

  /**
   * Finalize a confirmed withdrawal
   */
  private async finalizeWithdrawal(withdrawal: Withdrawal): Promise<void> {
    try {
      // Map blockchain-specific asset code to unified ledger code
      const ledgerAssetCode = mapToLedgerAssetCode(withdrawal.assetCode);
      
      // Get accounts (using unified asset code)
      const userAccount = await this.accountService.getOrCreateAccount({
        ownerType: OwnerType.USER,
        ownerId: withdrawal.userId,
        assetCode: ledgerAssetCode,
        accountType: AccountType.ASSET,
      });

      const platformAccount = await this.accountService.getOrCreateAccount({
        ownerType: OwnerType.PLATFORM,
        ownerId: 'platform',
        assetCode: ledgerAssetCode,
        accountType: AccountType.ASSET,
      });

      if (!userAccount || !platformAccount) {
        throw new Error('Accounts not found');
      }

      // Release hold
      if (withdrawal.holdId) {
        await this.holdService.releaseHold(withdrawal.holdId);
      }

      // Create journal entry to debit user account
      const journalEntry = await this.postingService.postJournalEntry({
        externalIdempotencyKey: `withdrawal_${withdrawal.txHash}`,
        narration: `Withdrawal: ${withdrawal.amount} ${withdrawal.assetCode} to ${withdrawal.destinationAddress} (${withdrawal.blockchain})`,
        lines: [
          {
            accountId: String(userAccount._id),
            direction: LineDirection.DEBIT,
            amountMinor: withdrawal.amountMinor,
            assetCode: ledgerAssetCode,
          },
          {
            accountId: String(platformAccount._id),
            direction: LineDirection.CREDIT,
            amountMinor: withdrawal.amountMinor,
            assetCode: ledgerAssetCode,
          },
        ],
        correlationId: String(withdrawal._id),
        metadata: {
          withdrawalId: String(withdrawal._id),
          txHash: withdrawal.txHash,
          blockchain: withdrawal.blockchain,
          blockchainAssetCode: withdrawal.assetCode, // Keep original for tracking
          destinationAddress: withdrawal.destinationAddress,
        },
      });

      // Update withdrawal status
      withdrawal.status = 'completed';
      withdrawal.ledgerEntryId = String(journalEntry._id);
      withdrawal.debitedAt = new Date();
      withdrawal.completedAt = new Date();
      await withdrawal.save();

      this.logger.log(
        `✅ Withdrawal completed: ${withdrawal.amount} ${withdrawal.assetCode} for user ${withdrawal.userId}`,
      );
    } catch (error) {
      withdrawal.status = 'failed';
      withdrawal.errorMessage = error.message;
      await withdrawal.save();

      this.logger.error(
        `Failed to finalize withdrawal ${withdrawal._id}:`,
        error,
      );
    }
  }

  /**
   * Get user withdrawals
   */
  async getUserWithdrawals(
    userId: string,
    filters?: {
      status?: WithdrawalStatus;
      limit?: number;
    },
  ): Promise<Withdrawal[]> {
    const query: any = { userId };

    if (filters?.status) {
      query.status = filters.status;
    }

    return this.withdrawalModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 50);
  }

  /**
   * Get withdrawal by ID
   */
  async getWithdrawalById(withdrawalId: string): Promise<Withdrawal | null> {
    return this.withdrawalModel.findById(withdrawalId);
  }

  /**
   * Cancel a pending withdrawal
   */
  async cancelWithdrawal(withdrawalId: string, userId: string): Promise<void> {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId);

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.userId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    if (withdrawal.status !== 'pending_approval') {
      throw new BadRequestException(
        'Can only cancel pending withdrawals',
      );
    }

    // Release hold
    if (withdrawal.holdId) {
      await this.holdService.cancelHold(withdrawal.holdId);
    }

    withdrawal.status = 'cancelled';
    await withdrawal.save();

    this.logger.log(`Withdrawal ${withdrawalId} cancelled by user ${userId}`);
  }

  // Helper methods

  private getBlockchainForAsset(assetCode: string): SupportedBlockchain {
    const mapping: Record<string, SupportedBlockchain> = {
      BTC: 'bitcoin',
      BNB: 'bsc',
      ETH: 'ethereum',
      XLM: 'stellar',
      TRX: 'tron',
      USDT: 'bsc', // Assume USDT on BSC by default
      BUSD: 'bsc',
    };
    return mapping[assetCode.toUpperCase()] || 'bsc';
  }

  private getBlockchainService(blockchain: SupportedBlockchain): any {
    switch (blockchain) {
      case 'bsc':
      case 'ethereum':
        return this.bscBlockchainService;
      case 'bitcoin':
        return this.bitcoinBlockchainService;
      case 'stellar':
        return this.stellarBlockchainService;
      case 'tron':
        return this.tronBlockchainService;
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  private getRequiredConfirmations(blockchain: SupportedBlockchain): number {
    const confirmations: Record<SupportedBlockchain, number> = {
      bitcoin: 6,
      bsc: 15,
      ethereum: 12,
      stellar: 1,
      tron: 1,
    };
    return confirmations[blockchain];
  }

  private getBlockTime(blockchain: SupportedBlockchain): number {
    const blockTimes: Record<SupportedBlockchain, number> = {
      bitcoin: 10 * 60 * 1000,
      bsc: 3 * 1000,
      ethereum: 15 * 1000,
      stellar: 5 * 1000,
      tron: 1 * 1000,
    };
    return blockTimes[blockchain];
  }

  private toMinorUnits(amount: number, assetCode: string): number {
    const decimals = this.isCrypto(assetCode) ? 8 : 2;
    return Math.round(amount * Math.pow(10, decimals));
  }

  private fromMinorUnits(amountMinor: number, assetCode: string): number {
    const decimals = this.isCrypto(assetCode) ? 8 : 2;
    return amountMinor / Math.pow(10, decimals);
  }

  private isCrypto(assetCode: string): boolean {
    const cryptoAssets = ['BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'BUSD', 'XLM', 'TRX'];
    return cryptoAssets.includes(assetCode.toUpperCase());
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

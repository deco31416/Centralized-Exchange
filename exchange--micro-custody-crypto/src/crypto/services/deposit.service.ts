import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Deposit, DepositStatus } from '../models/deposit.schema';
import { PostingService } from '../../ledger/services/posting.service';
import { AccountService } from '../../ledger/services/account.service';
import { LineDirection } from '../../ledger/models/journal-line.schema';
import { OwnerType, AccountType } from '../../ledger/models/account.schema';
import { mapToLedgerAssetCode } from '../utils/asset-mapping';
import { convertToLedgerMinorUnits, getLedgerDecimals } from '../../ledger/utils/asset-decimals';
import { TokenConfigurationService } from './token-configuration.service';

/**
 * Service for processing and crediting cryptocurrency deposits
 */
@Injectable()
export class DepositService {
  private readonly logger = new Logger(DepositService.name);

  constructor(
    @InjectModel(Deposit.name)
    private readonly depositModel: Model<Deposit>,
    private readonly postingService: PostingService,
    private readonly accountService: AccountService,
    private readonly tokenConfigService: TokenConfigurationService,
  ) {}

  /**
   * Cron job to process confirmed deposits
   * Runs every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processConfirmedDeposits(): Promise<void> {
    try {
      // Find all confirmed but not yet credited deposits
      const confirmedDeposits = await this.depositModel.find({
        status: 'confirmed',
      });

      if (confirmedDeposits.length === 0) {
        return;
      }

      this.logger.log(
        `Processing ${confirmedDeposits.length} confirmed deposits`,
      );

      for (const deposit of confirmedDeposits) {
        try {
          await this.processConfirmedDeposit(deposit);
        } catch (error) {
          this.logger.error(
            `Failed to process deposit ${deposit.txHash}:`,
            error,
          );
          // Continue with next deposit
        }
      }
    } catch (error) {
      this.logger.error('Error in processConfirmedDeposits cron:', error);
    }
  }

  /**
   * Process a single confirmed deposit
   */
  async processConfirmedDeposit(deposit: Deposit): Promise<void> {
    // Verify idempotency
    if (deposit.status === 'credited') {
      this.logger.warn(
        `Deposit ${deposit.txHash} already credited, skipping`,
      );
      return;
    }

    try {
      // Map blockchain-specific asset code to unified ledger code
      // Example: USDT_BSC → USDT, USDC_ETH → USDC, USDC_XLM → USDC
      const ledgerAssetCode = mapToLedgerAssetCode(deposit.assetCode);
      
      // Get blockchain-specific token configuration for source decimals
      const tokenConfig = await this.tokenConfigService.getTokenByAssetCode(deposit.assetCode);
      const blockchainDecimals = tokenConfig?.decimals || 8; // Default to 8 if not found
      
      // Get ledger standard decimals for this asset
      const ledgerDecimals = getLedgerDecimals(ledgerAssetCode);
      
      // Convert amount from blockchain decimals to ledger decimals
      const ledgerAmountMinor = convertToLedgerMinorUnits(
        deposit.amount, // Amount in major units (e.g., 6 USDC)
        blockchainDecimals, // Source decimals (e.g., 7 for Stellar)
        ledgerDecimals // Target decimals (e.g., 8 for ledger USDC)
      );
      
      this.logger.log(
        `Processing deposit: ${deposit.amount} ${deposit.assetCode} → ${ledgerAssetCode}`,
      );
      this.logger.log(
        `  Conversion: ${deposit.amountMinor} (${blockchainDecimals} decimals) → ${ledgerAmountMinor} (${ledgerDecimals} decimals)`,
      );

      // Get or create user account (using unified asset code)
      const userAccount = await this.accountService.getOrCreateAccount({
        ownerType: OwnerType.USER,
        ownerId: deposit.userId,
        assetCode: ledgerAssetCode,
        accountType: AccountType.ASSET,
      });

      // Get or create system equity account (source of external deposits)
      const equityAccount = await this.accountService.getOrCreateAccount({
        ownerType: OwnerType.PLATFORM,
        ownerId: 'system',
        assetCode: ledgerAssetCode,
        accountType: AccountType.EQUITY,
      });

      // Create journal entry (double-entry accounting)
      // DEBIT equity (external source of funds, can go negative)
      // CREDIT user asset (increases user balance)
      // Use ledgerAmountMinor (converted to ledger decimals)
      const journalEntry = await this.postingService.postJournalEntry({
        externalIdempotencyKey: `deposit_${deposit.txHash}`,
        narration: `Deposit: ${deposit.amount} ${deposit.assetCode} from ${deposit.txHash} (${deposit.blockchain})`,
        lines: [
          {
            accountId: String(equityAccount._id),
            direction: LineDirection.DEBIT,
            amountMinor: ledgerAmountMinor,
            assetCode: ledgerAssetCode,
          },
          {
            accountId: String(userAccount._id),
            direction: LineDirection.CREDIT,
            amountMinor: ledgerAmountMinor,
            assetCode: ledgerAssetCode,
          },
        ],
        correlationId: String(deposit._id),
        metadata: {
          depositId: String(deposit._id),
          txHash: deposit.txHash,
          blockchain: deposit.blockchain,
          blockchainAssetCode: deposit.assetCode, // Keep original for tracking
          blockchainAmountMinor: deposit.amountMinor, // Original blockchain amount
          blockchainDecimals,
          ledgerAmountMinor, // Converted ledger amount
          ledgerDecimals,
          fromAddress: deposit.fromAddress,
          toAddress: deposit.toAddress,
        },
      });

      // Update deposit status
      deposit.status = 'credited';
      deposit.ledgerEntryId = String(journalEntry._id);
      deposit.creditedAt = new Date();
      await deposit.save();

      this.logger.log(
        `✅ Deposit credited: ${deposit.amount} ${deposit.assetCode} for user ${deposit.userId} (tx: ${deposit.txHash})`,
      );
    } catch (error) {
      // Mark as failed
      deposit.status = 'failed';
      deposit.errorMessage = error.message;
      await deposit.save();

      this.logger.error(
        `Failed to process deposit ${deposit.txHash}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get user deposits
   */
  async getUserDeposits(
    userId: string,
    filters?: {
      assetCode?: string;
      status?: DepositStatus;
      limit?: number;
    },
  ): Promise<Deposit[]> {
    const query: any = { userId };

    if (filters?.assetCode) {
      query.assetCode = filters.assetCode;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    return this.depositModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 50);
  }

  /**
   * Get deposit by ID
   */
  async getDepositById(depositId: string): Promise<Deposit | null> {
    return this.depositModel.findById(depositId);
  }

  /**
   * Get deposit by transaction hash
   */
  async getDepositByTxHash(txHash: string): Promise<Deposit | null> {
    return this.depositModel.findOne({ txHash });
  }

  /**
   * Get all deposits (admin)
   */
  async getAllDeposits(filters?: {
    status?: DepositStatus;
    blockchain?: string;
    assetCode?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ deposits: Deposit[]; total: number }> {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.blockchain) {
      query.blockchain = filters.blockchain;
    }

    if (filters?.assetCode) {
      query.assetCode = filters.assetCode;
    }

    const total = await this.depositModel.countDocuments(query);

    const deposits = await this.depositModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 50)
      .skip(filters?.skip || 0);

    return { deposits, total };
  }

  /**
   * Get deposit statistics
   */
  async getDepositStatistics(): Promise<{
    totalDeposits: number;
    pendingDeposits: number;
    confirmedDeposits: number;
    creditedDeposits: number;
    failedDeposits: number;
    totalVolume: Record<string, number>;
  }> {
    const allDeposits = await this.depositModel.find();

    const stats = {
      totalDeposits: allDeposits.length,
      pendingDeposits: allDeposits.filter((d) => d.status === 'pending').length,
      confirmedDeposits: allDeposits.filter((d) => d.status === 'confirmed')
        .length,
      creditedDeposits: allDeposits.filter((d) => d.status === 'credited')
        .length,
      failedDeposits: allDeposits.filter((d) => d.status === 'failed').length,
      totalVolume: {} as Record<string, number>,
    };

    // Calculate total volume per asset
    for (const deposit of allDeposits) {
      if (deposit.status === 'credited') {
        if (!stats.totalVolume[deposit.assetCode]) {
          stats.totalVolume[deposit.assetCode] = 0;
        }
        stats.totalVolume[deposit.assetCode] += deposit.amount;
      }
    }

    return stats;
  }
}

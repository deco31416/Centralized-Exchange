import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AccountService } from '../../ledger/services/account.service';
import { BalanceService } from '../../ledger/services/balance.service';
import { OwnerType, AccountType } from '../../ledger/models/account.schema';
import { CustodyService } from './custody.service';
import { BSCBlockchainService } from './blockchain/bsc-blockchain.service';
import { BitcoinBlockchainService } from './blockchain/bitcoin-blockchain.service';
import { SupportedBlockchain } from '../models/user-address.schema';

/**
 * Interface for reconciliation report
 */
export interface ReconciliationReport {
  date: Date;
  assets: AssetReconciliation[];
  discrepancies: DiscrepancyReport[];
  status: 'passed' | 'failed';
}

export interface AssetReconciliation {
  assetCode: string;
  virtualBalance: number;
  realBalance: number;
  difference: number;
  discrepancyPercentage: number;
}

export interface DiscrepancyReport {
  assetCode: string;
  virtualBalance: number;
  realBalance: number;
  difference: number;
  severity: 'warning' | 'critical';
}

/**
 * Service for reconciling real (blockchain) vs virtual (ledger) balances
 */
@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    private readonly accountService: AccountService,
    private readonly balanceService: BalanceService,
    private readonly custodyService: CustodyService,
    private readonly bscBlockchainService: BSCBlockchainService,
    private readonly bitcoinBlockchainService: BitcoinBlockchainService,
  ) {}

  /**
   * Run daily reconciliation at 2 AM
   */
  @Cron('0 2 * * *')
  async runDailyReconciliation(): Promise<void> {
    this.logger.log('🔍 Starting daily reconciliation...');

    try {
      const report = await this.runReconciliation(new Date());

      if (report.status === 'passed') {
        this.logger.log('✅ Daily reconciliation passed - all balances match');
      } else {
        this.logger.error(
          `❌ Daily reconciliation failed - ${report.discrepancies.length} discrepancies found`,
        );
        // In production, send alerts to admins
      }
    } catch (error) {
      this.logger.error('Error running daily reconciliation:', error);
    }
  }

  /**
   * Run reconciliation for a specific date
   */
  async runReconciliation(date: Date): Promise<ReconciliationReport> {
    const report: ReconciliationReport = {
      date,
      assets: [],
      discrepancies: [],
      status: 'pending' as any,
    };

    // Get all custody wallets
    const wallets = await this.custodyService.getAllWallets();

    for (const wallet of wallets) {
      try {
        // Calculate virtual balance (sum of all user balances)
        const virtualBalance = await this.calculateVirtualBalance(
          wallet.assetCode,
        );

        // Calculate real balance (blockchain)
        const realBalance = await this.calculateRealBalance(
          wallet.assetCode,
          wallet.blockchain,
          wallet.mainAddress,
        );

        // Calculate difference
        const difference = virtualBalance - realBalance;
        const discrepancyPercentage =
          virtualBalance > 0 ? Math.abs((difference / virtualBalance) * 100) : 0;

        report.assets.push({
          assetCode: wallet.assetCode,
          virtualBalance,
          realBalance,
          difference,
          discrepancyPercentage,
        });

        // Check for significant discrepancies
        if (discrepancyPercentage > 0.1) {
          report.discrepancies.push({
            assetCode: wallet.assetCode,
            virtualBalance,
            realBalance,
            difference,
            severity: discrepancyPercentage > 1 ? 'critical' : 'warning',
          });
        }
      } catch (error) {
        this.logger.error(
          `Error reconciling ${wallet.assetCode}:`,
          error,
        );
      }
    }

    report.status = report.discrepancies.length === 0 ? 'passed' : 'failed';

    // Log results
    this.logReconciliationReport(report);

    return report;
  }

  /**
   * Calculate total virtual balance (ledger) for an asset
   */
  private async calculateVirtualBalance(assetCode: string): Promise<number> {
    // Get all user accounts for this asset - simplified version
    // In a real implementation, we would query all accounts with ownerType USER and matching assetCode
    this.logger.warn('calculateVirtualBalance simplified - implement proper account aggregation');
    
    // For now, return 0 as placeholder
    // TODO: Implement proper account aggregation when AccountService has findAll method
    return 0;
  }

  /**
   * Calculate real balance (blockchain) for an asset
   */
  private async calculateRealBalance(
    assetCode: string,
    blockchain: SupportedBlockchain,
    address: string,
  ): Promise<number> {
    const blockchainService = this.getBlockchainService(blockchain);

    if (!blockchainService.isConnected()) {
      await blockchainService.connect();
    }

    return await blockchainService.getBalance(address);
  }

  /**
   * Log reconciliation report
   */
  private logReconciliationReport(report: ReconciliationReport): void {
    this.logger.log('═══════════════════════════════════════════════');
    this.logger.log(`📊 RECONCILIATION REPORT - ${report.date.toISOString()}`);
    this.logger.log('═══════════════════════════════════════════════');

    for (const asset of report.assets) {
      const status = asset.discrepancyPercentage > 0.1 ? '❌' : '✅';
      this.logger.log(
        `${status} ${asset.assetCode}: Virtual=${asset.virtualBalance.toFixed(8)} Real=${asset.realBalance.toFixed(8)} Diff=${asset.difference.toFixed(8)} (${asset.discrepancyPercentage.toFixed(4)}%)`,
      );
    }

    if (report.discrepancies.length > 0) {
      this.logger.log('');
      this.logger.log('⚠️  DISCREPANCIES FOUND:');
      for (const disc of report.discrepancies) {
        const icon = disc.severity === 'critical' ? '🚨' : '⚠️';
        this.logger.log(
          `${icon} ${disc.assetCode}: ${disc.difference.toFixed(8)} difference (${disc.severity})`,
        );
      }
    }

    this.logger.log('═══════════════════════════════════════════════');
  }

  // Helper methods

  private getBlockchainService(blockchain: SupportedBlockchain): any {
    switch (blockchain) {
      case 'bsc':
      case 'ethereum':
        return this.bscBlockchainService;
      case 'bitcoin':
        return this.bitcoinBlockchainService;
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  private fromMinorUnits(amountMinor: number, assetCode: string): number {
    const decimals = this.isCrypto(assetCode) ? 8 : 2;
    return amountMinor / Math.pow(10, decimals);
  }

  private isCrypto(assetCode: string): boolean {
    const cryptoAssets = ['BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'BUSD'];
    return cryptoAssets.includes(assetCode.toUpperCase());
  }
}

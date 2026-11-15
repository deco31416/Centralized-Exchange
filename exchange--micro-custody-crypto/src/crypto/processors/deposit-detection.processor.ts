import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Job } from 'bull';
import { Deposit } from '../models/deposit.schema';
import { BSCBlockchainService } from '../services/blockchain/bsc-blockchain.service';
import { BitcoinBlockchainService } from '../services/blockchain/bitcoin-blockchain.service';
import { SupportedBlockchain } from '../models/user-address.schema';
import { TronBlockchainService } from '../services/blockchain/tron-blockchain.service';
import { StellarBlockchainService } from '../services/blockchain/stellar-blockchain.service';

/**
 * Processor for tracking deposit confirmations
 */
@Processor('deposit-detection')
export class DepositDetectionProcessor {
  private readonly logger = new Logger(DepositDetectionProcessor.name);

  constructor(
    @InjectModel(Deposit.name)
    private readonly depositModel: Model<Deposit>,
    private readonly bscBlockchainService: BSCBlockchainService,
    private readonly bitcoinBlockchainService: BitcoinBlockchainService,
    private readonly tronBlockchainService: TronBlockchainService,
    private readonly stellarBlockchainService: StellarBlockchainService,
  ) {}

  /**
   * Track confirmations for a deposit
   */
  @Process('track-confirmations')
  async trackConfirmations(job: Job<{ depositId: string }>): Promise<void> {
    const { depositId } = job.data;

    const deposit = await this.depositModel.findById(depositId);
    if (!deposit) {
      throw new Error(`Deposit ${depositId} not found`);
    }

    this.logger.log(
      `Tracking confirmations for deposit ${deposit.txHash} (${deposit.confirmations}/${deposit.requiredConfirmations})`,
    );

    // Get blockchain service
    const blockchainService = this.getBlockchainService(deposit.blockchain);

    // Loop until required confirmations reached
    while (deposit.confirmations < deposit.requiredConfirmations) {
      // Wait for next block
      await this.wait(this.getBlockTime(deposit.blockchain));

      try {
        // Get current block height
        const currentBlock = await blockchainService.getBlockHeight();

        // Calculate confirmations
        const confirmations = currentBlock - deposit.blockNumber + 1;

        // Update deposit
        deposit.confirmations = confirmations;
        await deposit.save();

        // Update job progress
        const progress = (confirmations / deposit.requiredConfirmations) * 100;
        job.progress(Math.min(progress, 100));

        this.logger.debug(
          `Deposit ${deposit.txHash}: ${confirmations}/${deposit.requiredConfirmations} confirmations`,
        );
      } catch (error) {
        this.logger.error(
          `Error tracking confirmations for ${deposit.txHash}:`,
          error,
        );
        // Continue trying
      }
    }

    // Mark as confirmed
    deposit.status = 'confirmed';
    deposit.confirmedAt = new Date();
    await deposit.save();

    this.logger.log(
      `✅ Deposit confirmed: ${deposit.amount} ${deposit.assetCode} for user ${deposit.userId} (tx: ${deposit.txHash})`,
    );

    // Note: The DepositService will pick up confirmed deposits and credit them
  }

  /**
   * Get blockchain service for a blockchain type
   */
  private getBlockchainService(blockchain: SupportedBlockchain): any {
    switch (blockchain) {
      case 'bsc':
      case 'ethereum':
        return this.bscBlockchainService;
      case 'bitcoin':
        return this.bitcoinBlockchainService;
      case 'tron':
        return this.tronBlockchainService;
      case 'stellar':
        return this.stellarBlockchainService;
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  /**
   * Get block time for a blockchain
   */
  private getBlockTime(blockchain: SupportedBlockchain): number {
    const blockTimes: Record<SupportedBlockchain, number> = {
      bitcoin: 10 * 60 * 1000, // 10 minutes
      bsc: 3 * 1000, // 3 seconds
      ethereum: 15 * 1000, // 15 seconds
      stellar: 5 * 1000, // 5 seconds
      tron: 1 * 1000, // 1 second
    };
    return blockTimes[blockchain];
  }

  /**
   * Wait for specified milliseconds
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

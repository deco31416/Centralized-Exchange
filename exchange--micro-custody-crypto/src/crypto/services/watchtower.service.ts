import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { formatEther, formatUnits } from 'ethers';
import { UserAddress, SupportedBlockchain } from '../models/user-address.schema';
import { Deposit } from '../models/deposit.schema';
import { BlockchainScanState } from '../models/blockchain-scan-state.schema';
import { TokenConfiguration } from '../models/token-configuration.schema';
import { BSCBlockchainService } from './blockchain/bsc-blockchain.service';
import { BitcoinBlockchainService } from './blockchain/bitcoin-blockchain.service';
import { EthereumBlockchainService } from './blockchain/ethereum-blockchain.service';
import { TronBlockchainService } from './blockchain/tron-blockchain.service';
import { StellarBlockchainService } from './blockchain/stellar-blockchain.service';
import { TokenConfigurationService } from './token-configuration.service';
import { getBaseSymbol } from '../utils/asset-mapping';
import { ErrorLogger } from '../utils/error-logger';

/**
 * Interface for deposit detection parameters
 */
interface DepositDetectedParams {
  blockchain: SupportedBlockchain;
  txHash: string;
  userAddress: UserAddress;
  amount: number;
  assetCode: string;
  blockNumber: number;
  confirmations: number;
  fromAddress: string;
}

/**
 * Watchtower service for monitoring blockchain deposits
 * Continuously scans blockchains for incoming transactions
 */
@Injectable()
export class WatchtowerService implements OnModuleInit {
  private readonly logger = new Logger(WatchtowerService.name);
  private isRunning: boolean = false;
  private scanIntervals: Map<SupportedBlockchain, NodeJS.Timeout> = new Map();

  constructor(
    @InjectModel(UserAddress.name)
    private readonly addressModel: Model<UserAddress>,
    @InjectModel(Deposit.name)
    private readonly depositModel: Model<Deposit>,
    @InjectModel(BlockchainScanState.name)
    private readonly scanStateModel: Model<BlockchainScanState>,
    @InjectQueue('deposit-detection')
    private readonly detectionQueue: Queue,
    private readonly bscBlockchainService: BSCBlockchainService,
    private readonly bitcoinBlockchainService: BitcoinBlockchainService,
    private readonly ethereumBlockchainService: EthereumBlockchainService,
    private readonly tronBlockchainService: TronBlockchainService,
    private readonly stellarBlockchainService: StellarBlockchainService,
    private readonly tokenConfigService: TokenConfigurationService,
  ) {}

  /**
   * Start watchtower when module initializes
   */
  async onModuleInit(): Promise<void> {
    // Auto-start disabled for now - will be started manually
    await this.start();
  }

  /**
   * Start the watchtower service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Watchtower already running');
      return;
    }

    this.isRunning = true;
    this.logger.log('🔭 Watchtower started - monitoring blockchains for deposits');

    // Initialize error logger
    ErrorLogger.initialize();
    this.logger.log(`📝 Error logs will be written to: ${ErrorLogger.getLogFilePath()}`);

    // Enable all blockchain watchers
    // await this.startBSCWatcher();
    // await this.startEthereumWatcher();
    // await this.startBitcoinWatcher();
    // await this.startTronWatcher();
    await this.startStellarWatcher();
  }

  /**
   * Stop the watchtower service
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    // Clear all intervals
    for (const [blockchain, interval] of this.scanIntervals.entries()) {
      clearInterval(interval);
      this.logger.log(`Stopped ${blockchain} watcher`);
    }

    this.scanIntervals.clear();
    this.logger.log('🛑 Watchtower stopped');
  }

  /**
   * Start BSC blockchain watcher
   */
  private async startBSCWatcher(): Promise<void> {
    const SCAN_INTERVAL = 10000; // 15 seconds (BSC block time ~3s)

    // Connect to BSC
    try {
      await this.bscBlockchainService.connect();
    } catch (error) {
      this.logger.error('Failed to start BSC watcher - blockchain connection failed:', error.message);
      this.logger.warn('⚠️ BSC deposit monitoring disabled. Check your BSC_RPC_URL and BSC_HOT_WALLET_PRIVATE_KEY configuration.');
      return; // Don't start the watcher if connection fails
    }

    const interval = setInterval(async () => {
      try {
        await this.scanBSCForDeposits();
      } catch (error) {
        this.logger.error('BSC watcher error:', error);
      }
    }, SCAN_INTERVAL);

    this.scanIntervals.set('bsc', interval);
    this.logger.log('✅ BSC watcher started');
  }

  /**
   * Scan BSC blockchain for deposits (both native BNB and BEP-20 tokens)
   */
  private async scanBSCForDeposits(): Promise<void> {
    this.logger.log('Scanning BSC blockchain for deposits');
    
    // Get all watched addresses on BSC
    const addresses = await this.addressModel.find({
      blockchain: 'bsc',
      isWatched: true,
    });

    if (addresses.length === 0) {
      return;
    }

    // Get token configurations for BSC
    const tokens = await this.tokenConfigService.getActiveTokensByBlockchain('bsc');
    const nativeToken = tokens.find(t => t.tokenType === 'native');
    const erc20Tokens = tokens.filter(t => t.tokenType === 'bep20' && t.contractAddress);

    // Get last scanned block
    const lastScannedBlock = await this.getLastScannedBlock('bsc');
    const currentBlock = await this.bscBlockchainService.getBlockHeight();

    // Scan new blocks only (max 10 blocks at a time to avoid timeouts)
    const blocksToScan = Math.min(currentBlock - lastScannedBlock, 10);
    const startBlock = lastScannedBlock + 1;
    const endBlock = startBlock + blocksToScan;

    if (startBlock > currentBlock) {
      return; // No new blocks
    }

    this.logger.debug(
      `Scanning BSC blocks ${startBlock} to ${Math.min(endBlock, currentBlock)} for ${addresses.length} addresses and ${tokens.length} tokens`,
    );

    // Scan each block
    for (let blockNumber = startBlock; blockNumber <= Math.min(endBlock, currentBlock); blockNumber++) {
      try {
        // 1. Scan for native BNB transfers
        const block = await this.bscBlockchainService.getBlock(blockNumber);

        for (const tx of block.transactions) {
          const matchingAddress = addresses.find(
            (addr) => addr.address.toLowerCase() === tx.to?.toLowerCase(),
          );

          if (matchingAddress && parseFloat(tx.value) > 0 && nativeToken) {
            await this.handleDepositDetected({
              blockchain: 'bsc',
              txHash: tx.hash,
              userAddress: matchingAddress,
              amount: parseFloat(formatEther(tx.value)),
              assetCode: nativeToken.assetCode,
              blockNumber,
              confirmations: 1,
              fromAddress: tx.from,
            });
          }
        }

        // 2. Scan for BEP-20 token transfers
        if (erc20Tokens.length > 0) {
          const tokenAddresses = erc20Tokens
            .map(t => t.contractAddress!)
            .filter(addr => addr);

          const tokenTransfers = await this.bscBlockchainService.getTokenTransfersInBlock!(
            blockNumber,
            tokenAddresses,
          );

          for (const transfer of tokenTransfers) {
            // Check if transfer is to one of our watched addresses
            const matchingAddress = addresses.find(
              (addr) => addr.address.toLowerCase() === transfer.to.toLowerCase(),
            );

            if (matchingAddress) {
              // Find the token configuration
              const tokenConfig = erc20Tokens.find(
                t => t.contractAddress!.toLowerCase() === transfer.tokenAddress.toLowerCase(),
              );

              if (tokenConfig) {
                const amount = parseFloat(formatUnits(transfer.value, tokenConfig.decimals));

                // Check minimum deposit amount
                if (amount >= tokenConfig.minimumDeposit) {
                  await this.handleDepositDetected({
                    blockchain: 'bsc',
                    txHash: transfer.hash,
                    userAddress: matchingAddress,
                    amount,
                    assetCode: tokenConfig.assetCode,
                    blockNumber,
                    confirmations: 1,
                    fromAddress: transfer.from,
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        ErrorLogger.logError({
          service: 'WatchtowerService',
          method: 'scanBSCForDeposits',
          blockchain: 'bsc',
          blockNumber,
          error,
        });
        this.logger.error(`Error scanning BSC block ${blockNumber}. Details logged to ${ErrorLogger.getLogFilePath()}`);
      }
    }

    // Update last scanned block
    await this.updateLastScannedBlock('bsc', Math.min(endBlock, currentBlock));
  }

  /**
   * Start Ethereum blockchain watcher
   */
  private async startEthereumWatcher(): Promise<void> {
    const SCAN_INTERVAL = 15000;
    try {
      await this.ethereumBlockchainService.connect();
    } catch (error) {
      this.logger.error('Failed to start Ethereum watcher - blockchain connection failed:', error.message);
      this.logger.warn('⚠️ Ethereum deposit monitoring disabled. Check your ETH_RPC_URL and ETH_HOT_WALLET_PRIVATE_KEY configuration.');
      return;
    }
    const interval = setInterval(async () => {
      try {
        await this.scanEthereumForDeposits();
      } catch (error) {
        this.logger.error('Ethereum watcher error:', error);
      }
    }, SCAN_INTERVAL);
    this.scanIntervals.set('ethereum', interval);
    this.logger.log('✅ Ethereum watcher started');
  }

  /**
   * Scan Ethereum blockchain for deposits (both native ETH and ERC-20 tokens)
   */
  private async scanEthereumForDeposits(): Promise<void> {
    this.logger.log('Scanning Ethereum blockchain for deposits');
    
    const addresses = await this.addressModel.find({
      blockchain: 'ethereum',
      isWatched: true,
    });
    
    if (addresses.length === 0) {
      this.logger.warn('No Ethereum addresses to watch');
      return;
    }

    // Get token configurations for Ethereum
    const tokens = await this.tokenConfigService.getActiveTokensByBlockchain('ethereum');
    const nativeToken = tokens.find(t => t.tokenType === 'native');
    const erc20Tokens = tokens.filter(t => t.tokenType === 'erc20' && t.contractAddress);

    const lastScannedBlock = await this.getLastScannedBlock('ethereum');
    const currentBlock = await this.ethereumBlockchainService.getBlockHeight();
    const blocksToScan = Math.min(currentBlock - lastScannedBlock, 10);
    const startBlock = lastScannedBlock + 1;
    const endBlock = startBlock + blocksToScan;
    
    if (startBlock > currentBlock) {
      return;
    }
    
    this.logger.debug(
      `Scanning Ethereum blocks ${startBlock} to ${Math.min(endBlock, currentBlock)} for ${addresses.length} addresses and ${tokens.length} tokens`,
    );
    
    for (let blockNumber = startBlock; blockNumber <= Math.min(endBlock, currentBlock); blockNumber++) {
      try {
        // 1. Scan for native ETH transfers
        const block = await this.ethereumBlockchainService.getBlock(blockNumber);
        
        for (const tx of block.transactions) {
          const matchingAddress = addresses.find(
            (addr) => addr.address.toLowerCase() === tx.to?.toLowerCase(),
          );
          
          if (matchingAddress && parseFloat(tx.value) > 0 && nativeToken) {
            await this.handleDepositDetected({
              blockchain: 'ethereum',
              txHash: tx.hash,
              userAddress: matchingAddress,
              amount: parseFloat(formatEther(tx.value)),
              assetCode: nativeToken.assetCode,
              blockNumber,
              confirmations: 1,
              fromAddress: tx.from,
            });
          }
        }

        // 2. Scan for ERC-20 token transfers
        if (erc20Tokens.length > 0) {
          const tokenAddresses = erc20Tokens
            .map(t => t.contractAddress!)
            .filter(addr => addr);

          const tokenTransfers = await this.ethereumBlockchainService.getTokenTransfersInBlock!(
            blockNumber,
            tokenAddresses,
          );

          for (const transfer of tokenTransfers) {
            // Check if transfer is to one of our watched addresses
            const matchingAddress = addresses.find(
              (addr) => addr.address.toLowerCase() === transfer.to.toLowerCase(),
            );

            if (matchingAddress) {
              // Find the token configuration
              const tokenConfig = erc20Tokens.find(
                t => t.contractAddress!.toLowerCase() === transfer.tokenAddress.toLowerCase(),
              );

              if (tokenConfig) {
                const amount = parseFloat(formatUnits(transfer.value, tokenConfig.decimals));

                // Check minimum deposit amount
                if (amount >= tokenConfig.minimumDeposit) {
                  await this.handleDepositDetected({
                    blockchain: 'ethereum',
                    txHash: transfer.hash,
                    userAddress: matchingAddress,
                    amount,
                    assetCode: tokenConfig.assetCode,
                    blockNumber,
                    confirmations: 1,
                    fromAddress: transfer.from,
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        ErrorLogger.logError({
          service: 'WatchtowerService',
          method: 'scanEthereumForDeposits',
          blockchain: 'ethereum',
          blockNumber,
          error,
        });
        this.logger.error(`Error scanning Ethereum block ${blockNumber}. Details logged to ${ErrorLogger.getLogFilePath()}`);
      }
    }
    
    await this.updateLastScannedBlock('ethereum', Math.min(endBlock, currentBlock));
  }

  /**
   * Start Tron blockchain watcher
   */
  private async startTronWatcher(): Promise<void> {
    const SCAN_INTERVAL = 15000; // 15 seconds (Tron block time ~3s)

    try {
      await this.tronBlockchainService.connect();
    } catch (error) {
      this.logger.error('Failed to start Tron watcher - blockchain connection failed:', error.message);
      this.logger.warn('⚠️ Tron deposit monitoring disabled. Check your Tron configuration.');
      return;
    }

    const interval = setInterval(async () => {
      try {
        await this.scanTronForDeposits();
      } catch (error) {
        this.logger.error('Tron watcher error:', error);
      }
    }, SCAN_INTERVAL);

    this.scanIntervals.set('tron', interval);
    this.logger.log('✅ Tron watcher started');
  }

  /**
   * Scan Tron blockchain for deposits (both native TRX and TRC-20 tokens)
   */
  private async scanTronForDeposits(): Promise<void> {
    this.logger.log('Scanning Tron blockchain for deposits');
    
    // Get all watched addresses on Tron
    const addresses = await this.addressModel.find({
      blockchain: 'tron',
      isWatched: true,
    });

    this.logger.log(`Found ${addresses.length} addresses to watch on Tron`);

    if (addresses.length === 0) {
      return;
    }

    // Get token configurations for Tron
    const tokens = await this.tokenConfigService.getActiveTokensByBlockchain('tron');
    const nativeToken = tokens.find(t => t.tokenType === 'native');
    const trc20Tokens = tokens.filter(t => t.tokenType === 'trc20' && t.contractAddress);

    // Get last scanned block
    const lastScannedBlock = await this.getLastScannedBlock('tron');
    const currentBlock = await this.tronBlockchainService.getBlockHeight();

    // Scan new blocks only (max 10 blocks at a time to avoid timeouts)
    const blocksToScan = Math.min(currentBlock - lastScannedBlock, 10);
    const startBlock = lastScannedBlock + 1;
    const endBlock = startBlock + blocksToScan;

    if (startBlock > currentBlock) {
      this.logger.log(`No new blocks to scan on Tron`);
      return;
    }

    this.logger.debug(
      `Scanning Tron blocks ${startBlock} to ${Math.min(endBlock, currentBlock)} (${addresses.length} addresses, ${tokens.length} tokens)`,
    );

    // Scan each block
    for (let blockNumber = startBlock; blockNumber <= Math.min(endBlock, currentBlock); blockNumber++) {
      try {
        // 1. Scan for native TRX transfers
        if (nativeToken) {
          const block = await this.tronBlockchainService.getBlock(blockNumber);
          for (const tx of block.transactions) {
            const matchingAddress = addresses.find(
              (addr) => addr.address.toLowerCase() === tx.to.toLowerCase(),
            );

            if (matchingAddress && parseFloat(tx.value) > 0) {
              const amountTRX = parseFloat(tx.value) / 1000000; // Convert SUN to TRX

              // Check minimum deposit amount
              if (amountTRX >= nativeToken.minimumDeposit) {
                await this.handleDepositDetected({
                  blockchain: 'tron',
                  txHash: tx.hash,
                  userAddress: matchingAddress,
                  amount: amountTRX,
                  assetCode: nativeToken.assetCode,
                  blockNumber,
                  confirmations: tx.confirmations,
                  fromAddress: tx.from,
                });
              }
            }
          }
        }

        // 2. Scan for TRC-20 token transfers
        if (trc20Tokens.length > 0) {
          const tokenAddresses = trc20Tokens
            .map(t => t.contractAddress!)
            .filter(addr => addr);

          const tokenTransfers = await this.tronBlockchainService.getTokenTransfersInBlock!(
            blockNumber,
            tokenAddresses,
          );

          this.logger.log(`Found ${tokenTransfers.length} token transfers in block ${blockNumber}`);

          for (const transfer of tokenTransfers) {
            // Check if transfer is to one of our watched addresses
            this.logger.log(`Checking transfer ${transfer.hash} to address ${transfer.to}`);
            const matchingAddress = addresses.find(
              (addr) => addr.address.toLowerCase() === transfer.to.toLowerCase(),
            );

            if (matchingAddress) {
              // Find the token configuration
              const tokenConfig = trc20Tokens.find(
                t => t.contractAddress!.toLowerCase() === transfer.tokenAddress.toLowerCase(),
              );

              if (tokenConfig) {
                const amount = parseFloat(formatUnits(transfer.value, tokenConfig.decimals));

                // Check minimum deposit amount
                if (amount >= tokenConfig.minimumDeposit) {
                  await this.handleDepositDetected({
                    blockchain: 'tron',
                    txHash: transfer.hash,
                    userAddress: matchingAddress,
                    amount,
                    assetCode: tokenConfig.assetCode,
                    blockNumber,
                    confirmations: 1,
                    fromAddress: transfer.from,
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        ErrorLogger.logError({
          service: 'WatchtowerService',
          method: 'scanTronForDeposits',
          blockchain: 'tron',
          blockNumber,
          error,
        });
        this.logger.error(`Error scanning Tron block ${blockNumber}. Details logged to ${ErrorLogger.getLogFilePath()}`);
      }
    }

    // Update last scanned block
    await this.updateLastScannedBlock('tron', Math.min(endBlock, currentBlock));
  }

  /**
   * Start Bitcoin blockchain watcher
   */
  private async startBitcoinWatcher(): Promise<void> {
    const SCAN_INTERVAL = 15000;
    try {
      await this.bitcoinBlockchainService.connect();
    } catch (error) {
      this.logger.error('Failed to start Bitcoin watcher - blockchain connection failed:', error.message);
      this.logger.warn('⚠️ Bitcoin deposit monitoring disabled. Check your Bitcoin configuration.');
      return;
    }
    const interval = setInterval(async () => {
      try {
        await this.scanBitcoinForDeposits();
      } catch (error) {
        this.logger.error('Bitcoin watcher error:', error);
      }
    }, SCAN_INTERVAL);
    this.scanIntervals.set('bitcoin', interval);
    this.logger.log('✅ Bitcoin watcher started');
  }

  /**
   * Scan Bitcoin blockchain for deposits
   */
  private async scanBitcoinForDeposits(): Promise<void> {
    this.logger.log('Scanning Bitcoin blockchain for deposits');
    const addresses = await this.addressModel.find({
      blockchain: 'bitcoin',
      isWatched: true,
    });
    if (addresses.length === 0) {
      return;
    }
    
    const lastScannedBlock = await this.getLastScannedBlock('bitcoin');
    const currentBlock = await this.bitcoinBlockchainService.getBlockHeight();
    
    // Validate block numbers
    if (!currentBlock || isNaN(currentBlock) || !lastScannedBlock || isNaN(lastScannedBlock)) {
      this.logger.error(`Invalid block numbers: current=${currentBlock}, last=${lastScannedBlock}`);
      return;
    }
    
    const blocksToScan = Math.min(currentBlock - lastScannedBlock, 5);
    const startBlock = lastScannedBlock + 1;
    const endBlock = startBlock + blocksToScan;
    
    if (startBlock > currentBlock) {
      return;
    }
    
    this.logger.debug(
      `Scanning Bitcoin blocks ${startBlock} to ${Math.min(endBlock, currentBlock)}`,
    );
    
    for (let blockNumber = startBlock; blockNumber <= Math.min(endBlock, currentBlock); blockNumber++) {
      try {
        const block = await this.bitcoinBlockchainService.getBlock(blockNumber);
        for (const tx of block.transactions) {
          const matchingAddress = addresses.find(
            (addr) => addr.address === tx.to,
          );
          if (matchingAddress && parseFloat(tx.value) > 0) {
            const amountBTC = parseFloat(tx.value) / 100000000;
            await this.handleDepositDetected({
              blockchain: 'bitcoin',
              txHash: tx.hash,
              userAddress: matchingAddress,
              amount: amountBTC,
              assetCode: 'BTC',
              blockNumber,
              confirmations: tx.confirmations,
              fromAddress: tx.from,
            });
          }
        }
      } catch (error) {
        ErrorLogger.logError({
          service: 'WatchtowerService',
          method: 'scanBitcoinForDeposits',
          blockchain: 'bitcoin',
          blockNumber,
          error,
        });
        this.logger.error(`Error scanning Bitcoin block ${blockNumber}. Details logged to ${ErrorLogger.getLogFilePath()}`);
      }
    }
    
    // Only update if endBlock is valid
    const finalBlock = Math.min(endBlock, currentBlock);
    if (!isNaN(finalBlock)) {
      await this.updateLastScannedBlock('bitcoin', finalBlock);
    }
  }

  /**
   * Start Stellar blockchain watcher
   */
  private async startStellarWatcher(): Promise<void> {
    const SCAN_INTERVAL = 10000; // 10 seconds (Stellar ledger time ~5s)

    try {
      await this.stellarBlockchainService.connect();
    } catch (error) {
      this.logger.error('Failed to start Stellar watcher - blockchain connection failed:', error.message);
      this.logger.warn('⚠️ Stellar deposit monitoring disabled. Check your Stellar configuration.');
      return;
    }

    const interval = setInterval(async () => {
      try {
        await this.scanStellarForDeposits();
      } catch (error) {
        this.logger.error('Stellar watcher error:', error);
      }
    }, SCAN_INTERVAL);

    this.scanIntervals.set('stellar', interval);
    this.logger.log('✅ Stellar watcher started');
  }

  /**
   * Scan Stellar blockchain for deposits (both native XLM and Stellar Assets)
   */
  private async scanStellarForDeposits(): Promise<void> {
    this.logger.log('Scanning Stellar blockchain for deposits');
    
    // Get all watched addresses on Stellar
    const addresses = await this.addressModel.find({
      blockchain: 'stellar',
      isWatched: true,
    });

    this.logger.log(`Found ${addresses.length} addresses to watch on Stellar`);

    if (addresses.length === 0) {
      return;
    }

    // Get token configurations for Stellar
    const tokens = await this.tokenConfigService.getActiveTokensByBlockchain('stellar');
    this.logger.log(`Loaded ${tokens.length} Stellar token configurations: ${tokens.map(t => `${t.assetCode}(${t.tokenType})`).join(', ')}`);
    
    const nativeToken = tokens.find(t => t.tokenType === 'native');
    const stellarAssets = tokens.filter(t => t.tokenType !== 'native' && t.contractAddress);
    
    this.logger.log(`Native token: ${nativeToken?.assetCode || 'none'}`);
    this.logger.log(`Stellar assets to scan: ${stellarAssets.length} - ${stellarAssets.map(t => `${t.symbol}:${t.contractAddress?.substring(0, 8)}...`).join(', ')}`);

    // Get last scanned ledger
    const lastScannedLedger = await this.getLastScannedBlock('stellar');
    const currentLedger = await this.stellarBlockchainService.getBlockHeight();

    // Scan new ledgers only (max 20 ledgers at a time to avoid timeouts)
    const ledgersToScan = Math.min(currentLedger - lastScannedLedger, 20);
    const startLedger = lastScannedLedger + 1;
    const endLedger = startLedger + ledgersToScan;

    if (startLedger > currentLedger) {
      this.logger.log(`No new ledgers to scan on Stellar`);
      return;
    }

    this.logger.debug(
      `Scanning Stellar ledgers ${startLedger} to ${Math.min(endLedger, currentLedger)} (${addresses.length} addresses, ${tokens.length} tokens)`,
    );

    // Scan each ledger
    for (let ledgerNumber = startLedger; ledgerNumber <= Math.min(endLedger, currentLedger); ledgerNumber++) {
      try {
        // Get all payments in this ledger
        const response = await this.stellarBlockchainService.getBlock(ledgerNumber);
        
        for (const tx of response.transactions) {
          // Check if payment is to one of our watched addresses
          const matchingAddress = addresses.find(
            (addr) => addr.address === tx.to
          );

          if (matchingAddress && parseFloat(tx.value) > 0) {
            const amount = parseFloat(tx.value);
            
            // Determine which token this is
            let tokenConfig = nativeToken;
            
            // For now, assume native XLM (Stellar asset detection requires more work)
            // In full implementation, check operation details for asset_code and asset_issuer
            
            if (tokenConfig && amount >= tokenConfig.minimumDeposit) {
              await this.handleDepositDetected({
                blockchain: 'stellar',
                txHash: tx.hash,
                userAddress: matchingAddress,
                amount,
                assetCode: tokenConfig.assetCode,
                blockNumber: ledgerNumber,
                confirmations: tx.confirmations,
                fromAddress: tx.from,
              });
            }
          }
        }

        // Scan for Stellar asset transfers (if configured)
        if (stellarAssets.length > 0) {
          const assetConfigs = stellarAssets.map(t => ({
            assetCode: t.symbol || '',
            assetIssuer: t.contractAddress || '',
          }));

          this.logger.debug(`Scanning ledger ${ledgerNumber} for assets: ${assetConfigs.map(t => `${t.assetCode}:${t.assetIssuer}`).join(', ')}`);

          const assetTransfers = await this.stellarBlockchainService.getTokenTransfersInBlock!(
            ledgerNumber,
            assetConfigs.map(t => `${t.assetCode}:${t.assetIssuer}`),
          );

          this.logger.log(`Found ${assetTransfers.length} asset transfers in ledger ${ledgerNumber}`);

          for (const transfer of assetTransfers) {
            this.logger.debug(`Processing transfer: ${transfer.hash} from ${transfer.from} to ${transfer.to} amount: ${transfer.value} token: ${transfer.tokenAddress}`);
            
            // Check if transfer is to one of our watched addresses
            const matchingAddress = addresses.find(
              (addr) => addr.address === transfer.to
            );

            if (matchingAddress) {
              this.logger.log(`✅ Transfer matches watched address ${transfer.to} for user ${matchingAddress.userId}`);
              
              // Find the token configuration
              const [assetCode, assetIssuer] = transfer.tokenAddress.split(':');
              this.logger.debug(`Looking for token config: symbol=${assetCode}, issuer=${assetIssuer}`);
              
              const tokenConfig = stellarAssets.find(
                t => t.symbol === assetCode && t.contractAddress === assetIssuer,
              );

              if (tokenConfig) {
                const amount = parseFloat(transfer.value);
                this.logger.log(`Token config found: ${tokenConfig.assetCode}, amount: ${amount}, min: ${tokenConfig.minimumDeposit}`);

                // Check minimum deposit amount
                if (amount >= tokenConfig.minimumDeposit) {
                  this.logger.log(`💰 Triggering deposit detection for ${amount} ${tokenConfig.assetCode}`);
                  await this.handleDepositDetected({
                    blockchain: 'stellar',
                    txHash: transfer.hash,
                    userAddress: matchingAddress,
                    amount,
                    assetCode: tokenConfig.assetCode,
                    blockNumber: ledgerNumber,
                    confirmations: 1,
                    fromAddress: transfer.from,
                  });
                } else {
                  this.logger.warn(`Amount ${amount} is below minimum deposit ${tokenConfig.minimumDeposit} for ${tokenConfig.assetCode}`);
                }
              } else {
                this.logger.warn(`No token config found for ${assetCode}:${assetIssuer}`);
              }
            }
          }
        }
      } catch (error) {
        // Handle ledger too old error (410) by skipping to more recent ledgers
        if (error.message?.includes('too old and no longer available')) {
          this.logger.warn(`Skipping old Stellar ledger ${ledgerNumber}, updating to current ledger`);
          // Update scan state to current ledger to skip old ledgers
          await this.updateLastScannedBlock('stellar', currentLedger);
          break; // Exit the loop since we've updated to current
        }
        
        ErrorLogger.logError({
          service: 'WatchtowerService',
          method: 'scanStellarForDeposits',
          blockchain: 'stellar',
          blockNumber: ledgerNumber,
          error,
        });
        this.logger.error(`Error scanning Stellar ledger ${ledgerNumber}. Details logged to ${ErrorLogger.getLogFilePath()}`);
      }
    }

    // Update last scanned ledger
    await this.updateLastScannedBlock('stellar', Math.min(endLedger, currentLedger));
  }

  /**
   * Handle detected deposit
   */
  private async handleDepositDetected(params: DepositDetectedParams): Promise<void> {
    const { blockchain, txHash, userAddress, amount, assetCode, blockNumber, fromAddress } =
      params;

    // Check if deposit already exists
    const existing = await this.depositModel.findOne({ txHash });
    if (existing) {
      return; // Already detected
    }

    // Get required confirmations
    const requiredConfirmations = this.getRequiredConfirmations(blockchain);

    // Get token configuration to determine correct decimals
    const tokenConfig = await this.tokenConfigService.getTokenByAssetCode(assetCode);
    const decimals = tokenConfig?.decimals || (this.isCrypto(assetCode) ? 8 : 2);
    const amountMinor = Math.round(amount * Math.pow(10, decimals));

    this.logger.debug(`Converting ${amount} ${assetCode} to minor units: ${amountMinor} (decimals: ${decimals})`);

    // Create deposit record
    const deposit = new this.depositModel({
      userId: userAddress.userId,
      blockchain,
      assetCode,
      txHash,
      fromAddress,
      toAddress: userAddress.address,
      amount,
      amountMinor,
      status: 'pending',
      confirmations: 1,
      requiredConfirmations,
      detectedAt: new Date(),
      blockNumber,
    });

    await deposit.save();

    this.logger.log(
      `📥 Deposit detected: ${amount} ${assetCode} for user ${userAddress.userId} (tx: ${txHash})`,
    );

    // Add to confirmation tracking queue
    await this.detectionQueue.add(
      'track-confirmations',
      {
        depositId: String(deposit._id),
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }

  /**
   * Get required confirmations per blockchain
   */
  private getRequiredConfirmations(blockchain: SupportedBlockchain): number {
    const confirmations: Record<SupportedBlockchain, number> = {
      bitcoin: 6, // ~1 hour
      bsc: 15, // ~45 seconds
      ethereum: 12, // ~3 minutes
      stellar: 1, // ~5 seconds
      tron: 19, // ~1 minute (Tron block time ~3s)
    };
    return confirmations[blockchain];
  }

  /**
   * Convert amount to minor units (satoshis, wei, etc.)
   */
  private toMinorUnits(amount: number, assetCode: string): number {
    // Crypto uses 8 decimals, fiat uses 2
    const decimals = this.isCrypto(assetCode) ? 8 : 2;
    return Math.round(amount * Math.pow(10, decimals));
  }

  /**
   * Check if asset is cryptocurrency
   */
  private isCrypto(assetCode: string): boolean {
    // Extract base symbol from blockchain-specific codes (e.g., USDT_BSC → USDT)
    const baseSymbol = getBaseSymbol(assetCode).toUpperCase();
    const cryptoAssets = ['BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'BUSD', 'XLM', 'TRX'];
    return cryptoAssets.includes(baseSymbol);
  }

  /**
   * Get last scanned block for a blockchain
   */
  private async getLastScannedBlock(blockchain: SupportedBlockchain): Promise<number> {
    let scanState = await this.scanStateModel.findOne({ blockchain });

    if (!scanState) {
      // Initialize scan state with current block - 100 (to catch recent deposits)
      let startBlock = 0;

      try {
        if (blockchain === 'bsc') {
          const currentBlock = await this.bscBlockchainService.getBlockHeight();
          startBlock = Math.max(0, currentBlock - 100);
        } else if (blockchain === 'ethereum') {
          const currentBlock = await this.ethereumBlockchainService.getBlockHeight();
          startBlock = Math.max(0, currentBlock - 100);
        } else if (blockchain === 'bitcoin') {
          const currentBlock = await this.bitcoinBlockchainService.getBlockHeight();
          startBlock = Math.max(0, currentBlock - 10);
        } else if (blockchain === 'tron') {
          const currentBlock = await this.tronBlockchainService.getBlockHeight();
          startBlock = Math.max(0, currentBlock - 10);
        } else if (blockchain === 'stellar') {
          const currentBlock = await this.stellarBlockchainService.getBlockHeight();
          startBlock = Math.max(0, currentBlock - 20); // Stellar has fast finality, scan last 20 ledgers
        }
      } catch (error) {
        this.logger.error(`Error getting current block height for ${blockchain}:`, error);
      }

      scanState = new this.scanStateModel({
        blockchain,
        lastScannedBlock: startBlock,
        lastScanAt: new Date(),
      });
      await scanState.save();
    }

    return scanState.lastScannedBlock;
  }

  /**
   * Update last scanned block for a blockchain
   */
  private async updateLastScannedBlock(
    blockchain: SupportedBlockchain,
    blockNumber: number,
  ): Promise<void> {
    await this.scanStateModel.findOneAndUpdate(
      { blockchain },
      {
        lastScannedBlock: blockNumber,
        lastScanAt: new Date(),
      },
      { upsert: true },
    );
  }

  /**
   * Get watcher status
   */
  getStatus(): {
    isRunning: boolean;
    activeWatchers: string[];
  } {
    return {
      isRunning: this.isRunning,
      activeWatchers: Array.from(this.scanIntervals.keys()),
    };
  }
}


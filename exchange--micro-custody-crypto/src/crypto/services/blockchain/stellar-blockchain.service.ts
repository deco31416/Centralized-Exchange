import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  IBlockchainService,
  Transaction,
  CreateTxParams,
  UnsignedTransaction,
  SignedTransaction,
  GasFeeEstimate,
  Block,
  TokenTransfer,
} from './blockchain.interface';

/**
 * Stellar blockchain service implementation
 * Supports mainnet and testnet via Horizon API
 * 
 * Standard: Stellar protocol with native XLM and Stellar Assets (tokens)
 * Address format: Public key (56 characters, starts with 'G')
 * Native token: XLM (Lumens, 7 decimals)
 */
@Injectable()
export class StellarBlockchainService implements IBlockchainService {
  private readonly logger = new Logger(StellarBlockchainService.name);
  private horizonUrl: string;
  private networkType: 'mainnet' | 'testnet';
  private connected: boolean = false;
  private networkPassphrase: string;

  // Stellar uses stroops (1 XLM = 10,000,000 stroops)
  private readonly STROOPS_PER_XLM = 10000000;

  constructor(networkType: 'mainnet' | 'testnet') {
    this.networkType = networkType;
    
    if (networkType === 'mainnet') {
      this.horizonUrl = 'https://horizon.stellar.org';
      this.networkPassphrase = 'Public Global Stellar Network ; September 2015';
    } else {
      this.horizonUrl = 'https://horizon-testnet.stellar.org';
      this.networkPassphrase = 'Test SDF Network ; September 2015';
    }
  }

  /**
   * Connect to Stellar network (validate Horizon API access)
   */
  async connect(): Promise<void> {
    try {
      const response = await axios.get(`${this.horizonUrl}/`, {
        timeout: 10000,
      });

      if (response.data) {
        this.connected = true;
        const network = this.networkType.toUpperCase();
        this.logger.log(`🔗 Connected to Stellar ${network} (Horizon)`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to connect to Stellar ${this.networkType}:`, error.message || error);
      throw error;
    }
  }

  /**
   * Disconnect from Stellar network
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.logger.log('Disconnected from Stellar');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get XLM balance of an address
   */
  async getBalance(address: string): Promise<number> {
    try {
      const response = await axios.get(
        `${this.horizonUrl}/accounts/${address}`,
        { timeout: 10000 }
      );

      const account = response.data;
      
      // Find native XLM balance
      const nativeBalance = account.balances.find(
        (b: any) => b.asset_type === 'native'
      );

      return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Account not found means 0 balance
        return 0;
      }
      this.logger.error(`Failed to get balance for ${address}:`, error.message || error);
      return 0;
    }
  }

  /**
   /**
    * Get Stellar asset balance
    * @param address - Stellar account address
    * @param tokenAddress - Asset identifier in the format "ASSET_CODE:ASSET_ISSUER"
    * Implements IBlockchainService.getTokenBalance(address: string, tokenAddress: string): Promise<number>
    */
   async getTokenBalance(address: string, tokenAddress: string): Promise<number> {
     try {
       // Parse tokenAddress as "ASSET_CODE:ASSET_ISSUER"
       const [assetCode, assetIssuer] = tokenAddress.split(':');
       if (!assetCode || !assetIssuer) {
         throw new Error('Invalid tokenAddress format. Expected "ASSET_CODE:ASSET_ISSUER"');
       }
       const response = await axios.get(
         `${this.horizonUrl}/accounts/${address}`,
         { timeout: 10000 }
       );

      const account = response.data;
      
      // Find the specific asset balance
      const assetBalance = account.balances.find(
        (b: any) => 
          b.asset_code === assetCode && 
          b.asset_issuer === assetIssuer
      );

      return assetBalance ? parseFloat(assetBalance.balance) : 0;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return 0;
      }
      this.logger.error(`Failed to get token balance for ${address}:`, error.message || error);
      return 0;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<Transaction> {
    try {
      const response = await axios.get(
        `${this.horizonUrl}/transactions/${txHash}`,
        { timeout: 10000 }
      );

      const tx = response.data;
      
      // Get operations for this transaction to extract from/to/amount
      const opsResponse = await axios.get(
        `${this.horizonUrl}/transactions/${txHash}/operations`,
        { timeout: 10000 }
      );

      const operations = opsResponse.data._embedded.records;
      
      // Find first payment operation
      const paymentOp = operations.find(
        (op: any) => op.type === 'payment' || op.type === 'create_account'
      );

      let from = '';
      let to = '';
      let value = '0';

      if (paymentOp) {
        from = paymentOp.from || paymentOp.funder || '';
        to = paymentOp.to || paymentOp.account || '';
        value = paymentOp.amount || paymentOp.starting_balance || '0';
      }

      return {
        hash: tx.hash,
        from,
        to,
        value,
        blockNumber: tx.ledger,
        timestamp: new Date(tx.created_at).getTime() / 1000,
        confirmations: 1, // Stellar has fast finality
      };
    } catch (error: any) {
      this.logger.error(`Failed to get transaction ${txHash}:`, error.message || error);
      throw error;
    }
  }

  /**
   * Get current ledger (block) height
   */
  async getBlockHeight(): Promise<number> {
    try {
      const response = await axios.get(
        `${this.horizonUrl}/ledgers?order=desc&limit=1`,
        { timeout: 10000 }
      );

      const ledgers = response.data._embedded.records;
      return ledgers[0]?.sequence || 0;
    } catch (error: any) {
      this.logger.error('Failed to get block height:', error.message || error);
      throw error;
    }
  }

  /**
   * Get ledger (block) by number
   */
  async getBlock(blockNumber: number): Promise<Block> {
    try {
      const response = await axios.get(
        `${this.horizonUrl}/ledgers/${blockNumber}`,
        { timeout: 10000 }
      );

      const ledger = response.data;

      // Get transactions in this ledger
      const txsResponse = await axios.get(
        `${this.horizonUrl}/ledgers/${blockNumber}/transactions?limit=200`,
        { timeout: 10000 }
      );

      const txs = txsResponse.data._embedded.records;
      const transactions: Transaction[] = [];

      // Process transactions (limit to first 50 for performance)
      for (const tx of txs.slice(0, 50)) {
        try {
          const fullTx = await this.getTransaction(tx.hash);
          transactions.push(fullTx);
        } catch (error) {
          // Skip failed transaction fetches
        }
      }

      return {
        number: ledger.sequence,
        hash: ledger.hash,
        timestamp: new Date(ledger.closed_at).getTime() / 1000,
        transactions,
      };
    } catch (error: any) {
      // Handle 410 Gone error (ledger too old)
      if (error.response?.status === 410) {
        this.logger.warn(`Ledger ${blockNumber} is too old and no longer available on Horizon API`);
        throw new Error(`Ledger ${blockNumber} is too old and no longer available`);
      }
      this.logger.error(`Failed to get block ${blockNumber}:`, error.message || error);
      throw error;
    }
  }

  /**
   /**
   * Get asset (token) transfers in a ledger
   */
  async getTokenTransfersInBlock(
    blockNumber: number,
    tokenAddresses: string[]
  ): Promise<TokenTransfer[]> {
    try {
      const transfers: TokenTransfer[] = [];

      // Parse tokenAddresses from "ASSET_CODE:ASSET_ISSUER" format
      const assetConfigs = tokenAddresses.map(addr => {
        const [assetCode, assetIssuer] = addr.split(':');
        return { assetCode, assetIssuer };
      });

      this.logger.debug(`Scanning ledger ${blockNumber} for assets: ${assetConfigs.map(a => `${a.assetCode}:${a.assetIssuer.substring(0, 8)}...`).join(', ')}`);

      // Get all operations in this ledger (not just payments)
      // This includes: payment, create_claimable_balance, claim_claimable_balance, etc.
      const response = await axios.get(
        `${this.horizonUrl}/ledgers/${blockNumber}/operations?limit=200`,
        { timeout: 15000 }
      );

      const operations = response.data._embedded.records;
      this.logger.debug(`Found ${operations.length} total operations in ledger ${blockNumber}`);

      for (const op of operations) {
        this.logger.debug(`Operation: type=${op.type}, asset_type=${op.asset_type || 'N/A'}, asset_code=${op.asset_code || op.asset || 'N/A'}`);

        // Handle different operation types
        if (op.type === 'payment') {
          // Direct payment operation
          const matchingAsset = assetConfigs.find(
            (asset) =>
              op.asset_code === asset.assetCode &&
              op.asset_issuer === asset.assetIssuer
          );

          if (matchingAsset) {
            this.logger.log(`✅ Found matching payment: ${op.asset_code} from ${op.from} to ${op.to} amount ${op.amount}`);
            transfers.push({
              hash: op.transaction_hash,
              from: op.from,
              to: op.to,
              value: op.amount,
              tokenAddress: `${op.asset_code}:${op.asset_issuer}`,
              blockNumber,
              timestamp: new Date(op.created_at).getTime() / 1000,
              logIndex: 0,
            });
          }
        } else if (op.type === 'create_claimable_balance') {
          // Claimable balance created (Albedo uses this)
          // The asset info is in the 'asset' field as "CODE:ISSUER" format
          const assetParts = op.asset?.split(':') || [];
          const assetCode = assetParts[0];
          const assetIssuer = assetParts[1];

          const matchingAsset = assetConfigs.find(
            (asset) =>
              assetCode === asset.assetCode &&
              assetIssuer === asset.assetIssuer
          );

          if (matchingAsset && op.claimants) {
            // Check if any claimant matches our watched addresses
            for (const claimant of op.claimants) {
              const claimantAddress = claimant.destination;
              
              this.logger.log(`✅ Found claimable balance: ${assetCode} amount ${op.amount} for claimant ${claimantAddress}`);
              transfers.push({
                hash: op.transaction_hash,
                from: op.source_account,
                to: claimantAddress,
                value: op.amount,
                tokenAddress: `${assetCode}:${assetIssuer}`,
                blockNumber,
                timestamp: new Date(op.created_at).getTime() / 1000,
                logIndex: 0,
              });
            }
          }
        } else if (op.type === 'claim_claimable_balance') {
          // When user claims a claimable balance
          // We need to fetch the claimable balance details to get asset info
          try {
            const cbResponse = await axios.get(
              `${this.horizonUrl}/claimable_balances/${op.balance_id}`,
              { timeout: 10000 }
            );
            
            const assetParts = cbResponse.data.asset?.split(':') || [];
            const assetCode = assetParts[0];
            const assetIssuer = assetParts[1];

            const matchingAsset = assetConfigs.find(
              (asset) =>
                assetCode === asset.assetCode &&
                assetIssuer === asset.assetIssuer
            );

            if (matchingAsset) {
              this.logger.log(`✅ Found claimed balance: ${assetCode} amount ${cbResponse.data.amount} by ${op.source_account}`);
              transfers.push({
                hash: op.transaction_hash,
                from: op.sponsor || 'claimable_balance',
                to: op.source_account,
                value: cbResponse.data.amount,
                tokenAddress: `${assetCode}:${assetIssuer}`,
                blockNumber,
                timestamp: new Date(op.created_at).getTime() / 1000,
                logIndex: 0,
              });
            }
          } catch (error) {
            this.logger.warn(`Could not fetch claimable balance ${op.balance_id}: ${error.message}`);
          }
        }
      }

      this.logger.debug(`Extracted ${transfers.length} matching transfers from ledger ${blockNumber}`);
      return transfers;
    } catch (error: any) {
      this.logger.error(`Failed to get token transfers in block ${blockNumber}:`, error.message || error);
      return [];
    }
  }

  /**
   * Create an unsigned transaction
   * Note: Stellar transactions require sequence number from the account
   */
  async createTransaction(params: CreateTxParams): Promise<UnsignedTransaction> {
    try {
      // For Stellar, we need the source account to get sequence number
      // This would require stellar-sdk for proper transaction building
      this.logger.warn('Stellar transaction creation requires stellar-sdk package');
      
      const amountStroops = Math.round(params.amount * this.STROOPS_PER_XLM);

      return {
        to: params.to,
        value: amountStroops.toString(),
        data: JSON.stringify({
          asset: params.assetCode,
          amount: params.amount,
        }),
      };
    } catch (error: any) {
      this.logger.error('Failed to create Stellar transaction:', error.message || error);
      throw error;
    }
  }

  /**
   * Sign a Stellar transaction
   * Note: In production, use stellar-sdk with keypair
   */
  async signTransaction(
    tx: UnsignedTransaction,
    _privateKey: string,
  ): Promise<SignedTransaction> {
    try {
      this.logger.warn('Stellar transaction signing requires stellar-sdk package with Keypair');
      
      // In production, use stellar-sdk:
      // const StellarSdk = require('stellar-sdk');
      // const sourceKeypair = StellarSdk.Keypair.fromSecret(privateKey);
      // const transaction = new StellarSdk.TransactionBuilder(account, {...})
      //   .addOperation(StellarSdk.Operation.payment({...}))
      //   .build();
      // transaction.sign(sourceKeypair);
      // const xdr = transaction.toEnvelope().toXDR('base64');
      
      return {
        raw: tx.data || '',
        hash: '',
      };
    } catch (error: any) {
      this.logger.error('Failed to sign Stellar transaction:', error.message || error);
      throw error;
    }
  }

  /**
   * Broadcast a signed transaction
   */
  async broadcastTransaction(tx: SignedTransaction | string): Promise<string> {
    try {
      const xdr = typeof tx === 'string' ? tx : tx.raw;

      const response = await axios.post(
        `${this.horizonUrl}/transactions`,
        { tx: xdr },
        { 
          timeout: 10000,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      if (response.data?.hash) {
        const txHash = response.data.hash;
        this.logger.log(`✅ Stellar transaction broadcasted: ${txHash}`);
        return txHash;
      }

      throw new Error(response.data?.extras?.result_codes?.transaction || 'Broadcast failed');
    } catch (error: any) {
      this.logger.error('Failed to broadcast Stellar transaction:', error.message || error);
      throw error;
    }
  }

  /**
   * Validate if address is valid Stellar address
   */
  isValidAddress(address: string): boolean {
    try {
      // Stellar public keys are 56 characters and start with 'G'
      // Secret keys start with 'S' but we don't accept those as addresses
      const stellarPublicKeyRegex = /^G[A-Z2-7]{55}$/;
      return stellarPublicKeyRegex.test(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Estimate transaction fee
   * Stellar uses a base fee per operation
   */
  async estimateGasFee(_tx: CreateTxParams): Promise<GasFeeEstimate> {
    try {
      // Get current base fee from network
      const response = await axios.get(
        `${this.horizonUrl}/ledgers?order=desc&limit=1`,
        { timeout: 10000 }
      );

      const ledger = response.data._embedded.records[0];
      const baseFee = ledger?.base_fee_in_stroops || 100; // Default 100 stroops
      
      // Convert stroops to XLM (typically 0.00001 XLM for 100 stroops)
      const feeInXLM = baseFee / this.STROOPS_PER_XLM;

      return {
        fee: feeInXLM,
        assetCode: 'XLM',
      };
    } catch (error: any) {
      this.logger.error('Failed to estimate fee:', error.message || error);
      return { fee: 0.00001, assetCode: 'XLM' }; // Default minimal fee
    }
  }

  /**
   * Get network passphrase
   */
  getNetworkPassphrase(): string {
    return this.networkPassphrase;
  }

  /**
   * Get Horizon URL
   */
  getHorizonUrl(): string {
    return this.horizonUrl;
  }
}

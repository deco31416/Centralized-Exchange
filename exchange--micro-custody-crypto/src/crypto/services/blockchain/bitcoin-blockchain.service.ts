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
} from './blockchain.interface';
import { ConfigService } from '@nestjs/config';

/**
 * Bitcoin blockchain service implementation using Bitcoin Core JSON-RPC
 * Supports both mainnet and testnet (works with self-hosted nodes or public RPCs)
 */
@Injectable()
export class BitcoinBlockchainService implements IBlockchainService {
  private readonly logger = new Logger(BitcoinBlockchainService.name);
  private networkType: 'mainnet' | 'testnet';
  private rpcUrl: string;
  private rpcUser: string;
  private rpcPassword: string;
  private connected: boolean = false;
  private configService: ConfigService;

  constructor(networkType: 'mainnet' | 'testnet', configService: ConfigService) {
    this.configService = configService;
    this.networkType = networkType;
    this.rpcUrl = this.configService.get('BTC_RPC_URL') || 'http://localhost:8332';
    this.rpcUser = this.configService.get('BTC_RPC_USER') || '';
    this.rpcPassword = this.configService.get('BTC_RPC_PASSWORD') || '';
  }

  /**
   * Perform a JSON-RPC call to the Bitcoin node
   */
  private async rpcCall(method: string, params: any[] = []): Promise<any> {
    try {
      const auth = this.rpcUser && this.rpcPassword
        ? { username: this.rpcUser, password: this.rpcPassword }
        : undefined;

      const response = await axios.post(
        this.rpcUrl,
        {
          jsonrpc: '2.0',
          id: Date.now().toString(),
          method,
          params,
        },
        {
          auth,
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (response.data?.error) {
        const rpcError = response.data.error;
        throw new Error(`RPC Error [${rpcError.code}]: ${rpcError.message}`);
      }

      return response.data.result;
    } catch (error: any) {
      if (error.response) {
        this.logger.error(`RPC ${method} failed HTTP ${error.response.status}: ${error.response.statusText}`);
      } else {
        this.logger.error(`RPC ${method} failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Connect to Bitcoin network (validate RPC)
   */
  async connect(): Promise<void> {
    try {
      const info = await this.rpcCall('getblockchaininfo');
      this.connected = true;
      this.logger.log(`🔗 Connected to Bitcoin ${this.networkType.toUpperCase()} (blocks: ${info.blocks}, chain: ${info.chain})`);
    } catch (error) {
      this.logger.error(`Failed to connect to Bitcoin ${this.networkType}:`, (error as any).message || error);
      throw error;
    }
  }

  /**
   * Disconnect from Bitcoin network
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.logger.log('Disconnected from Bitcoin');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get balance of an address in BTC via UTXO set scan
   */
  async getBalance(address: string): Promise<number> {
    try {
      const result = await this.rpcCall('scantxoutset', ['start', [`addr(${address})`]]);
      const amount = typeof result?.total_amount === 'number' ? result.total_amount : 0;
      return amount;
    } catch (error) {
      this.logger.error(`Failed to get balance for ${address}:`, (error as any).message || error);
      return 0;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<Transaction> {
    try {
      const tx = await this.rpcCall('getrawtransaction', [txHash, true]);

      let blockNumber = 0;
      let timestamp = Math.floor(Date.now() / 1000);
      let confirmations = 0;

      if (tx.blockhash) {
        const block = await this.rpcCall('getblock', [tx.blockhash]);
        blockNumber = block.height;
        timestamp = block.time;
        confirmations = tx.confirmations || 0;
      }

      const fromAddress = tx.vin?.[0]?.prevout?.scriptPubKey?.address || '';
      const toAddress = tx.vout?.[0]?.scriptPubKey?.address || '';
      const value = tx.vout?.[0]?.value ? (tx.vout[0].value * 100000000).toString() : '0';

      return {
        hash: tx.txid,
        from: fromAddress,
        to: toAddress,
        value,
        blockNumber,
        timestamp,
        confirmations,
      };
    } catch (error) {
      this.logger.error(`Failed to get transaction ${txHash}:`, (error as any).message || error);
      throw error;
    }
  }

  /**
   * Get current block height
   */
  async getBlockHeight(): Promise<number> {
    try {
      const height = await this.rpcCall('getblockcount');
      return height;
    } catch (error) {
      this.logger.error('Failed to get block height:', (error as any).message || error);
      throw error;
    }
  }

  /**
   * Get block by number
   */
  async getBlock(blockNumber: number): Promise<Block> {
    try {
      const blockHash = await this.rpcCall('getblockhash', [blockNumber]);
      const blockData = await this.rpcCall('getblock', [blockHash, 2]);

      const transactions: Transaction[] = [];
      const txs = Array.isArray(blockData.tx) ? blockData.tx.slice(0, 10) : [];
      for (const tx of txs) {
        const fromAddress = tx.vin?.[0]?.prevout?.scriptPubKey?.address || '';
        const toAddress = tx.vout?.[0]?.scriptPubKey?.address || '';
        const value = tx.vout?.[0]?.value ? (tx.vout[0].value * 100000000).toString() : '0';
        transactions.push({
          hash: tx.txid,
          from: fromAddress,
          to: toAddress,
          value,
          blockNumber: blockData.height,
          timestamp: blockData.time,
          confirmations: blockData.confirmations || 0,
        });
      }

      return {
        number: blockData.height,
        hash: blockData.hash,
        timestamp: blockData.time,
        transactions,
      };
    } catch (error) {
      this.logger.error(`Failed to get block ${blockNumber}:`, (error as any).message || error);
      throw error;
    }
  }

  /**
   * Create an unsigned transaction
   * Note: Bitcoin transactions are complex, this is a simplified version
   */
  async createTransaction(params: CreateTxParams): Promise<UnsignedTransaction> {
    try {
      // For Bitcoin, we need UTXOs which requires wallet integration
      // This is a placeholder that returns the basic structure
      this.logger.warn('Bitcoin transaction creation requires UTXO management');

      return {
        to: params.to,
        value: (params.amount * 100000000).toString(), // Convert to satoshis
        data: params.data,
      };
    } catch (error) {
      this.logger.error('Failed to create transaction:', error);
      throw error;
    }
  }

  /**
   * Sign a Bitcoin transaction
   * Note: Requires proper UTXO management and key pair
   */
  async signTransaction(
    tx: UnsignedTransaction,
    _privateKey: string,
  ): Promise<SignedTransaction> {
    try {
      // Prefer wallet-based PSBT signing; raw key signing is out-of-scope here
      if (!tx.data) {
        throw new Error('Missing PSBT data to sign');
      }
      const processed = await this.rpcCall('walletprocesspsbt', [tx.data, false, 'ALL', false]);
      const finalized = await this.rpcCall('finalizepsbt', [processed.psbt]);
      if (!finalized.complete) {
        throw new Error('Failed to finalize PSBT');
      }
      const decoded = await this.rpcCall('decoderawtransaction', [finalized.hex]);
      return { raw: finalized.hex, hash: decoded.txid };
    } catch (error) {
      this.logger.error('Failed to sign transaction:', (error as any).message || error);
      throw error;
    }
  }

  /**
   * Broadcast a signed transaction
   */
  async broadcastTransaction(tx: SignedTransaction | string): Promise<string> {
    try {
      const rawTx = typeof tx === 'string' ? tx : tx.raw;
      const txid = await this.rpcCall('sendrawtransaction', [rawTx]);
      this.logger.log(`✅ Transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to broadcast transaction:', (error as any).message || error);
      throw error;
    }
  }

  /**
   * Validate if address is valid
   */
  isValidAddress(address: string): boolean {
    try {
      const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/;
      return btcRegex.test(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Estimate gas fee (mining fee) for a transaction
   */
  async estimateGasFee(_tx: CreateTxParams): Promise<GasFeeEstimate> {
    try {
      const feeRate = await this.rpcCall('estimatesmartfee', [6]);
      if (feeRate?.feerate) {
        const txSizeKb = 0.25;
        return { fee: feeRate.feerate * txSizeKb, assetCode: 'BTC' };
      }
      return { fee: 0.0001, assetCode: 'BTC' };
    } catch (error) {
      this.logger.error('Failed to estimate fee:', (error as any).message || error);
      return { fee: 0.0001, assetCode: 'BTC' };
    }
  }

  /**
   * Get unspent transaction outputs (UTXOs) for an address
   */
  async getUTXOs(address: string): Promise<any[]> {
    try {
      const result = await this.rpcCall('scantxoutset', ['start', [`addr(${address})`]]);
      return Array.isArray(result?.unspents) ? result.unspents : [];
    } catch (error) {
      this.logger.error(`Failed to get UTXOs for ${address}:`, (error as any).message || error);
      return [];
    }
  }
}

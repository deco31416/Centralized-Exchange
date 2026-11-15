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
// @ts-ignore - bs58check type compatibility issue
import * as bs58check from 'bs58check';

/**
 * Tron blockchain service implementation
 * Supports mainnet and testnet (Nile/Shasta) via TronGrid API
 * 
 * Standard: Uses TronGrid HTTP API and TRC-20 token standard
 * Address format: Base58check (starts with 'T')
 * Native token: TRX (6 decimals)
 */
@Injectable()
export class TronBlockchainService implements IBlockchainService {
  private readonly logger = new Logger(TronBlockchainService.name);
  private apiBaseUrl: string;
  private gridApiUrl: string;
  private networkType: 'mainnet' | 'testnet';
  private connected: boolean = false;

  // TRC-20 Transfer event signature
  private readonly TRANSFER_EVENT_SIGNATURE = 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  constructor(networkType: 'mainnet' | 'testnet') {
    this.networkType = networkType;
    
    // TronGrid public API endpoints
    if (networkType === 'mainnet') {
      this.apiBaseUrl = 'https://api.trongrid.io';
      this.gridApiUrl = 'https://api.trongrid.io';
    } else {
      // Nile testnet
      this.apiBaseUrl = 'https://nile.trongrid.io';
      this.gridApiUrl = 'https://nile.trongrid.io';
    }
  }

  /**
   * Connect to Tron network (validate API access)
   */
  async connect(): Promise<void> {
    try {
      // Test connection by getting node info
      const response = await axios.get(`${this.apiBaseUrl}/wallet/getnodeinfo`, {
        timeout: 10000,
      });

      if (response.data) {
        this.connected = true;
        const network = this.networkType.toUpperCase();
        this.logger.log(`🔗 Connected to Tron ${network}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to connect to Tron ${this.networkType}:`, error.message || error);
      throw error;
    }
  }

  /**
   * Disconnect from Tron network
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.logger.log('Disconnected from Tron');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get balance of an address in TRX
   */
  async getBalance(address: string): Promise<number> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/wallet/getaccount`,
        { address: address, visible: true },
        { timeout: 10000 }
      );

      // Tron returns balance in SUN (1 TRX = 1,000,000 SUN)
      const balanceSun = response.data?.balance || 0;
      return balanceSun / 1000000;
    } catch (error: any) {
      this.logger.error(`Failed to get balance for ${address}:`, error.message || error);
      return 0;
    }
  }

  /**
   * Get TRC-20 token balance
   */
  async getTokenBalance(address: string, tokenAddress: string): Promise<number> {
    try {
      // Call balanceOf function on TRC-20 contract
      const parameter = this.encodeBalanceOfCall(address);
      
      const response = await axios.post(
        `${this.apiBaseUrl}/wallet/triggersmartcontract`,
        {
          owner_address: address,
          contract_address: tokenAddress,
          function_selector: 'balanceOf(address)',
          parameter: parameter,
          visible: true,
        },
        { timeout: 10000 }
      );

      if (response.data?.constant_result?.[0]) {
        const balanceHex = response.data.constant_result[0];
        const balance = parseInt(balanceHex, 16);
        
        // Get token decimals
        const decimals = await this.getTokenDecimals(tokenAddress);
        return balance / Math.pow(10, decimals);
      }

      return 0;
    } catch (error: any) {
      this.logger.error(`Failed to get token balance for ${address}:`, error.message || error);
      return 0;
    }
  }

  /**
   * Get token decimals from contract
   */
  private async getTokenDecimals(tokenAddress: string): Promise<number> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/wallet/triggersmartcontract`,
        {
          owner_address: tokenAddress, // Use contract as owner for view functions
          contract_address: tokenAddress,
          function_selector: 'decimals()',
          visible: true,
        },
        { timeout: 10000 }
      );

      if (response.data?.constant_result?.[0]) {
        const decimalsHex = response.data.constant_result[0];
        return parseInt(decimalsHex, 16);
      }

      return 6; // Default TRC-20 decimals
    } catch (error) {
      this.logger.warn(`Failed to get decimals for token ${tokenAddress}, using default 6`);
      return 6;
    }
  }

  /**
   * Encode balanceOf(address) function call
   */
  private encodeBalanceOfCall(address: string): string {
    // Convert Tron address to hex (remove 'T' prefix and decode base58)
    // For API calls, we pass the address in hex format without the '41' prefix
    const hexAddress = this.tronAddressToHex(address).slice(2); // Remove '0x'
    return hexAddress.padStart(64, '0');
  }

  /**
   * Convert Tron base58 address to hex format
   */
  private tronAddressToHex(address: string): string {
    // Simplified conversion - in production, use TronWeb library
    // This is a placeholder that assumes the API accepts base58
    return address;
  }

  /**
   * Convert Tron hex address to base58 format
   * TronGrid API returns addresses in hex format (with or without '0x' prefix)
   * We need to convert them to base58 format (starting with 'T') for comparison
   */
  private hexToBase58Address(hexAddress: string): string {
    try {
      // Remove '0x' prefix if present
      let cleanHex = hexAddress.toLowerCase().replace('0x', '');
      
      // If the hex doesn't start with '41' (Tron mainnet prefix), add it
      if (!cleanHex.startsWith('41')) {
        // For testnet or if prefix is missing, assume mainnet (41)
        cleanHex = '41' + cleanHex;
      }
      
      // Convert hex string to buffer
      const addressBuffer = Buffer.from(cleanHex, 'hex');
      
      // Encode using Base58Check (includes checksum)
      const base58Address = bs58check.default.encode(addressBuffer);
      
      return base58Address;
    } catch (error: any) {
      this.logger.warn(`Failed to convert hex address ${hexAddress} to base58:`, error.message);
      return hexAddress; // Return original if conversion fails
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/wallet/gettransactionbyid`,
        { value: txHash, visible: true },
        { timeout: 10000 }
      );

      const tx = response.data;
      
      if (!tx || !tx.txID) {
        throw new Error(`Transaction ${txHash} not found`);
      }

      // Get transaction info for confirmation status
      const infoResponse = await axios.post(
        `${this.apiBaseUrl}/wallet/gettransactioninfobyid`,
        { value: txHash, visible: true },
        { timeout: 10000 }
      );

      const txInfo = infoResponse.data;
      const blockNumber = txInfo.blockNumber || 0;
      const timestamp = Math.floor((txInfo.blockTimeStamp || Date.now()) / 1000);

      // Extract from/to/value from contract
      const contract = tx.raw_data?.contract?.[0];
      let from = '';
      let to = '';
      let value = '0';

      if (contract?.type === 'TransferContract') {
        from = contract.parameter?.value?.owner_address || '';
        to = contract.parameter?.value?.to_address || '';
        value = (contract.parameter?.value?.amount || 0).toString();
      }

      // Get current block to calculate confirmations
      const currentBlock = await this.getBlockHeight();
      const confirmations = blockNumber > 0 ? currentBlock - blockNumber + 1 : 0;

      return {
        hash: tx.txID,
        from,
        to,
        value,
        blockNumber,
        timestamp,
        confirmations,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get transaction ${txHash}:`, error.message || error);
      throw error;
    }
  }

  /**
   * Get current block height
   */
  async getBlockHeight(): Promise<number> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/wallet/getnowblock`,
        {},
        { timeout: 10000 }
      );

      return response.data?.block_header?.raw_data?.number || 0;
    } catch (error: any) {
      this.logger.error('Failed to get block height:', error.message || error);
      throw error;
    }
  }

  /**
   * Get block by number
   */
  async getBlock(blockNumber: number): Promise<Block> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/wallet/getblockbynum`,
        { num: blockNumber, visible: true },
        { timeout: 10000 }
      );

      const blockData = response.data;

      if (!blockData || !blockData.blockID) {
        throw new Error(`Block ${blockNumber} not found`);
      }

      const transactions: Transaction[] = [];
      const txs = blockData.transactions || [];

      // Process first 10 transactions for performance
      for (const tx of txs.slice(0, 10)) {
        const contract = tx.raw_data?.contract?.[0];
        if (contract?.type === 'TransferContract') {
          transactions.push({
            hash: tx.txID,
            from: contract.parameter?.value?.owner_address || '',
            to: contract.parameter?.value?.to_address || '',
            value: (contract.parameter?.value?.amount || 0).toString(),
            blockNumber: blockData.block_header?.raw_data?.number || blockNumber,
            timestamp: Math.floor((blockData.block_header?.raw_data?.timestamp || Date.now()) / 1000),
            confirmations: 0, // Would need current block to calculate
          });
        }
      }

      return {
        number: blockData.block_header?.raw_data?.number || blockNumber,
        hash: blockData.blockID,
        timestamp: Math.floor((blockData.block_header?.raw_data?.timestamp || Date.now()) / 1000),
        transactions,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get block ${blockNumber}:`, error.message || error);
      throw error;
    }
  }

  /**
   * Get TRC-20 token transfers in a block
   */
  async getTokenTransfersInBlock(blockNumber: number, tokenAddresses: string[]): Promise<TokenTransfer[]> {
    try {
      const transfers: TokenTransfer[] = [];
      const block = await this.getBlock(blockNumber);

      // For each token address, query events
      for (const tokenAddress of tokenAddresses) {
        try {
          // Query TRC-20 Transfer events using event API
          const response = await axios.get(
            `${this.gridApiUrl}/v1/contracts/${tokenAddress}/events`,
            {
              params: {
                event_name: 'Transfer',
                only_confirmed: true,
                min_block_timestamp: block.timestamp * 1000,
                max_block_timestamp: block.timestamp * 1000,
                limit: 200,
              },
              timeout: 15000,
            }
          );

          const events = response.data?.data || [];

          for (const event of events) {
            if (event.block_number === blockNumber) {
              const fromHex = event.result?.from || '';
              const toHex = event.result?.to || '';
              const value = event.result?.value || '0';

              // Convert hex addresses to base58 format for consistency
              const from = fromHex ? this.hexToBase58Address(fromHex) : '';
              const to = toHex ? this.hexToBase58Address(toHex) : '';

              transfers.push({
                hash: event.transaction_id,
                from,
                to,
                value,
                tokenAddress,
                blockNumber,
                timestamp: Math.floor(event.block_timestamp / 1000),
                logIndex: 0,
              });
            }
          }
        } catch (tokenError: any) {
          this.logger.warn(`Failed to get events for token ${tokenAddress}:`, tokenError.message);
        }
      }

      return transfers;
    } catch (error: any) {
      this.logger.error(`Failed to get token transfers in block ${blockNumber}:`, error.message || error);
      return [];
    }
  }

  /**
   * Create an unsigned transaction
   */
  async createTransaction(params: CreateTxParams): Promise<UnsignedTransaction> {
    try {
      const amountSun = Math.round(params.amount * 1000000);

      const response = await axios.post(
        `${this.apiBaseUrl}/wallet/createtransaction`,
        {
          to_address: params.to,
          owner_address: params.data || '', // owner address passed in data field
          amount: amountSun,
          visible: true,
        },
        { timeout: 10000 }
      );

      if (!response.data || response.data.Error) {
        throw new Error(response.data?.Error || 'Failed to create transaction');
      }

      return {
        to: params.to,
        value: amountSun.toString(),
        data: JSON.stringify(response.data), // Store raw transaction JSON
      };
    } catch (error: any) {
      this.logger.error('Failed to create Tron transaction:', error.message || error);
      throw error;
    }
  }

  /**
   * Sign a Tron transaction
   * Note: In production, use TronWeb with private key or hardware wallet
   */
  async signTransaction(
    tx: UnsignedTransaction,
    _privateKey: string,
  ): Promise<SignedTransaction> {
    try {
      this.logger.warn('Tron transaction signing requires TronWeb library with private key');
      
      // In production, use TronWeb:
      // const tronWeb = new TronWeb({ fullHost: this.apiBaseUrl, privateKey });
      // const signedTx = await tronWeb.trx.sign(JSON.parse(tx.data), privateKey);
      
      return {
        raw: tx.data || '',
        hash: '',
      };
    } catch (error: any) {
      this.logger.error('Failed to sign Tron transaction:', error.message || error);
      throw error;
    }
  }

  /**
   * Broadcast a signed transaction
   */
  async broadcastTransaction(tx: SignedTransaction | string): Promise<string> {
    try {
      const rawTx = typeof tx === 'string' ? tx : tx.raw;
      const txData = JSON.parse(rawTx);

      const response = await axios.post(
        `${this.apiBaseUrl}/wallet/broadcasttransaction`,
        txData,
        { timeout: 10000 }
      );

      if (response.data?.result === true) {
        const txid = response.data.txid || txData.txID;
        this.logger.log(`✅ Tron transaction broadcasted: ${txid}`);
        return txid;
      }

      throw new Error(response.data?.message || 'Broadcast failed');
    } catch (error: any) {
      this.logger.error('Failed to broadcast Tron transaction:', error.message || error);
      throw error;
    }
  }

  /**
   * Validate if address is valid Tron address
   */
  isValidAddress(address: string): boolean {
    try {
      // Tron mainnet addresses start with 'T', testnet with 'T' as well
      // Length is 34 characters for base58 encoded addresses
      const tronRegex = /^T[A-Za-z1-9]{33}$/;
      return tronRegex.test(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Estimate transaction fee (bandwidth + energy)
   */
  async estimateGasFee(_tx: CreateTxParams): Promise<GasFeeEstimate> {
    try {
      // Tron uses bandwidth and energy for fees
      // Simple TRX transfer typically costs ~265 bandwidth
      // Average cost is minimal (~0.001 TRX for bandwidth)
      return {
        fee: 0.001, // Minimal fee for TRX transfer
        assetCode: 'TRX',
      };
    } catch (error: any) {
      this.logger.error('Failed to estimate fee:', error.message || error);
      return { fee: 0.001, assetCode: 'TRX' };
    }
  }
}

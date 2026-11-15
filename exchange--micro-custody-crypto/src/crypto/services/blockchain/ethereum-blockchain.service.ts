import { Injectable, Logger } from '@nestjs/common';
import { ethers, JsonRpcProvider, Wallet, formatEther, parseEther, isAddress, Transaction as EthersTransaction } from 'ethers';
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
 * Ethereum blockchain service implementation
 * Supports both mainnet and testnet (Sepolia)
 */
@Injectable()
export class EthereumBlockchainService implements IBlockchainService {
  private readonly logger = new Logger(EthereumBlockchainService.name);
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private network: 'mainnet' | 'testnet';
  private connected: boolean = false;

  constructor(
    private readonly rpcUrl: string,
    private readonly networkType: 'mainnet' | 'testnet',
    private readonly privateKey?: string,
  ) {
    this.network = networkType;
  }

  /**
   * Connect to Ethereum network
   */
  async connect(): Promise<void> {
    try {
      if (!this.rpcUrl?.trim() || this.rpcUrl.includes('xxxxx--xxxxx')) {
        throw new Error('ETH_RPC_URL must be configured with an approved Ethereum RPC endpoint.');
      }

      this.provider = new JsonRpcProvider(this.rpcUrl);

      if (this.privateKey && this.privateKey.length > 10 && !this.privateKey.includes('...')) {
        try {
          this.wallet = new Wallet(this.privateKey, this.provider);
        } catch (error) {
          this.logger.warn(
            `⚠️ Invalid private key provided. Wallet functionality disabled. Error: ${error.message}`,
          );
        }
      } else if (this.privateKey) {
        this.logger.warn(
          `⚠️ Placeholder private key detected. Wallet functionality disabled. Set ETH_HOT_WALLET_PRIVATE_KEY in .env for full functionality.`,
        );
      }

      const network = await this.provider.getNetwork();
      const expectedChainId = BigInt(this.network === 'mainnet' ? 1 : 11155111);

      if (network.chainId !== expectedChainId) {
        throw new Error(
          `Wrong network: expected ${this.network} (chainId ${expectedChainId}), got chainId ${network.chainId}`,
        );
      }

      this.connected = true;
      this.logger.log(
        `🔗 Connected to Ethereum ${this.network.toUpperCase()} (chainId: ${network.chainId})`,
      );
    } catch (error) {
      this.logger.error(`Failed to connect to Ethereum ${this.network}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from Ethereum network
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.logger.log('Disconnected from Ethereum');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get balance of an address in ETH
   */
  async getBalance(address: string): Promise<number> {
    try {
      const balance = await this.provider.getBalance(address);
      return parseFloat(formatEther(balance));
    } catch (error) {
      this.logger.error(`Failed to get balance for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<Transaction> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!tx || !receipt) {
        throw new Error(`Transaction ${txHash} not found`);
      }

      const currentBlock = await this.getBlockHeight();
      const confirmations = currentBlock - receipt.blockNumber + 1;
      
      const block = await this.provider.getBlock(receipt.blockNumber);
      if (!block) {
        throw new Error(`Block ${receipt.blockNumber} not found`);
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: tx.value.toString(),
        blockNumber: receipt.blockNumber,
        timestamp: block.timestamp,
        confirmations,
      };
    } catch (error) {
      this.logger.error(`Failed to get transaction ${txHash}:`, error);
      throw error;
    }
  }

  /**
   * Get current block height
   */
  async getBlockHeight(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      this.logger.error('Failed to get block height:', error);
      throw error;
    }
  }

  /**
   * Get block by number
   */
  async getBlock(blockNumber: number): Promise<Block> {
    try {
      const block = await this.provider.getBlock(blockNumber, true);

      if (!block) {
        throw new Error(`Block ${blockNumber} not found`);
      }

      const transactions: Transaction[] = [];
      
      if (block.prefetchedTransactions) {
        for (const tx of block.prefetchedTransactions) {
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || '',
            value: tx.value.toString(),
            blockNumber: tx.blockNumber || blockNumber,
            timestamp: block.timestamp,
            confirmations: 0,
          });
        }
      }

      return {
        number: block.number,
        hash: block.hash || '',
        timestamp: block.timestamp,
        transactions,
      };
    } catch (error) {
      this.logger.error(`Failed to get block ${blockNumber}:`, error);
      throw error;
    }
  }

  /**
   * Create an unsigned transaction
   */
  async createTransaction(params: CreateTxParams): Promise<UnsignedTransaction> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }

      const nonce = await this.provider.getTransactionCount(this.wallet.address);
      const feeData = await this.provider.getFeeData();
      const value = parseEther(params.amount.toString());

      const unsignedTx: UnsignedTransaction = {
        to: params.to,
        value: value.toString(),
        nonce,
        gasPrice: feeData.gasPrice?.toString() || '0',
        gasLimit: '21000',
      };

      if (params.data) {
        unsignedTx.data = params.data;
        const gasLimit = await this.provider.estimateGas({
          to: params.to,
          value,
          data: params.data,
        });
        unsignedTx.gasLimit = gasLimit.toString();
      }

      return unsignedTx;
    } catch (error) {
      this.logger.error('Failed to create transaction:', error);
      throw error;
    }
  }

  /**
   * Sign a transaction
   */
  async signTransaction(
    tx: UnsignedTransaction,
    privateKey: string,
  ): Promise<SignedTransaction> {
    try {
      const wallet = new Wallet(privateKey, this.provider);
      const signedTx = await wallet.signTransaction({
        to: tx.to,
        value: tx.value,
        data: tx.data,
        nonce: tx.nonce,
        gasLimit: tx.gasLimit,
        gasPrice: tx.gasPrice,
      });

      const parsedTx = ethers.Transaction.from(signedTx);

      return {
        raw: signedTx,
        hash: parsedTx.hash || '',
      };
    } catch (error) {
      this.logger.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  /**
   * Broadcast a signed transaction
   */
  async broadcastTransaction(tx: SignedTransaction | string): Promise<string> {
    try {
      const rawTx = typeof tx === 'string' ? tx : tx.raw;
      const response = await this.provider.broadcastTransaction(rawTx);

      this.logger.log(`✅ Transaction broadcasted: ${response.hash}`);

      return response.hash;
    } catch (error) {
      this.logger.error('Failed to broadcast transaction:', error);
      throw error;
    }
  }

  /**
   * Validate if address is valid
   */
  isValidAddress(address: string): boolean {
    return isAddress(address);
  }

  /**
   * Estimate gas fee for a transaction
   */
  async estimateGasFee(tx: CreateTxParams): Promise<GasFeeEstimate> {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;
      let gasLimit = 21000n;

      if (tx.data) {
        const value = parseEther(tx.amount.toString());
        const estimated = await this.provider.estimateGas({
          to: tx.to,
          value,
          data: tx.data,
        });
        gasLimit = estimated;
      }

      const gasCost = gasPrice * gasLimit;
      const fee = parseFloat(formatEther(gasCost));

      return {
        fee,
        assetCode: 'ETH',
        gasPrice: gasPrice.toString(),
        gasLimit: Number(gasLimit),
      };
    } catch (error) {
      this.logger.error('Failed to estimate gas fee:', error);
      throw error;
    }
  }

  /**
   * Get ERC-20 token balance
   */
  async getTokenBalance(address: string, tokenAddress: string): Promise<number> {
    try {
      const abi = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];
      const contract = new ethers.Contract(tokenAddress, abi, this.provider);
      const [balance, decimals] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals().catch(() => 18), // Default to 18 if decimals() not available
      ]);
      
      return parseFloat(ethers.formatUnits(balance, decimals));
    } catch (error) {
      this.logger.error(
        `Failed to get token balance for ${address} (token: ${tokenAddress}):`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get ERC-20 token transfers from a block
   * Parses Transfer events from specified token contracts
   */
  async getTokenTransfersInBlock(
    blockNumber: number,
    tokenAddresses: string[],
  ): Promise<TokenTransfer[]> {
    try {
      const transfers: TokenTransfer[] = [];
      
      if (tokenAddresses.length === 0) {
        return transfers;
      }

      // Get block to extract timestamp
      const block = await this.provider.getBlock(blockNumber);
      if (!block) {
        throw new Error(`Block ${blockNumber} not found`);
      }

      // ERC-20 Transfer event signature
      // Transfer(address indexed from, address indexed to, uint256 value)
      const transferEventSignature = ethers.id('Transfer(address,address,uint256)');

      // Query logs for Transfer events from specified token contracts
      const logs = await this.provider.getLogs({
        fromBlock: blockNumber,
        toBlock: blockNumber,
        address: tokenAddresses.map(addr => addr.toLowerCase()),
        topics: [transferEventSignature],
      });

      for (const log of logs) {
        try {
          // Decode Transfer event
          const iface = new ethers.Interface([
            'event Transfer(address indexed from, address indexed to, uint256 value)',
          ]);
          const decoded = iface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });

          if (decoded) {
            transfers.push({
              hash: log.transactionHash,
              from: decoded.args[0].toLowerCase(),
              to: decoded.args[1].toLowerCase(),
              value: decoded.args[2].toString(),
              tokenAddress: log.address.toLowerCase(),
              blockNumber: log.blockNumber,
              timestamp: block.timestamp,
              logIndex: log.index,
            });
          }
        } catch (decodeError) {
          this.logger.warn(
            `Failed to decode Transfer event at log index ${log.index}:`,
            decodeError,
          );
        }
      }

      return transfers;
    } catch (error) {
      this.logger.error(
        `Failed to get token transfers for block ${blockNumber}:`,
        error,
      );
      throw error;
    }
  }
}

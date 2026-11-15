/**
 * Transaction interface for blockchain operations
 */
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  confirmations: number;
}

/**
 * Parameters for creating a transaction
 */
export interface CreateTxParams {
  to: string;
  amount: number;
  assetCode: string;
  data?: string;
}

/**
 * Unsigned transaction interface
 */
export interface UnsignedTransaction {
  to: string;
  value: string;
  data?: string;
  nonce?: number;
  gasLimit?: string;
  gasPrice?: string;
}

/**
 * Signed transaction interface
 */
export interface SignedTransaction {
  raw: string;
  hash: string;
}

/**
 * Gas fee estimate interface
 */
export interface GasFeeEstimate {
  fee: number;
  assetCode: string;
  gasPrice?: string;
  gasLimit?: number;
}

/**
 * Block interface
 */
export interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactions: Transaction[];
}

/**
 * Token transfer interface
 */
export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenAddress: string;
  blockNumber: number;
  timestamp: number;
  logIndex: number;
}

/**
 * Abstract interface for blockchain service implementations
 */
export interface IBlockchainService {
  /**
   * Connect to the blockchain network
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the blockchain network
   */
  disconnect(): Promise<void>;

  /**
   * Check if connected to the blockchain
   */
  isConnected(): boolean;

  /**
   * Get balance of an address
   */
  getBalance(address: string): Promise<number>;

  /**
   * Get transaction details
   */
  getTransaction(txHash: string): Promise<Transaction>;

  /**
   * Get current block height
   */
  getBlockHeight(): Promise<number>;

  /**
   * Get block by number
   */
  getBlock(blockNumber: number): Promise<Block>;

  /**
   * Create an unsigned transaction
   */
  createTransaction(params: CreateTxParams): Promise<UnsignedTransaction>;

  /**
   * Sign a transaction
   */
  signTransaction(tx: UnsignedTransaction, privateKey: string): Promise<SignedTransaction>;

  /**
   * Broadcast a signed transaction
   */
  broadcastTransaction(tx: SignedTransaction | string): Promise<string>;

  /**
   * Validate if an address is valid
   */
  isValidAddress(address: string): boolean;

  /**
   * Estimate gas fee for a transaction
   */
  estimateGasFee(tx: CreateTxParams): Promise<GasFeeEstimate>;

  /**
   * Get token transfers from a block (for EVM chains)
   * Returns all token Transfer events in the block
   */
  getTokenTransfersInBlock?(
    blockNumber: number,
    tokenAddresses: string[],
  ): Promise<TokenTransfer[]>;

  /**
   * Get token balance
   */
  getTokenBalance?(address: string, tokenAddress: string): Promise<number>;
}

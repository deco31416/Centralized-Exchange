import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenConfiguration } from '../models/token-configuration.schema';
import type { SupportedBlockchain } from '../models/user-address.schema';

/**
 * Token Configuration Service
 * Manages supported tokens/coins for deposit monitoring
 */
@Injectable()
export class TokenConfigurationService {
  private readonly logger = new Logger(TokenConfigurationService.name);
  
  // In-memory cache for active tokens
  private tokenCache: Map<string, TokenConfiguration[]> = new Map();
  private cacheUpdatedAt: Date | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectModel(TokenConfiguration.name)
    private readonly tokenConfigModel: Model<TokenConfiguration>,
  ) {}

  /**
   * Initialize default tokens if database is empty
   */
  async initializeDefaultTokens(): Promise<void> {
    const count = await this.tokenConfigModel.countDocuments();
    
    if (count > 0) {
      this.logger.log(`✅ Found ${count} token configurations`);
      return;
    }

    this.logger.log('🔧 Initializing default token configurations...');

    const defaultTokens: Partial<TokenConfiguration>[] = [
      // BSC Native
      {
        assetCode: 'BNB',
        name: 'Binance Coin',
        symbol: 'BNB',
        blockchain: 'bsc',
        tokenType: 'native',
        standard: 'NATIVE',
        decimals: 18,
        isActive: true,
        isStablecoin: false,
        minimumDeposit: 0.001,
        metadata: {
          coingeckoId: 'binancecoin',
          website: 'https://www.binance.com/',
        },
      },
      // Ethereum Native
      {
        assetCode: 'ETH',
        name: 'Ethereum',
        symbol: 'ETH',
        blockchain: 'ethereum',
        tokenType: 'native',
        standard: 'NATIVE',
        decimals: 18,
        isActive: true,
        isStablecoin: false,
        minimumDeposit: 0.001,
        metadata: {
          coingeckoId: 'ethereum',
          website: 'https://ethereum.org/',
        },
      },
      // Bitcoin Native
      {
        assetCode: 'BTC',
        name: 'Bitcoin',
        symbol: 'BTC',
        blockchain: 'bitcoin',
        tokenType: 'native',
        standard: 'NATIVE',
        decimals: 8,
        isActive: true,
        isStablecoin: false,
        minimumDeposit: 0.0001,
        metadata: {
          coingeckoId: 'bitcoin',
          website: 'https://bitcoin.org/',
        },
      },
      // USDT on BSC (BEP-20)
      {
        assetCode: 'USDT_BSC',
        name: 'Tether USD (BSC)',
        symbol: 'USDT',
        blockchain: 'bsc',
        tokenType: 'bep20',
        standard: 'BEP-20',
        // Mainnet: 0x55d398326f99059fF775485246999027B3197955
        // Testnet: 0x3020f97bA033470F73487d31c2B073B47c5fAB51
        contractAddress: '0x3020f97bA033470F73487d31c2B073B47c5fAB51',
        decimals: 18,
        isActive: true,
        isStablecoin: true,
        minimumDeposit: 1,
        metadata: {
          coingeckoId: 'tether',
          website: 'https://tether.to/',
        },
      },
      // USDC on BSC (BEP-20)
      {
        assetCode: 'USDC_BSC',
        name: 'USD Coin (BSC)',
        symbol: 'USDC',
        blockchain: 'bsc',
        tokenType: 'bep20',
        standard: 'BEP-20',
        // Mainnet: 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
        // Testnet: 0x17E9d022307e5dD63a35832c5d499B96D027642D
        contractAddress: '0x17E9d022307e5dD63a35832c5d499B96D027642D',
        decimals: 18,
        isActive: true,
        isStablecoin: true,
        minimumDeposit: 1,
        metadata: {
          coingeckoId: 'usd-coin',
          website: 'https://www.circle.com/usdc',
        },
      },
      // USDT on Ethereum (ERC-20)
      {
        assetCode: 'USDT_ETH',
        name: 'Tether USD (Ethereum)',
        symbol: 'USDT',
        blockchain: 'ethereum',
        tokenType: 'erc20',
        standard: 'ERC-20',
        // Mainnet: 0xdAC17F958D2ee523a2206206994597C13D831ec7
        // Sepolia Testnet: Not officially available - use faucet tokens or mock contracts
        contractAddress: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
        decimals: 6, // USDT on Ethereum uses 6 decimals
        isActive: true,
        isStablecoin: true,
        minimumDeposit: 1,
        metadata: {
          coingeckoId: 'tether',
          website: 'https://tether.to/',
        },
      },
      // USDC on Ethereum (ERC-20)
      {
        assetCode: 'USDC_ETH',
        name: 'USD Coin (Ethereum)',
        symbol: 'USDC',
        blockchain: 'ethereum',
        tokenType: 'erc20',
        standard: 'ERC-20',
        // Mainnet: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
        // Sepolia Testnet: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 (Official Circle USDC)
        contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        decimals: 6, // USDC uses 6 decimals
        isActive: true,
        isStablecoin: true,
        minimumDeposit: 1,
        metadata: {
          coingeckoId: 'usd-coin',
          website: 'https://www.circle.com/usdc',
        },
      },
      // Tron Native
      {
        assetCode: 'TRX',
        name: 'Tron',
        symbol: 'TRX',
        blockchain: 'tron',
        tokenType: 'native',
        standard: 'NATIVE',
        decimals: 6, // TRX uses 6 decimals (1 TRX = 1,000,000 SUN)
        isActive: true,
        isStablecoin: false,
        minimumDeposit: 1,
        metadata: {
          coingeckoId: 'tron',
          website: 'https://tron.network/',
        },
      },
      // USDT on Tron (TRC-20)
      {
        assetCode: 'USDT_TRX',
        name: 'Tether USD (Tron)',
        symbol: 'USDT',
        blockchain: 'tron',
        tokenType: 'trc20',
        standard: 'TRC-20',
        // Mainnet: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
        // Nile Testnet: TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf
        contractAddress: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
        decimals: 6,
        isActive: true,
        isStablecoin: true,
        minimumDeposit: 1,
        metadata: {
          coingeckoId: 'tether',
          website: 'https://tether.to/',
          description: 'Most widely used stablecoin on Tron',
        },
      },
      // USDC on Tron (TRC-20)
      {
        assetCode: 'USDC_TRX',
        name: 'USD Coin (Tron)',
        symbol: 'USDC',
        blockchain: 'tron',
        tokenType: 'trc20',
        standard: 'TRC-20',
        // Mainnet: TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8
        // Nile Testnet: Use testnet faucet tokens
        contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
        decimals: 6,
        isActive: true,
        isStablecoin: true,
        minimumDeposit: 1,
        metadata: {
          coingeckoId: 'usd-coin',
          website: 'https://www.circle.com/usdc',
        },
      },
      // Stellar Native
      {
        assetCode: 'XLM',
        name: 'Stellar Lumens',
        symbol: 'XLM',
        blockchain: 'stellar',
        tokenType: 'native',
        standard: 'NATIVE',
        decimals: 7, // XLM uses 7 decimals (1 XLM = 10,000,000 stroops)
        isActive: true,
        isStablecoin: false,
        minimumDeposit: 1,
        metadata: {
          coingeckoId: 'stellar',
          website: 'https://www.stellar.org/',
        },
      },
      // USDC on Stellar (Stellar Asset)
      {
        assetCode: 'USDC_XLM',
        name: 'USD Coin (Stellar)',
        symbol: 'USDC',
        blockchain: 'stellar',
        tokenType: 'stellar-asset',
        standard: 'Stellar Asset',
        // Mainnet issuer: GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
        // Testnet issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
        contractAddress: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        decimals: 7,
        isActive: true,
        isStablecoin: true,
        minimumDeposit: 1,
        metadata: {
          coingeckoId: 'usd-coin',
          website: 'https://www.circle.com/usdc',
          description: 'Circle USDC on Stellar network',
        },
      },
    ];

    for (const tokenData of defaultTokens) {
      await this.tokenConfigModel.create(tokenData);
    }

    this.logger.log(`✅ Initialized ${defaultTokens.length} default token configurations`);
    
    // Invalidate cache
    this.invalidateCache();
  }

  /**
   * Get all active tokens for a blockchain
   */
  async getActiveTokensByBlockchain(blockchain: SupportedBlockchain): Promise<TokenConfiguration[]> {
    // Check cache first
    if (this.isCacheValid()) {
      const cached = this.tokenCache.get(blockchain);
      if (cached) {
        return cached;
      }
    }

    // Fetch from database
    const tokens = await this.tokenConfigModel.find({
      blockchain,
      isActive: true,
    }).exec();

    // Update cache
    this.tokenCache.set(blockchain, tokens);
    this.cacheUpdatedAt = new Date();

    return tokens;
  }

  /**
   * Get token configuration by asset code
   */
  async getTokenByAssetCode(assetCode: string): Promise<TokenConfiguration | null> {
    return this.tokenConfigModel.findOne({ assetCode, isActive: true }).exec();
  }

  /**
   * Get token configuration by contract address and blockchain
   */
  async getTokenByContract(
    blockchain: SupportedBlockchain,
    contractAddress: string,
  ): Promise<TokenConfiguration | null> {
    return this.tokenConfigModel.findOne({
      blockchain,
      contractAddress: contractAddress.toLowerCase(),
      isActive: true,
    }).exec();
  }

  /**
   * Get all ERC-20/BEP-20 tokens for a blockchain (excluding native)
   */
  async getERC20TokensByBlockchain(blockchain: SupportedBlockchain): Promise<TokenConfiguration[]> {
    const tokens = await this.getActiveTokensByBlockchain(blockchain);
    return tokens.filter(token => token.tokenType !== 'native');
  }

  /**
   * Get native token configuration for a blockchain
   */
  async getNativeToken(blockchain: SupportedBlockchain): Promise<TokenConfiguration | null> {
    const tokens = await this.getActiveTokensByBlockchain(blockchain);
    return tokens.find(token => token.tokenType === 'native') || null;
  }

  /**
   * Add a new token configuration
   */
  async addToken(tokenData: Partial<TokenConfiguration>): Promise<TokenConfiguration> {
    const token = await this.tokenConfigModel.create(tokenData);
    this.invalidateCache();
    this.logger.log(`✅ Added new token: ${token.assetCode} on ${token.blockchain}`);
    return token;
  }

  /**
   * Update token configuration
   */
  async updateToken(
    assetCode: string,
    updates: Partial<TokenConfiguration>,
  ): Promise<TokenConfiguration | null> {
    const token = await this.tokenConfigModel.findOneAndUpdate(
      { assetCode },
      updates,
      { new: true },
    );
    
    if (token) {
      this.invalidateCache();
      this.logger.log(`✅ Updated token: ${assetCode}`);
    }
    
    return token;
  }

  /**
   * Deactivate a token (soft delete)
   */
  async deactivateToken(assetCode: string): Promise<void> {
    await this.tokenConfigModel.updateOne(
      { assetCode },
      { isActive: false },
    );
    
    this.invalidateCache();
    this.logger.log(`✅ Deactivated token: ${assetCode}`);
  }

  /**
   * Get all tokens (for admin purposes)
   */
  async getAllTokens(): Promise<TokenConfiguration[]> {
    return this.tokenConfigModel.find().exec();
  }

  /**
   * Invalidate cache
   */
  private invalidateCache(): void {
    this.tokenCache.clear();
    this.cacheUpdatedAt = null;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    if (!this.cacheUpdatedAt) {
      return false;
    }
    
    const now = new Date().getTime();
    const cacheAge = now - this.cacheUpdatedAt.getTime();
    
    return cacheAge < this.CACHE_TTL;
  }
}

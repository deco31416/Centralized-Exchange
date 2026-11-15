import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AccountService } from '../src/ledger/services/account.service';
import { PostingService } from '../src/ledger/services/posting.service';
import { PriceOracleService } from '../src/pricing/services/price-oracle.service';
import { PricingConfigurationService } from '../src/pricing/services/pricing-configuration.service';
import { PlatformReservesService } from '../src/swap/services/platform-reserves.service';
import { CustodyService } from '../src/crypto/services/custody.service';
import { OwnerType, AccountType } from '../src/ledger/models/account.schema';
import { LineDirection } from '../src/ledger/models/journal-line.schema';
import { ProviderType } from '../src/pricing/models/price-provider.schema';
import { Logger } from '@nestjs/common';

const logger = new Logger('SeedScript');

/**
 * Comprehensive seed script to populate the database with test data
 * for Ledger, Pricing, and Swap modules.
 */
async function seed() {
  logger.log('🌱 Starting database seed...');

  const app = await NestFactory.createApplicationContext(AppModule);

  const accountService = app.get(AccountService);
  const postingService = app.get(PostingService);
  const priceOracleService = app.get(PriceOracleService);
  const pricingConfigService = app.get(PricingConfigurationService);
  const platformReservesService = app.get(PlatformReservesService);
  const custodyService = app.get(CustodyService);

  try {
    // ============================================
    // 1. LEDGER: Create Test Accounts
    // ============================================
    logger.log('\n📒 Seeding Ledger Accounts...');

    // Unified asset list for ledger accounts
    // Note: Multi-chain tokens (e.g., USDT, USDC) have ONE account per token
    // regardless of blockchain. Blockchain-specific tracking happens at deposit/withdrawal level.
    const assets = [
      'USD',           // Fiat
      'BTC',           // Bitcoin native
      'ETH',           // Ethereum native
      'BNB',           // BSC native
      'TRX',           // Tron native
      'BSS',           // Venezuelan Bolivar
      'USDT',          // Tether (unified across BSC, ETH, TRX, etc.)
      'USDC',          // USD Coin (unified across BSC, ETH, TRX, etc.)
      'BUSD',          // Binance USD (unified across chains)
      'XLM',           // Stellar native
    ];
    const testUsers = ['user1', 'user2', 'user3'];

    // Create platform asset accounts for each asset
    // These hold the platform's actual reserves
    const platformAccounts: Record<string, any> = {};
    for (const asset of assets) {
      try {
        const account = await accountService.createAccount({
          ownerType: OwnerType.PLATFORM,
          ownerId: 'PLATFORM',
          assetCode: asset,
          accountType: AccountType.ASSET,
          metadata: { description: `Platform asset account for ${asset}` },
        });
        platformAccounts[asset] = account;
        logger.log(`  ✅ Created platform asset account for ${asset}: ${account._id}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          logger.warn(`  ⚠️  Platform asset account for ${asset} already exists, skipping`);
          const existing = await accountService.findAccountByOwnerAndAsset({
            ownerId: 'PLATFORM',
            assetCode: asset,
          });
          platformAccounts[asset] = existing;
        } else {
          throw error;
        }
      }
    }

    // Create user asset accounts for each test user and asset
    const userAccounts: Record<string, Record<string, any>> = {};
    for (const userId of testUsers) {
      userAccounts[userId] = {};
      for (const asset of assets) {
        try {
          const account = await accountService.createAccount({
            ownerType: OwnerType.USER,
            ownerId: userId,
            assetCode: asset,
            accountType: AccountType.ASSET,
            metadata: { description: `${userId} asset account for ${asset}` },
          });
          userAccounts[userId][asset] = account;
          logger.log(`  ✅ Created ${userId} asset account for ${asset}: ${account._id}`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            logger.warn(`  ⚠️  ${userId} account for ${asset} already exists, skipping`);
            const existing = await accountService.findAccountByOwnerAndAsset({
              ownerId: userId,
              assetCode: asset,
            });
            userAccounts[userId][asset] = existing;
          } else {
            throw error;
          }
        }
      }
    }

    // Create a system equity account for initial funding source
    // This account can have negative balance (debits > credits) for seed funding
    const systemEquityAccounts: Record<string, any> = {};
    for (const asset of assets) {
      try {
        const account = await accountService.createAccount({
          ownerType: OwnerType.PLATFORM,
          ownerId: 'SYSTEM_EQUITY',
          assetCode: asset,
          accountType: AccountType.EQUITY,
          metadata: { description: `System equity account for ${asset} (initial capital source)` },
        });
        systemEquityAccounts[asset] = account;
        logger.log(`  ✅ Created system equity account for ${asset}: ${account._id}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          logger.warn(`  ⚠️  System equity account for ${asset} already exists, skipping`);
          const existing = await accountService.findAccountByOwnerAndAsset({
            ownerId: 'SYSTEM_EQUITY',
            assetCode: asset,
          });
          systemEquityAccounts[asset] = existing;
        } else {
          throw error;
        }
      }
    }

    // ============================================
    // 2. LEDGER: Fund User & Platform Accounts
    // ============================================
    logger.log('\n💰 Funding Accounts...');

    // Initial funding amounts per user (in major units)
    const initialFunding: Record<string, number> = {
      USD: 100,          // $100 USD
      BTC: 0,            // 0 BTC
      ETH: 0,            // 0 ETH
      BNB: 0,            // 0 BNB
      TRX: 0,            // 0 TRX
      BSS: 0,            // 0 BSS
      USDT: 0,           // 0 USDT (unified across all chains)
      USDC: 0,           // 0 USDC (unified across all chains)
      BUSD: 0,           // 0 BUSD (unified across all chains)
      XLM: 100,          // 100 XLM (Stellar native)
    };

    // Fund each user account
    // Debit system equity (source of funds, can go negative), Credit user asset (increases balance)
    for (const userId of testUsers) {
      for (const asset of assets) {
        const amountMajor = initialFunding[asset];
        const amountMinor = toMinorUnits(amountMajor, asset);

        try {
          await postingService.postJournalEntry({
            externalIdempotencyKey: `seed_fund_user_${userId}_${asset}`,
            narration: `Initial funding for ${userId}: ${amountMajor} ${asset}`,
            lines: [
              {
                accountId: String(systemEquityAccounts[asset]._id),
                direction: LineDirection.DEBIT,
                amountMinor,
                assetCode: asset,
              },
              {
                accountId: String(userAccounts[userId][asset]._id),
                direction: LineDirection.CREDIT,
                amountMinor,
                assetCode: asset,
              },
            ],
            correlationId: `seed_fund_user_${userId}`,
            metadata: {
              type: 'seed_user_funding',
              userId,
              asset,
            },
          });
          logger.log(`  ✅ Funded ${userId} with ${amountMajor} ${asset}`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            logger.warn(`  ⚠️  Funding for ${userId} ${asset} already exists, skipping`);
          } else {
            throw error;
          }
        }
      }
    }

    // Fund platform reserves
    // Debit system equity (source), Credit platform asset (increases balance)
    const platformFunding: Record<string, number> = {
      USD: 30000,          // Match total user funds
      BTC: 6,              // Bitcoin reserves
      ETH: 30,             // Ethereum reserves
      BNB: 100,            // BSC reserves
      TRX: 5000,           // Tron reserves
      BSS: 3000000,        // Venezuelan Bolivar reserves
      USDT: 30000,         // USDT reserves (combined from all chains)
      USDC: 30000,         // USDC reserves (combined from all chains)
      BUSD: 15000,         // BUSD reserves (combined from all chains)
      XLM: 10000,          // Stellar reserves
    };

    for (const asset of assets) {
      const amountMajor = platformFunding[asset];
      const amountMinor = toMinorUnits(amountMajor, asset);

      try {
        await postingService.postJournalEntry({
          externalIdempotencyKey: `seed_fund_platform_${asset}`,
          narration: `Initial platform reserve funding: ${amountMajor} ${asset}`,
          lines: [
            {
              accountId: String(systemEquityAccounts[asset]._id),
              direction: LineDirection.DEBIT,
              amountMinor,
              assetCode: asset,
            },
            {
              accountId: String(platformAccounts[asset]._id),
              direction: LineDirection.CREDIT,
              amountMinor,
              assetCode: asset,
            },
          ],
          correlationId: `seed_fund_platform`,
          metadata: {
            type: 'seed_platform_funding',
            asset,
          },
        });
        logger.log(`  ✅ Funded platform with ${amountMajor} ${asset}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          logger.warn(`  ⚠️  Platform funding for ${asset} already exists, skipping`);
        } else {
          throw error;
        }
      }
    }

    // ============================================
    // 3. PRICING: Create Price Providers
    // ============================================
    logger.log('\n💹 Seeding Price Providers...');

    const providers = [
      {
        name: 'binance',
        type: ProviderType.PRIVATE,
        assetPairs: ['USD/BTC', 'USD/ETH', 'BTC/ETH', 'USD/USDT'],
        weight: 0.6,
        enabled: true,
        endpoint: 'https://api.binance.com/api/v3/ticker/price',
        lastSuccessfulFetch: new Date(),
        consecutiveFailures: 0,
        metadata: { description: 'Binance exchange rates' },
      },
      {
        name: 'coinbase',
        type: ProviderType.PRIVATE,
        assetPairs: ['USD/BTC', 'USD/ETH', 'BTC/ETH'],
        weight: 0.4,
        enabled: true,
        endpoint: 'https://api.coinbase.com/v2/prices',
        lastSuccessfulFetch: new Date(),
        consecutiveFailures: 0,
        metadata: { description: 'Coinbase exchange rates' },
      },
      {
        name: 'banco_central_venezuela',
        type: ProviderType.OFFICIAL,
        assetPairs: ['USD/BSS', 'BSS/USD'],
        weight: 1.0,
        enabled: true,
        endpoint: 'https://bcv.org.ve/api/rates',
        lastSuccessfulFetch: new Date(),
        consecutiveFailures: 0,
        metadata: { description: 'Official Venezuelan Bolivar rates' },
      },
    ];

    for (const providerData of providers) {
      try {
        const provider = await priceOracleService.createProvider(providerData);
        logger.log(`  ✅ Created price provider: ${provider.name}`);
      } catch (error) {
        logger.warn(`  ⚠️  Provider ${providerData.name} might already exist: ${error.message}`);
      }
    }

    // ============================================
    // 4. PRICING: Exchange Rate History
    // ============================================
    // Note: Exchange rates are handled by the PriceOracleService's mock implementation
    // In production, these would come from real API providers
    logger.log('\n📊 Exchange Rates: Using built-in mock rates from PriceOracleService');

    // ============================================
    // 5. PRICING: Create Pricing Configurations
    // ============================================
    logger.log('\n⚙️  Seeding Pricing Configurations...');

    const pricingConfigs = [
      // Crypto pairs - Low spread (green band)
      { assetPair: 'USD/BTC', buySpread: 2.0, sellSpread: 2.0 },
      { assetPair: 'BTC/USD', buySpread: 2.0, sellSpread: 2.0 },
      { assetPair: 'USD/ETH', buySpread: 2.0, sellSpread: 2.0 },
      { assetPair: 'ETH/USD', buySpread: 2.0, sellSpread: 2.0 },
      { assetPair: 'BTC/ETH', buySpread: 1.5, sellSpread: 1.5 },
      { assetPair: 'ETH/BTC', buySpread: 1.5, sellSpread: 1.5 },

      // BNB pairs - Low spread (green band)
      { assetPair: 'USD/BNB', buySpread: 2.0, sellSpread: 2.0 },
      { assetPair: 'BNB/USD', buySpread: 2.0, sellSpread: 2.0 },
      { assetPair: 'BTC/BNB', buySpread: 1.5, sellSpread: 1.5 },
      { assetPair: 'BNB/BTC', buySpread: 1.5, sellSpread: 1.5 },
      { assetPair: 'ETH/BNB', buySpread: 1.5, sellSpread: 1.5 },
      { assetPair: 'BNB/ETH', buySpread: 1.5, sellSpread: 1.5 },

      // Fiat pairs - Very low spread (green band)
      { assetPair: 'USD/USDT', buySpread: 0.5, sellSpread: 0.5 },
      { assetPair: 'USDT/USD', buySpread: 0.5, sellSpread: 0.5 },

      // BSS pairs - Medium spread (green band)
      { assetPair: 'USD/BSS', buySpread: 3.0, sellSpread: 3.0 },
      { assetPair: 'BSS/USD', buySpread: 3.0, sellSpread: 3.0 },

      // Cross-crypto pairs
      { assetPair: 'BTC/BSS', buySpread: 2.5, sellSpread: 2.5 },
      { assetPair: 'ETH/BSS', buySpread: 2.5, sellSpread: 2.5 },
      { assetPair: 'BNB/BSS', buySpread: 2.5, sellSpread: 2.5 },
      { assetPair: 'BSS/BNB', buySpread: 2.5, sellSpread: 2.5 },

      // XLM pairs - Low spread (green band)
      { assetPair: 'USD/XLM', buySpread: 2.0, sellSpread: 2.0 },
      { assetPair: 'XLM/USD', buySpread: 2.0, sellSpread: 2.0 },
      { assetPair: 'BTC/XLM', buySpread: 1.5, sellSpread: 1.5 },
      { assetPair: 'XLM/BTC', buySpread: 1.5, sellSpread: 1.5 },
      { assetPair: 'ETH/XLM', buySpread: 1.5, sellSpread: 1.5 },
      { assetPair: 'XLM/ETH', buySpread: 1.5, sellSpread: 1.5 },
    ];

    for (const configData of pricingConfigs) {
      try {
        const config = await pricingConfigService.createConfiguration(configData);
        logger.log(
          `  ✅ Created pricing config: ${config.assetPair} (spread: ${config.totalSpread}%, band: ${config.currentBand})`,
        );
      } catch (error) {
        if (error.message.includes('already exists')) {
          logger.warn(`  ⚠️  Pricing config for ${configData.assetPair} already exists, skipping`);
        } else {
          throw error;
        }
      }
    }

    // ============================================
    // 6. SWAP: Create Platform Reserves
    // ============================================
    logger.log('\n🏦 Seeding Platform Reserves...');

    // Platform reserves are set based on total user deposits (3 users * initial funding)
    const reserves = [
      {
        assetCode: 'USD',
        virtualBalance: 30000,
        realBalance: 30000,
        exposureLimit: 100000, // $100k max exposure
      },
      {
        assetCode: 'BTC',
        virtualBalance: 6,
        realBalance: 6,
        exposureLimit: 10, // 10 BTC max exposure
      },
      {
        assetCode: 'ETH',
        virtualBalance: 30,
        realBalance: 30,
        exposureLimit: 100, // 100 ETH max exposure
      },
      {
        assetCode: 'BNB',
        virtualBalance: 100,
        realBalance: 100,
        exposureLimit: 500, // 500 BNB max exposure
      },
      {
        assetCode: 'TRX',
        virtualBalance: 5000,
        realBalance: 5000,
        exposureLimit: 20000, // 20k TRX max exposure
      },
      {
        assetCode: 'BSS',
        virtualBalance: 3000000,
        realBalance: 3000000,
        exposureLimit: 5000000, // 5M BSS max exposure
      },
      {
        assetCode: 'USDT',
        virtualBalance: 30000, // Combined reserves across BSC and ETH chains
        realBalance: 30000,
        exposureLimit: 100000, // $100k max exposure
      },
      {
        assetCode: 'USDC',
        virtualBalance: 30000, // Combined reserves across BSC and ETH chains
        realBalance: 30000,
        exposureLimit: 100000,
      },
      {
        assetCode: 'BUSD',
        virtualBalance: 15000, // BSC only
        realBalance: 15000,
        exposureLimit: 50000,
      },
      {
        assetCode: 'XLM',
        virtualBalance: 10000,
        realBalance: 10000,
        exposureLimit: 50000, // 50k XLM max exposure
      },
    ];

    for (const reserveData of reserves) {
      try {
        const reserve = await platformReservesService.createReserve(reserveData);
        logger.log(
          `  ✅ Created platform reserve: ${reserve.assetCode} (virtual: ${reserve.virtualBalance}, coverage: ${reserve.coverage.toFixed(2)})`,
        );
      } catch (error) {
        logger.warn(`  ⚠️  Reserve for ${reserveData.assetCode} might already exist: ${error.message}`);
      }
    }

    // ============================================
    // 5. CRYPTO: Create Custody Wallets
    // ============================================
    logger.log('\n🔐 Seeding Custody Wallets...');

    const custodyWallets = [
      {
        assetCode: 'BTC',
        blockchain: 'bitcoin' as const,
        mainAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Genesis address (example)
        balance: 10, // 10 BTC hot wallet
        maxWithdrawalPerTx: 1,
        maxWithdrawalPerHour: 5,
        maxWithdrawalPerDay: 20,
        minOperationalBalance: 1,
        alertThresholdPercentage: 20,
        multiSigThreshold: 1, // Require multi-sig for withdrawals > 1 BTC
        signaturesRequired: 2,
        kmsKeyId: 'btc-hot-wallet-key',
      },
      {
        assetCode: 'BNB',
        blockchain: 'bsc' as const,
        mainAddress: '0x0000000000000000000000000000000000000001', // Unique placeholder for BNB
        balance: 100, // 100 BNB hot wallet
        maxWithdrawalPerTx: 10,
        maxWithdrawalPerHour: 50,
        maxWithdrawalPerDay: 200,
        minOperationalBalance: 10,
        alertThresholdPercentage: 15,
        multiSigThreshold: 10, // Require multi-sig for withdrawals > 10 BNB
        signaturesRequired: 2,
        kmsKeyId: 'bnb-hot-wallet-key',
      },
      {
        assetCode: 'ETH',
        blockchain: 'ethereum' as const,
        mainAddress: '0x0000000000000000000000000000000000000002', // Unique placeholder for ETH
        balance: 50, // 50 ETH hot wallet
        maxWithdrawalPerTx: 5,
        maxWithdrawalPerHour: 25,
        maxWithdrawalPerDay: 100,
        minOperationalBalance: 5,
        alertThresholdPercentage: 15,
        multiSigThreshold: 5, // Require multi-sig for withdrawals > 5 ETH
        signaturesRequired: 2,
        kmsKeyId: 'eth-hot-wallet-key',
      },
      {
        assetCode: 'TRX',
        blockchain: 'tron' as const,
        mainAddress: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', // Placeholder Tron address
        balance: 5000, // 5k TRX hot wallet
        maxWithdrawalPerTx: 500,
        maxWithdrawalPerHour: 2000,
        maxWithdrawalPerDay: 10000,
        minOperationalBalance: 500,
        alertThresholdPercentage: 15,
        multiSigThreshold: 500, // Require multi-sig for withdrawals > 500 TRX
        signaturesRequired: 2,
        kmsKeyId: 'trx-hot-wallet-key',
      },
      // Note: Custody wallets use blockchain-specific asset codes (USDT_BSC, USDT_ETH, USDT_TRX, etc.)
      // but they map to unified ledger accounts (USDT, USDC, BUSD)
      {
        assetCode: 'USDT_BSC', // Blockchain-specific for custody/watchtower
        blockchain: 'bsc' as const,
        mainAddress: '0x0000000000000000000000000000000000000003', // Unique placeholder for USDT_BSC
        balance: 25000, // $25k USDT hot wallet on BSC (part of unified USDT reserves)
        maxWithdrawalPerTx: 5000,
        maxWithdrawalPerHour: 20000,
        maxWithdrawalPerDay: 50000,
        minOperationalBalance: 5000,
        alertThresholdPercentage: 15,
        multiSigThreshold: 5000, // Require multi-sig for withdrawals > $5k
        signaturesRequired: 2,
        kmsKeyId: 'usdt-bsc-hot-wallet-key',
      },
      {
        assetCode: 'USDC_BSC', // Blockchain-specific for custody/watchtower
        blockchain: 'bsc' as const,
        mainAddress: '0x0000000000000000000000000000000000000004', // Unique placeholder for USDC_BSC
        balance: 25000, // $25k USDC hot wallet on BSC (part of unified USDC reserves)
        maxWithdrawalPerTx: 5000,
        maxWithdrawalPerHour: 20000,
        maxWithdrawalPerDay: 50000,
        minOperationalBalance: 5000,
        alertThresholdPercentage: 15,
        multiSigThreshold: 5000,
        signaturesRequired: 2,
        kmsKeyId: 'usdc-bsc-hot-wallet-key',
      },
      {
        assetCode: 'USDT_ETH', // Blockchain-specific for custody/watchtower
        blockchain: 'ethereum' as const,
        mainAddress: '0x0000000000000000000000000000000000000005', // Unique placeholder for USDT_ETH
        balance: 25000, // $25k USDT hot wallet on Ethereum (part of unified USDT reserves)
        maxWithdrawalPerTx: 5000,
        maxWithdrawalPerHour: 20000,
        maxWithdrawalPerDay: 50000,
        minOperationalBalance: 5000,
        alertThresholdPercentage: 15,
        multiSigThreshold: 5000,
        signaturesRequired: 2,
        kmsKeyId: 'usdt-eth-hot-wallet-key',
      },
      {
        assetCode: 'USDC_ETH', // Blockchain-specific for custody/watchtower
        blockchain: 'ethereum' as const,
        mainAddress: '0x0000000000000000000000000000000000000006', // Unique placeholder for USDC_ETH
        balance: 25000, // $25k USDC hot wallet on Ethereum (part of unified USDC reserves)
        maxWithdrawalPerTx: 5000,
        maxWithdrawalPerHour: 20000,
        maxWithdrawalPerDay: 50000,
        minOperationalBalance: 5000,
        alertThresholdPercentage: 15,
        multiSigThreshold: 5000,
        signaturesRequired: 2,
        kmsKeyId: 'usdc-eth-hot-wallet-key',
      },
      {
        assetCode: 'BUSD_BSC', // Blockchain-specific for custody/watchtower
        blockchain: 'bsc' as const,
        mainAddress: '0x0000000000000000000000000000000000000007', // Unique placeholder for BUSD_BSC
        balance: 15000, // $15k BUSD hot wallet on BSC
        maxWithdrawalPerTx: 5000,
        maxWithdrawalPerHour: 20000,
        maxWithdrawalPerDay: 50000,
        minOperationalBalance: 5000,
        alertThresholdPercentage: 15,
        multiSigThreshold: 5000,
        signaturesRequired: 2,
        kmsKeyId: 'busd-bsc-hot-wallet-key',
      },
      {
        assetCode: 'USDT_TRX', // Blockchain-specific for custody/watchtower
        blockchain: 'tron' as const,
        mainAddress: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m8', // Placeholder for USDT_TRX
        balance: 15000, // $15k USDT hot wallet on Tron (part of unified USDT reserves)
        maxWithdrawalPerTx: 5000,
        maxWithdrawalPerHour: 20000,
        maxWithdrawalPerDay: 50000,
        minOperationalBalance: 5000,
        alertThresholdPercentage: 15,
        multiSigThreshold: 5000,
        signaturesRequired: 2,
        kmsKeyId: 'usdt-trx-hot-wallet-key',
      },
      {
        assetCode: 'USDC_TRX', // Blockchain-specific for custody/watchtower
        blockchain: 'tron' as const,
        mainAddress: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m7', // Placeholder for USDC_TRX
        balance: 15000, // $15k USDC hot wallet on Tron (part of unified USDC reserves)
        maxWithdrawalPerTx: 5000,
        maxWithdrawalPerHour: 20000,
        maxWithdrawalPerDay: 50000,
        minOperationalBalance: 5000,
        alertThresholdPercentage: 15,
        multiSigThreshold: 5000,
        signaturesRequired: 2,
        kmsKeyId: 'usdc-trx-hot-wallet-key',
      },
      {
        assetCode: 'XLM', // Native Stellar Lumens
        blockchain: 'stellar' as const,
        mainAddress: 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H', // Placeholder for XLM
        balance: 5000, // 5k XLM hot wallet
        maxWithdrawalPerTx: 1000,
        maxWithdrawalPerHour: 5000,
        maxWithdrawalPerDay: 10000,
        minOperationalBalance: 1000,
        alertThresholdPercentage: 20,
        multiSigThreshold: 2000,
        signaturesRequired: 2,
        kmsKeyId: 'xlm-hot-wallet-key',
      },
      {
        assetCode: 'USDC_XLM', // Blockchain-specific for custody/watchtower
        blockchain: 'stellar' as const,
        mainAddress: 'GADFVW3UXVKDOU626XUPYDJU2BFCGFJHQ6SREYOZ6IJV4XSHOALEQN2I', // Placeholder for USDC_XLM
        balance: 15000, // $15k USDC hot wallet on Stellar (part of unified USDC reserves)
        maxWithdrawalPerTx: 5000,
        maxWithdrawalPerHour: 20000,
        maxWithdrawalPerDay: 50000,
        minOperationalBalance: 5000,
        alertThresholdPercentage: 15,
        multiSigThreshold: 5000,
        signaturesRequired: 2,
        kmsKeyId: 'usdc-xlm-hot-wallet-key',
      },
    ];

    for (const walletData of custodyWallets) {
      try {
        const { balance, ...createParams } = walletData;
        const wallet = await custodyService.createWallet(createParams);
        
        // Fund the wallet with initial balance
        const balanceMinor = toMinorUnits(balance, walletData.assetCode);
        await custodyService.updateBalance(walletData.assetCode, balance, balanceMinor);
        
        logger.log(
          `  ✅ Created & funded custody wallet: ${wallet.assetCode} (balance: ${balance}, max per tx: ${wallet.maxWithdrawalPerTx})`,
        );
      } catch (error) {
        logger.warn(`  ⚠️  Custody wallet for ${walletData.assetCode} might already exist: ${error.message}`);
      }
    }

    // ============================================
    // Summary
    // ============================================
    logger.log('\n✨ Seed completed successfully!');
    logger.log('\n📊 Summary:');
    logger.log(`  - Created accounts for ${testUsers.length} test users`);
    logger.log(`  - Created platform accounts for ${assets.length} assets`);
    logger.log(`  - Funded all accounts with initial balances`);
    logger.log(`  - Created ${providers.length} price providers`);
    logger.log(`  - Created ${pricingConfigs.length} pricing configurations`);
    logger.log(`  - Created ${reserves.length} platform reserves`);
    logger.log(`  - Created ${custodyWallets.length} custody wallets (hot wallets)`);

    logger.log('\n🧪 Test Users:');
    for (const userId of testUsers) {
      logger.log(`  - ${userId}: Funded with USD, BTC, ETH, BNB, BSS, USDT, USDC, BUSD, XLM (unified accounts)`);
    }

    logger.log('\n💡 You can now:');
    logger.log('  1. Test swaps: POST /swap/execute');
    logger.log('  2. Check balances: GET /ledger/accounts/:id/balance');
    logger.log('  3. Get quotes: POST /swap/quote');
    logger.log('  4. View pricing: GET /pricing/configurations');
    logger.log('  5. Check reserves: GET /swap/admin/reserves');

  } catch (error) {
    logger.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

/**
 * Convert major units to minor units based on asset type.
 */
    function toMinorUnits(amount: number, assetCode: string): number {
      // Handle blockchain-specific asset codes (e.g., USDT_BSC, USDC_XLM)
      // Extract the base asset for conversion
      const baseAsset = assetCode.includes('_') ? assetCode.split('_')[0] : assetCode;
      const blockchain = assetCode.includes('_') ? assetCode.split('_')[1] : null;
      
      // TRX and TRX-based tokens use 6 decimals (SUN)
      if (baseAsset === 'TRX' || blockchain === 'TRX') {
        return Math.round(amount * Math.pow(10, 6));
      }
      // XLM and Stellar-based tokens use 7 decimals (stroops)
      if (baseAsset === 'XLM' || blockchain === 'XLM') {
        return Math.round(amount * Math.pow(10, 7));
      }
      // Crypto assets use 8 decimals
      const cryptoAssets = ['BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'BUSD'];
      const decimals = cryptoAssets.includes(baseAsset) ? 8 : 2;
      return Math.round(amount * Math.pow(10, decimals));
    }

// Run the seed
seed()
  .then(() => {
    logger.log('\n✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n❌ Seed script failed:', error);
    process.exit(1);
  });

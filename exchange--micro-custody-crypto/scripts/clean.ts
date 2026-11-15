import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';

// Import all schemas
import { Account } from '../src/ledger/models/account.schema';
import { JournalEntry } from '../src/ledger/models/journal-entry.schema';
import { JournalLine } from '../src/ledger/models/journal-line.schema';
import { Hold } from '../src/ledger/models/hold.schema';
import { PriceProvider } from '../src/pricing/models/price-provider.schema';
import { ExchangeRate } from '../src/pricing/models/exchange-rate.schema';
import { PricingConfiguration } from '../src/pricing/models/pricing-configuration.schema';
import { PricingBandLog } from '../src/pricing/models/pricing-band-log.schema';
import { SwapRequest } from '../src/swap/models/swap-request.schema';
import { SwapLimit } from '../src/swap/models/swap-limit.schema';
import { PlatformReserve } from '../src/swap/models/platform-reserve.schema';
import { UserAddress } from '../src/crypto/models/user-address.schema';
import { Deposit } from '../src/crypto/models/deposit.schema';
import { Withdrawal } from '../src/crypto/models/withdrawal.schema';
import { CustodyWallet } from '../src/crypto/models/custody-wallet.schema';
import { MultiSigRequest } from '../src/crypto/models/multi-sig-request.schema';
import { BlockchainScanState } from '../src/crypto/models/blockchain-scan-state.schema';

const logger = new Logger('CleanScript');

/**
 * Clean script to remove all documents from all collections.
 * Use this to reset the database to a clean state.
 */
async function clean() {
  logger.log('🧹 Starting database cleanup...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get all models
    const accountModel = app.get<Model<Account>>(getModelToken(Account.name));
    const journalEntryModel = app.get<Model<JournalEntry>>(getModelToken(JournalEntry.name));
    const journalLineModel = app.get<Model<JournalLine>>(getModelToken(JournalLine.name));
    const holdModel = app.get<Model<Hold>>(getModelToken(Hold.name));
    const priceProviderModel = app.get<Model<PriceProvider>>(getModelToken(PriceProvider.name));
    const exchangeRateModel = app.get<Model<ExchangeRate>>(getModelToken(ExchangeRate.name));
    const pricingConfigModel = app.get<Model<PricingConfiguration>>(getModelToken(PricingConfiguration.name));
    const pricingBandLogModel = app.get<Model<PricingBandLog>>(getModelToken(PricingBandLog.name));
    const swapRequestModel = app.get<Model<SwapRequest>>(getModelToken(SwapRequest.name));
    const swapLimitModel = app.get<Model<SwapLimit>>(getModelToken(SwapLimit.name));
    const platformReserveModel = app.get<Model<PlatformReserve>>(getModelToken(PlatformReserve.name));
    const userAddressModel = app.get<Model<UserAddress>>(getModelToken(UserAddress.name));
    const depositModel = app.get<Model<Deposit>>(getModelToken(Deposit.name));
    const withdrawalModel = app.get<Model<Withdrawal>>(getModelToken(Withdrawal.name));
    const custodyWalletModel = app.get<Model<CustodyWallet>>(getModelToken(CustodyWallet.name));
    const multiSigRequestModel = app.get<Model<MultiSigRequest>>(getModelToken(MultiSigRequest.name));
    const blockchainScanStateModel = app.get<Model<BlockchainScanState>>(getModelToken(BlockchainScanState.name));

    // Clean all collections
    logger.log('\n📒 Cleaning Ledger Module...');
    
    const accountsDeleted = await accountModel.deleteMany({});
    logger.log(`  ✅ Deleted ${accountsDeleted.deletedCount} accounts`);

    const journalEntriesDeleted = await journalEntryModel.deleteMany({});
    logger.log(`  ✅ Deleted ${journalEntriesDeleted.deletedCount} journal entries`);

    const journalLinesDeleted = await journalLineModel.deleteMany({});
    logger.log(`  ✅ Deleted ${journalLinesDeleted.deletedCount} journal lines`);

    const holdsDeleted = await holdModel.deleteMany({});
    logger.log(`  ✅ Deleted ${holdsDeleted.deletedCount} holds`);

    logger.log('\n💹 Cleaning Pricing Module...');

    const priceProvidersDeleted = await priceProviderModel.deleteMany({});
    logger.log(`  ✅ Deleted ${priceProvidersDeleted.deletedCount} price providers`);

    const exchangeRatesDeleted = await exchangeRateModel.deleteMany({});
    logger.log(`  ✅ Deleted ${exchangeRatesDeleted.deletedCount} exchange rates`);

    const pricingConfigsDeleted = await pricingConfigModel.deleteMany({});
    logger.log(`  ✅ Deleted ${pricingConfigsDeleted.deletedCount} pricing configurations`);

    const bandLogsDeleted = await pricingBandLogModel.deleteMany({});
    logger.log(`  ✅ Deleted ${bandLogsDeleted.deletedCount} pricing band logs`);

    logger.log('\n🔄 Cleaning Swap Module...');

    const swapRequestsDeleted = await swapRequestModel.deleteMany({});
    logger.log(`  ✅ Deleted ${swapRequestsDeleted.deletedCount} swap requests`);

    const swapLimitsDeleted = await swapLimitModel.deleteMany({});
    logger.log(`  ✅ Deleted ${swapLimitsDeleted.deletedCount} swap limits`);

    const platformReservesDeleted = await platformReserveModel.deleteMany({});
    logger.log(`  ✅ Deleted ${platformReservesDeleted.deletedCount} platform reserves`);

    logger.log('\n🔐 Cleaning Crypto Module...');

    const userAddressesDeleted = await userAddressModel.deleteMany({});
    logger.log(`  ✅ Deleted ${userAddressesDeleted.deletedCount} user addresses`);

    const depositsDeleted = await depositModel.deleteMany({});
    logger.log(`  ✅ Deleted ${depositsDeleted.deletedCount} deposits`);

    const withdrawalsDeleted = await withdrawalModel.deleteMany({});
    logger.log(`  ✅ Deleted ${withdrawalsDeleted.deletedCount} withdrawals`);

    const custodyWalletsDeleted = await custodyWalletModel.deleteMany({});
    logger.log(`  ✅ Deleted ${custodyWalletsDeleted.deletedCount} custody wallets`);

    const multiSigRequestsDeleted = await multiSigRequestModel.deleteMany({});
    logger.log(`  ✅ Deleted ${multiSigRequestsDeleted.deletedCount} multi-sig requests`);

    const blockchainScanStatesDeleted = await blockchainScanStateModel.deleteMany({});
    logger.log(`  ✅ Deleted ${blockchainScanStatesDeleted.deletedCount} blockchain scan states`);

    // Calculate totals
    const totalDeleted = 
      accountsDeleted.deletedCount +
      journalEntriesDeleted.deletedCount +
      journalLinesDeleted.deletedCount +
      holdsDeleted.deletedCount +
      priceProvidersDeleted.deletedCount +
      exchangeRatesDeleted.deletedCount +
      pricingConfigsDeleted.deletedCount +
      bandLogsDeleted.deletedCount +
      swapRequestsDeleted.deletedCount +
      swapLimitsDeleted.deletedCount +
      platformReservesDeleted.deletedCount +
      userAddressesDeleted.deletedCount +
      depositsDeleted.deletedCount +
      withdrawalsDeleted.deletedCount +
      custodyWalletsDeleted.deletedCount +
      multiSigRequestsDeleted.deletedCount +
      blockchainScanStatesDeleted.deletedCount;

    logger.log('\n✨ Database cleanup completed!');
    logger.log(`\n📊 Total documents deleted: ${totalDeleted}`);
    logger.log('\n💡 You can now run:');
    logger.log('  - pnpm seed    (to populate the database with test data)');

  } catch (error) {
    logger.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the cleanup
clean()
  .then(() => {
    logger.log('\n✅ Cleanup script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n❌ Cleanup script failed:', error);
    process.exit(1);
  });

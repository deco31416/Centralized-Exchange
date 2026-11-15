import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AccountService } from '../src/ledger/services/account.service';
import { BalanceService } from '../src/ledger/services/balance.service';
import { PlatformReservesService } from '../src/swap/services/platform-reserves.service';
import { Logger } from '@nestjs/common';
import { getLedgerDecimals, ledgerMinorToMajor } from '../src/ledger/utils/asset-decimals';

const logger = new Logger('TestBalancesScript');

/**
 * Helper to convert minor units to major units using ledger decimals
 */
function toMajorUnits(amountMinor: number, asset: string): number {
  return ledgerMinorToMajor(amountMinor, asset);
}

/**
 * Helper to format balance with padding using ledger decimals
 */
function formatBalance(amount: number, asset: string): string {
  const decimals = getLedgerDecimals(asset);
  
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted.padStart(20)} ${asset}`;
}

/**
 * Test script to check all account balances.
 */
async function testBalances() {
  logger.log('💰 Checking All Account Balances...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const accountService = app.get(AccountService);
    const balanceService = app.get(BalanceService);
    const reservesService = app.get(PlatformReservesService);

    const users = ['user1', 'user2', 'user3'];
    const assets = ['USD', 'BTC', 'ETH', 'BNB', 'BSS', 'USDT', 'USDC', 'BUSD', 'TRX', "XLM"];

    // Check user balances
    logger.log('👥 USER BALANCES:');
    logger.log('═'.repeat(80) + '\n');

    for (const userId of users) {
      logger.log(`📊 ${userId.toUpperCase()}:`);
      let totalUsdValue = 0;

      for (const asset of assets) {
        try {
          const account = await accountService.findAccountByOwnerAndAsset({
            ownerId: userId,
            assetCode: asset,
          });

          if (!account) {
            logger.warn(`  ${asset}: Account not found`);
            continue;
          }

          const balance = await balanceService.getAccountBalance({
            accountId: String(account._id),
            assetCode: asset,
          });

          const majorBalance = toMajorUnits(balance.balanceMinor, asset);
          const availableBalance = toMajorUnits(balance.availableMinor, asset);
          const heldBalance = toMajorUnits(balance.heldMinor, asset);

          logger.log(`  ${formatBalance(majorBalance, asset)}`);
          if (heldBalance > 0) {
            logger.log(
              `    └─ Available: ${availableBalance} ${asset} (Held: ${heldBalance} ${asset})`,
            );
          }
        } catch (error) {
          logger.warn(`  ${asset}: Account not found`);
        }
      }
      logger.log('');
    }

    // Check platform balances
    logger.log('🏦 PLATFORM BALANCES:');
    logger.log('═'.repeat(80) + '\n');

    for (const asset of assets) {
      try {
        const account = await accountService.findAccountByOwnerAndAsset({
          ownerId: 'PLATFORM',
          assetCode: asset,
        });

        if (!account) {
          logger.warn(`  ${asset}: Account not found`);
          continue;
        }

        const balance = await balanceService.getAccountBalance({
          accountId: String(account._id),
          assetCode: asset,
        });

        const majorBalance = toMajorUnits(balance.balanceMinor, asset);
        logger.log(`  ${formatBalance(majorBalance, asset)}`);
      } catch (error) {
        logger.warn(`  ${asset}: Account not found`);
      }
    }

    // Check platform reserves
    logger.log('\n💎 PLATFORM RESERVES:');
    logger.log('═'.repeat(80) + '\n');

    for (const asset of assets) {
      try {
        const reserve = await reservesService.getReserve(asset);
        const coverage = (reserve.realBalance / reserve.virtualBalance) * 100;

        logger.log(`  ${asset}:`);
        logger.log(`    Virtual Balance:  ${reserve.virtualBalance.toLocaleString()}`);
        logger.log(`    Real Balance:     ${reserve.realBalance.toLocaleString()}`);
        logger.log(`    Exposure Limit:   ${reserve.exposureLimit.toLocaleString()}`);
        logger.log(`    Coverage Ratio:   ${coverage.toFixed(2)}%`);
        logger.log('');
      } catch (error) {
        logger.warn(`  ${asset}: Reserve not found\n`);
      }
    }

    // System equity (funding source)
    logger.log('⚖️  SYSTEM EQUITY (Funding Source):');
    logger.log('═'.repeat(80) + '\n');

    for (const asset of assets) {
      try {
        const account = await accountService.findAccountByOwnerAndAsset({
          ownerId: 'SYSTEM_EQUITY',
          assetCode: asset,
        });

        if (!account) {
          logger.warn(`  ${asset}: Account not found`);
          continue;
        }

        const balance = await balanceService.getAccountBalance({
          accountId: String(account._id),
          assetCode: asset,
        });

        const majorBalance = toMajorUnits(balance.balanceMinor, asset);
        logger.log(`  ${formatBalance(majorBalance, asset)}`);
      } catch (error) {
        logger.warn(`  ${asset}: Account not found`);
      }
    }

    logger.log('\n✅ Balance check completed successfully!');
  } catch (error) {
    logger.error('❌ Balance check failed:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the test
testBalances()
  .then(() => {
    logger.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n❌ Test script failed:', error);
    process.exit(1);
  });

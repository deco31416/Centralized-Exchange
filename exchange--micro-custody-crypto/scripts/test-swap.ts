import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SwapExecutionService } from '../src/swap/services/swap-execution.service';
import { AccountService } from '../src/ledger/services/account.service';
import { BalanceService } from '../src/ledger/services/balance.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('TestSwapScript');

/**
 * Helper to convert minor units to major units
 */
function toMajorUnits(amountMinor: number, asset: string): number {
  const decimals = asset === 'BTC' || asset === 'ETH' ? 8 : 2;
  return amountMinor / Math.pow(10, decimals);
}

/**
 * Test script to demonstrate swapping assets.
 */
async function testSwap() {
  logger.log('🔄 Testing Swap Functionality...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const swapService = app.get(SwapExecutionService);
    const accountService = app.get(AccountService);
    const balanceService = app.get(BalanceService);

    // Test parameters
    const userId = 'user1';
    const fromAsset = 'USD';
    const toAsset = 'BTC';
    const fromAmount = 1000; // $1,000

    logger.log('📋 Test Parameters:');
    logger.log(`  User: ${userId}`);
    logger.log(`  From: ${fromAmount} ${fromAsset}`);
    logger.log(`  To: ${toAsset}\n`);

    // Get accounts
    logger.log('🔍 Finding accounts...');
    const fromAccount = await accountService.findAccountByOwnerAndAsset({
      ownerId: userId,
      assetCode: fromAsset,
    });
    const toAccount = await accountService.findAccountByOwnerAndAsset({
      ownerId: userId,
      assetCode: toAsset,
    });

    if (!fromAccount || !toAccount) {
      throw new Error('One or both accounts not found');
    }

    logger.log(`  ${fromAsset} account: ${fromAccount._id}`);
    logger.log(`  ${toAsset} account: ${toAccount._id}\n`);

    // Check balances before
    logger.log('💰 Balances BEFORE swap:');
    const fromBalanceBefore = await balanceService.getAccountBalance({
      accountId: String(fromAccount._id),
      assetCode: fromAsset,
    });
    const toBalanceBefore = await balanceService.getAccountBalance({
      accountId: String(toAccount._id),
      assetCode: toAsset,
    });

    logger.log(
      `  ${fromAsset}: ${toMajorUnits(fromBalanceBefore.balanceMinor, fromAsset)}`,
    );
    logger.log(
      `  ${toAsset}: ${toMajorUnits(toBalanceBefore.balanceMinor, toAsset)}\n`,
    );

    // Execute swap
    logger.log('🚀 Executing swap...');
    const swapResult = await swapService.executeSwap(
      {
        fromAsset,
        toAsset,
        fromAmount,
        idempotencyKey: `test_swap_${Date.now()}`,
      },
      userId,
    );

    logger.log(`  ✅ Swap executed: ${swapResult.swapId}\n`);

    // Show swap details
    logger.log('📊 Swap Details:');
    logger.log(`  Exchange Rate: ${swapResult.executedRate} ${fromAsset}/${toAsset}`);
    logger.log(`  Amount Given: ${swapResult.fromAmount} ${fromAsset}`);
    logger.log(`  Amount Received: ${swapResult.toAmount} ${toAsset}`);
    logger.log(`  Spread Applied: ${swapResult.spread}%`);
    logger.log(`  Pricing Band: ${swapResult.pricingBand}`);
    logger.log(`  Status: ${swapResult.status}`);

    // Check balances after
    logger.log('💰 Balances AFTER swap:');
    const fromBalanceAfter = await balanceService.getAccountBalance({
      accountId: String(fromAccount._id),
      assetCode: fromAsset,
    });
    const toBalanceAfter = await balanceService.getAccountBalance({
      accountId: String(toAccount._id),
      assetCode: toAsset,
    });

    logger.log(
      `  ${fromAsset}: ${toMajorUnits(fromBalanceAfter.balanceMinor, fromAsset)} (${toMajorUnits(fromBalanceAfter.balanceMinor - fromBalanceBefore.balanceMinor, fromAsset)})`,
    );
    logger.log(
      `  ${toAsset}: ${toMajorUnits(toBalanceAfter.balanceMinor, toAsset)} (+${toMajorUnits(toBalanceAfter.balanceMinor - toBalanceBefore.balanceMinor, toAsset)})\n`,
    );

    // Summary
    logger.log('\n✅ Swap test completed successfully!');
    logger.log('\n📈 Summary:');
    logger.log(
      `  - Swapped ${swapResult.fromAmount} ${fromAsset} for ${swapResult.toAmount} ${toAsset}`,
    );
    logger.log(`  - Effective rate: ${swapResult.executedRate}`);
    logger.log(`  - Ledger Entry ID: ${swapResult.ledgerEntryId}`);
    logger.log(`  - Swap ID: ${swapResult.swapId}`);
  } catch (error) {
    logger.error('❌ Swap test failed:', error.message);
    if (error.response) {
      logger.error('Error details:', error.response);
    }
    throw error;
  } finally {
    await app.close();
  }
}

// Run the test
testSwap()
  .then(() => {
    logger.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n❌ Test script failed:', error);
    process.exit(1);
  });

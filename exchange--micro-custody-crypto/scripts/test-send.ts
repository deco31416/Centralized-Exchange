import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PostingService } from '../src/ledger/services/posting.service';
import { AccountService } from '../src/ledger/services/account.service';
import { BalanceService } from '../src/ledger/services/balance.service';
import { LineDirection } from '../src/ledger/models/journal-line.schema';
import { Logger } from '@nestjs/common';

const logger = new Logger('TestSendScript');

/**
 * Helper to convert major units to minor units
 */
function toMinorUnits(amount: number, asset: string): number {
  const decimals = asset === 'BTC' || asset === 'ETH' ? 8 : 2;
  return Math.round(amount * Math.pow(10, decimals));
}

/**
 * Helper to convert minor units to major units
 */
function toMajorUnits(amountMinor: number, asset: string): number {
  const decimals = asset === 'BTC' || asset === 'ETH' ? 8 : 2;
  return amountMinor / Math.pow(10, decimals);
}

/**
 * Test script to demonstrate sending assets between users.
 */
async function testSend() {
  logger.log('💸 Testing Send Functionality...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const postingService = app.get(PostingService);
    const accountService = app.get(AccountService);
    const balanceService = app.get(BalanceService);

    // Test parameters
    const fromUserId = 'user1';
    const toUserId = 'user2';
    const asset = 'USD';
    const sendAmount = 100; // $100

    logger.log('📋 Test Parameters:');
    logger.log(`  From: ${fromUserId}`);
    logger.log(`  To: ${toUserId}`);
    logger.log(`  Asset: ${asset}`);
    logger.log(`  Amount: ${sendAmount} ${asset}\n`);

    // Get accounts
    logger.log('🔍 Finding accounts...');
    const fromAccount = await accountService.findAccountByOwnerAndAsset({
      ownerId: fromUserId,
      assetCode: asset,
    });
    const toAccount = await accountService.findAccountByOwnerAndAsset({
      ownerId: toUserId,
      assetCode: asset,
    });

    if (!fromAccount || !toAccount) {
      throw new Error('One or both accounts not found');
    }

    logger.log(`  From account: ${fromAccount._id}`);
    logger.log(`  To account: ${toAccount._id}\n`);

    // Check balances before
    logger.log('💰 Balances BEFORE send:');
    const fromBalanceBefore = await balanceService.getAccountBalance({
      accountId: String(fromAccount._id),
      assetCode: asset,
    });
    const toBalanceBefore = await balanceService.getAccountBalance({
      accountId: String(toAccount._id),
      assetCode: asset,
    });

    logger.log(
      `  ${fromUserId}: ${toMajorUnits(fromBalanceBefore.balanceMinor, asset)} ${asset}`,
    );
    logger.log(
      `  ${toUserId}: ${toMajorUnits(toBalanceBefore.balanceMinor, asset)} ${asset}\n`,
    );

    // Execute send (transfer)
    logger.log('🚀 Executing send...');
    const amountMinor = toMinorUnits(sendAmount, asset);

    const entry = await postingService.postJournalEntry({
      externalIdempotencyKey: `test_send_${Date.now()}`,
      narration: `Test send: ${fromUserId} → ${toUserId} (${sendAmount} ${asset})`,
      lines: [
        {
          accountId: String(fromAccount._id),
          direction: LineDirection.DEBIT,
          amountMinor,
          assetCode: asset,
        },
        {
          accountId: String(toAccount._id),
          direction: LineDirection.CREDIT,
          amountMinor,
          assetCode: asset,
        },
      ],
      correlationId: `test_send_${Date.now()}`,
      metadata: {
        type: 'user_transfer',
        fromUserId,
        toUserId,
        asset,
      },
    });

    logger.log(`  ✅ Transaction posted: ${entry._id}\n`);

    // Check balances after
    logger.log('💰 Balances AFTER send:');
    const fromBalanceAfter = await balanceService.getAccountBalance({
      accountId: String(fromAccount._id),
      assetCode: asset,
    });
    const toBalanceAfter = await balanceService.getAccountBalance({
      accountId: String(toAccount._id),
      assetCode: asset,
    });

    logger.log(
      `  ${fromUserId}: ${toMajorUnits(fromBalanceAfter.balanceMinor, asset)} ${asset} (${toMajorUnits(fromBalanceAfter.balanceMinor - fromBalanceBefore.balanceMinor, asset)} ${asset})`,
    );
    logger.log(
      `  ${toUserId}: ${toMajorUnits(toBalanceAfter.balanceMinor, asset)} ${asset} (+${toMajorUnits(toBalanceAfter.balanceMinor - toBalanceBefore.balanceMinor, asset)} ${asset})\n`,
    );

    // Summary
    logger.log('✅ Send test completed successfully!');
    logger.log('\n📊 Summary:');
    logger.log(`  - ${sendAmount} ${asset} transferred from ${fromUserId} to ${toUserId}`);
    logger.log(`  - Transaction ID: ${entry._id}`);
    logger.log(`  - Status: ${entry.status}`);
  } catch (error) {
    logger.error('❌ Send test failed:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the test
testSend()
  .then(() => {
    logger.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n❌ Test script failed:', error);
    process.exit(1);
  });

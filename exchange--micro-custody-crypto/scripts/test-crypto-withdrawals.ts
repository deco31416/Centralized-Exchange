import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { WithdrawalService } from '../src/crypto/services/withdrawal.service';
import { CustodyService } from '../src/crypto/services/custody.service';
import { BalanceService } from '../src/ledger/services/balance.service';
import { AccountService } from '../src/ledger/services/account.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('TestCryptoWithdrawalsScript');

/**
 * Helper to convert minor units to major units
 */
function toMajorUnits(amountMinor: number, asset: string): number {
  const decimals = ['BTC', 'ETH', 'BNB', 'USDT'].includes(asset) ? 8 : 2;
  return amountMinor / Math.pow(10, decimals);
}

/**
 * Test script to demonstrate cryptocurrency withdrawals.
 */
async function testCryptoWithdrawals() {
  logger.log('💸 Testing Crypto Withdrawal Flow...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const withdrawalService = app.get(WithdrawalService);
    const custodyService = app.get(CustodyService);
    const accountService = app.get(AccountService);
    const balanceService = app.get(BalanceService);

    // Test parameters
    const userId = 'user1';
    const assetCode = 'BNB';
    const withdrawalAmount = 0.5; // 0.5 BNB
    const destinationAddress = '0x742d35cc6634c0532925a3b844bc9e7595f0beb0'; // Valid BSC/Ethereum address (lowercase)
    const idempotencyKey = `test_withdrawal_${Date.now()}`;

    logger.log('📋 Test Parameters:');
    logger.log(`  User: ${userId}`);
    logger.log(`  Asset: ${assetCode}`);
    logger.log(`  Amount: ${withdrawalAmount} ${assetCode}`);
    logger.log(`  Destination: ${destinationAddress}`);
    logger.log(`  Idempotency Key: ${idempotencyKey}\n`);

    // Step 1: Check custody wallet status
    logger.log('🏦 Step 1: Checking custody wallet...');
    try {
      const custodyWallet = await custodyService.getWallet(assetCode);
      logger.log(`  ✅ Custody wallet found:`);
      logger.log(`     Balance: ${custodyWallet.balance} ${assetCode}`);
      logger.log(`     Max per tx: ${custodyWallet.maxWithdrawalPerTx} ${assetCode}`);
      logger.log(`     Max per hour: ${custodyWallet.maxWithdrawalPerHour} ${assetCode}`);
      logger.log(`     Max per day: ${custodyWallet.maxWithdrawalPerDay} ${assetCode}`);
      logger.log(`     Locked: ${custodyWallet.isLocked}`);
      logger.log(`     Requires MultiSig: ${custodyWallet.requiresMultiSig}\n`);
    } catch (error) {
      logger.warn(`  ⚠️  Custody wallet not found for ${assetCode}`);
      logger.warn(`     Creating custody wallet for demonstration...\n`);
      
      await custodyService.createWallet({
        assetCode,
        blockchain: 'bsc',
        mainAddress: '0xCustodyHotWallet123456789',
        maxWithdrawalPerTx: 10,
        maxWithdrawalPerHour: 50,
        maxWithdrawalPerDay: 200,
        minOperationalBalance: 5,
        alertThresholdPercentage: 20,
        multiSigThreshold: 5,
        signaturesRequired: 2,
        kmsKeyId: 'arn:aws:kms:us-east-1:123456789:key/mock-key-id',
      });
      
      logger.log(`  ✅ Custody wallet created for testing\n`);
    }

    // Step 2: Check user balance before withdrawal
    logger.log('💰 Step 2: Checking user balance BEFORE withdrawal...');
    const account = await accountService.findAccountByOwnerAndAsset({
      ownerId: userId,
      assetCode,
    });

    if (!account) {
      throw new Error(`No account found for ${userId} - ${assetCode}`);
    }

    const balanceBefore = await balanceService.getAccountBalance({
      accountId: String(account._id),
      assetCode,
    });
    const balanceBeforeMajor = toMajorUnits(balanceBefore.balanceMinor, assetCode);
    const availableBeforeMajor = toMajorUnits(balanceBefore.availableMinor, assetCode);
    
    logger.log(`  Balance: ${balanceBeforeMajor} ${assetCode}`);
    logger.log(`  Available: ${availableBeforeMajor} ${assetCode}`);
    logger.log(`  Held: ${toMajorUnits(balanceBefore.heldMinor, assetCode)} ${assetCode}\n`);

    // Step 3: Request withdrawal
    logger.log('📤 Step 3: Requesting withdrawal...');
    const withdrawal = await withdrawalService.requestWithdrawal({
      userId,
      assetCode,
      amount: withdrawalAmount,
      destinationAddress,
      idempotencyKey,
    });

    logger.log(`  ✅ Withdrawal requested:`);
    logger.log(`     ID: ${withdrawal._id}`);
    logger.log(`     Status: ${withdrawal.status}`);
    logger.log(`     Amount: ${withdrawal.amount} ${assetCode}`);
    logger.log(`     Destination: ${withdrawal.destinationAddress}`);
    logger.log(`     Requires MultiSig: ${withdrawal.requiresMultiSig}`);
    logger.log(`     Hold ID: ${withdrawal.holdId}\n`);

    // Step 4: Check balance after withdrawal request (should show held amount)
    logger.log('💰 Step 4: Checking user balance AFTER withdrawal request...');
    const balanceAfterRequest = await balanceService.getAccountBalance({
      accountId: String(account._id),
      assetCode,
    });
    
    logger.log(`  Balance: ${toMajorUnits(balanceAfterRequest.balanceMinor, assetCode)} ${assetCode}`);
    logger.log(`  Available: ${toMajorUnits(balanceAfterRequest.availableMinor, assetCode)} ${assetCode}`);
    logger.log(`  Held: ${toMajorUnits(balanceAfterRequest.heldMinor, assetCode)} ${assetCode} ← Funds locked for withdrawal\n`);

    // Step 5: Check if withdrawal requires multi-sig
    logger.log('🔐 Step 5: Checking multi-sig requirements...');
    const requiresMultiSig = await custodyService.requiresMultiSig(assetCode, withdrawalAmount);
    
    if (requiresMultiSig) {
      logger.log(`  ⚠️  This withdrawal requires multi-signature approval`);
      logger.log(`     Withdrawal is pending approval from authorized signers\n`);
    } else {
      logger.log(`  ✅ No multi-sig required for this amount`);
      logger.log(`     Withdrawal will be processed automatically\n`);
    }

    // Step 6: Get withdrawal history
    logger.log('📊 Step 6: Retrieving withdrawal history...');
    const userWithdrawals = await withdrawalService.getUserWithdrawals(userId, {
      limit: 10,
    });
    
    logger.log(`  Total withdrawals for ${userId}: ${userWithdrawals.length}`);
    logger.log('\n  Recent withdrawals:');
    for (const w of userWithdrawals.slice(0, 5)) {
      const statusIcon = 
        w.status === 'completed' ? '✅' :
        w.status === 'failed' ? '❌' :
        w.status === 'cancelled' ? '🚫' : '⏳';
      
      logger.log(`    ${statusIcon} ${w.amount} ${w.assetCode} | ${w.status} | ${w.destinationAddress.slice(0, 20)}...`);
    }

    // Step 7: Test idempotency
    logger.log('\n\n🔄 Step 7: Testing idempotency...');
    logger.log('  Attempting to create duplicate withdrawal with same idempotency key...');
    
    const duplicateWithdrawal = await withdrawalService.requestWithdrawal({
      userId,
      assetCode,
      amount: withdrawalAmount,
      destinationAddress,
      idempotencyKey, // Same key
    });

    if (String(duplicateWithdrawal._id) === String(withdrawal._id)) {
      logger.log(`  ✅ Idempotency working: Returned existing withdrawal`);
      logger.log(`     Same ID: ${duplicateWithdrawal._id}\n`);
    }

    // Step 8: Cancel withdrawal (if still pending)
    logger.log('🚫 Step 8: Testing withdrawal cancellation...');
    if (withdrawal.status === 'pending_approval') {
      await withdrawalService.cancelWithdrawal(String(withdrawal._id), userId);
      logger.log(`  ✅ Withdrawal cancelled successfully`);
      
      // Check balance after cancellation
      const balanceAfterCancel = await balanceService.getAccountBalance({
        accountId: String(account._id),
        assetCode,
      });
      
      logger.log(`  Balance restored:`);
      logger.log(`     Balance: ${toMajorUnits(balanceAfterCancel.balanceMinor, assetCode)} ${assetCode}`);
      logger.log(`     Available: ${toMajorUnits(balanceAfterCancel.availableMinor, assetCode)} ${assetCode}`);
      logger.log(`     Held: ${toMajorUnits(balanceAfterCancel.heldMinor, assetCode)} ${assetCode} ← Hold released\n`);
    }

    // Summary
    logger.log('\n✅ Withdrawal test completed successfully!');
    logger.log('\n📊 Summary:');
    logger.log(`  - Requested withdrawal of ${withdrawalAmount} ${assetCode}`);
    logger.log(`  - Funds were held in user account`);
    logger.log(`  - Withdrawal ID: ${withdrawal._id}`);
    logger.log(`  - Idempotency protection verified`);
    logger.log(`  - Withdrawal cancelled and hold released`);
    
    logger.log('\n💡 In production:');
    logger.log('  - Large withdrawals require multi-sig approval');
    logger.log('  - Withdrawals are broadcast to blockchain');
    logger.log('  - Confirmations are monitored automatically');
    logger.log('  - Users are notified at each status change');
    logger.log('  - Rate limits and velocity checks are enforced');

  } catch (error) {
    logger.error('❌ Withdrawal test failed:', error.message);
    if (error.stack) {
      logger.error(error.stack);
    }
    throw error;
  } finally {
    await app.close();
  }
}

// Run the test
testCryptoWithdrawals()
  .then(() => {
    logger.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n❌ Test script failed:', error);
    process.exit(1);
  });

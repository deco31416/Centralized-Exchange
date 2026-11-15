import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CustodyService } from '../src/crypto/services/custody.service';
import { ReconciliationService } from '../src/crypto/services/reconciliation.service';
import { MultiSigService } from '../src/crypto/services/multi-sig.service';
import { WatchtowerService } from '../src/crypto/services/watchtower.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('TestCryptoCustodyScript');

/**
 * Test script to demonstrate custody wallet management and reconciliation.
 */
async function testCryptoCustody() {
  logger.log('🏦 Testing Crypto Custody & Reconciliation...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const custodyService = app.get(CustodyService);
    const reconciliationService = app.get(ReconciliationService);
    const multiSigService = app.get(MultiSigService);
    const watchtowerService = app.get(WatchtowerService);

    // ============================================
    // 1. CUSTODY WALLET MANAGEMENT
    // ============================================
    logger.log('═'.repeat(80));
    logger.log('1️⃣  CUSTODY WALLET MANAGEMENT');
    logger.log('═'.repeat(80) + '\n');

    // Create custody wallets for different assets
    const walletConfigs = [
      {
        assetCode: 'BTC',
        blockchain: 'bitcoin' as const,
        mainAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        maxWithdrawalPerTx: 1,
        maxWithdrawalPerHour: 5,
        maxWithdrawalPerDay: 20,
        minOperationalBalance: 0.5,
        alertThresholdPercentage: 25,
        multiSigThreshold: 0.5,
        signaturesRequired: 2,
        kmsKeyId: 'arn:aws:kms:us-east-1:123456789:key/btc-wallet',
      },
      {
        assetCode: 'BNB',
        blockchain: 'bsc' as const,
        mainAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        maxWithdrawalPerTx: 10,
        maxWithdrawalPerHour: 50,
        maxWithdrawalPerDay: 200,
        minOperationalBalance: 5,
        alertThresholdPercentage: 20,
        multiSigThreshold: 5,
        signaturesRequired: 2,
        kmsKeyId: 'arn:aws:kms:us-east-1:123456789:key/bnb-wallet',
      },
      {
        assetCode: 'ETH',
        blockchain: 'ethereum' as const,
        mainAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        maxWithdrawalPerTx: 5,
        maxWithdrawalPerHour: 20,
        maxWithdrawalPerDay: 100,
        minOperationalBalance: 2,
        alertThresholdPercentage: 20,
        multiSigThreshold: 3,
        signaturesRequired: 2,
        kmsKeyId: 'arn:aws:kms:us-east-1:123456789:key/eth-wallet',
      },
    ];

    logger.log('📝 Creating custody wallets...\n');
    for (const config of walletConfigs) {
      try {
        const wallet = await custodyService.createWallet(config);
        logger.log(`✅ ${config.assetCode} Custody Wallet:`);
        logger.log(`   Address: ${wallet.mainAddress}`);
        logger.log(`   Blockchain: ${wallet.blockchain}`);
        logger.log(`   Max/Tx: ${wallet.maxWithdrawalPerTx} ${config.assetCode}`);
        logger.log(`   Max/Hour: ${wallet.maxWithdrawalPerHour} ${config.assetCode}`);
        logger.log(`   Max/Day: ${wallet.maxWithdrawalPerDay} ${config.assetCode}`);
        logger.log(`   MultiSig Threshold: ${wallet.multiSigThreshold} ${config.assetCode}`);
        logger.log(`   Signatures Required: ${wallet.signaturesRequired}`);
        logger.log(`   KMS Key: ${wallet.kmsKeyId}\n`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          logger.warn(`⚠️  ${config.assetCode} wallet already exists, skipping\n`);
        } else {
          throw error;
        }
      }
    }

    // Get all custody wallets
    logger.log('📊 Retrieving all custody wallets...\n');
    const allWallets = await custodyService.getAllWallets();
    logger.log(`Total active wallets: ${allWallets.length}\n`);

    for (const wallet of allWallets) {
      logger.log(`🏦 ${wallet.assetCode}:`);
      logger.log(`   Balance: ${wallet.balance} ${wallet.assetCode}`);
      logger.log(`   Status: ${wallet.isLocked ? '🔒 Locked' : '🔓 Active'}`);
      logger.log(`   Hour Withdrawals: ${wallet.currentHourWithdrawals}/${wallet.maxWithdrawalPerHour}`);
      logger.log(`   Day Withdrawals: ${wallet.currentDayWithdrawals}/${wallet.maxWithdrawalPerDay}`);
      logger.log(`   Last Check: ${wallet.lastBalanceCheck?.toLocaleString() || 'Never'}\n`);
    }

    // ============================================
    // 2. WITHDRAWAL LIMIT VALIDATION
    // ============================================
    logger.log('═'.repeat(80));
    logger.log('2️⃣  WITHDRAWAL LIMIT VALIDATION');
    logger.log('═'.repeat(80) + '\n');

    // Test valid withdrawal
    logger.log('✅ Testing VALID withdrawal (0.5 BNB)...');
    try {
      await custodyService.validateWithdrawalLimits('BNB', 0.5);
      logger.log('   ✅ Validation passed\n');
    } catch (error) {
      logger.error(`   ❌ Validation failed: ${error.message}\n`);
    }

    // Test withdrawal exceeding limit
    logger.log('❌ Testing INVALID withdrawal (15 BNB - exceeds max/tx of 10)...');
    try {
      await custodyService.validateWithdrawalLimits('BNB', 15);
      logger.log('   ⚠️  Validation should have failed!\n');
    } catch (error) {
      logger.log(`   ✅ Validation correctly rejected: ${error.message}\n`);
    }

    // ============================================
    // 3. MULTI-SIG REQUIREMENTS
    // ============================================
    logger.log('═'.repeat(80));
    logger.log('3️⃣  MULTI-SIG APPROVAL TESTING');
    logger.log('═'.repeat(80) + '\n');

    // Check multi-sig requirements for different amounts
    const testAmounts = [1, 5, 10]; // BNB amounts

    for (const amount of testAmounts) {
      const requiresMultiSig = await custodyService.requiresMultiSig('BNB', amount);
      const icon = requiresMultiSig ? '🔐' : '✅';
      logger.log(`${icon} ${amount} BNB: ${requiresMultiSig ? 'Requires Multi-Sig' : 'Auto-approved'}`);
    }

    logger.log('\n📋 Authorized Signers:');
    const signers = multiSigService.getAuthorizedSigners();
    for (const signer of signers) {
      logger.log(`   - ${signer}`);
    }

    // Get pending multi-sig requests
    logger.log('\n📬 Pending Multi-Sig Requests:');
    const pendingRequests = await multiSigService.getPendingMultiSigRequests();
    logger.log(`   Total pending: ${pendingRequests.length}\n`);

    // ============================================
    // 4. WALLET LOCK/UNLOCK (Emergency)
    // ============================================
    logger.log('═'.repeat(80));
    logger.log('4️⃣  EMERGENCY WALLET CONTROLS');
    logger.log('═'.repeat(80) + '\n');

    // Lock a wallet
    logger.log('🔒 Testing wallet lock (emergency)...');
    await custodyService.lockWallet('BNB', 'Test emergency lock');
    const lockedWallet = await custodyService.getWallet('BNB');
    logger.log(`   Status: ${lockedWallet.isLocked ? '🔒 LOCKED' : '🔓 Active'}\n`);

    // Try to validate withdrawal on locked wallet
    logger.log('🚫 Testing withdrawal on LOCKED wallet...');
    try {
      await custodyService.validateWithdrawalLimits('BNB', 1);
      logger.log('   ⚠️  Should have been blocked!\n');
    } catch (error) {
      logger.log(`   ✅ Correctly blocked: ${error.message}\n`);
    }

    // Unlock wallet
    logger.log('🔓 Unlocking wallet...');
    await custodyService.unlockWallet('BNB');
    const unlockedWallet = await custodyService.getWallet('BNB');
    logger.log(`   Status: ${unlockedWallet.isLocked ? '🔒 Locked' : '🔓 ACTIVE'}\n`);

    // ============================================
    // 5. UPDATE WALLET LIMITS
    // ============================================
    logger.log('═'.repeat(80));
    logger.log('5️⃣  DYNAMIC LIMIT UPDATES');
    logger.log('═'.repeat(80) + '\n');

    logger.log('⚙️  Updating BNB wallet limits...');
    const updatedWallet = await custodyService.updateLimits('BNB', {
      maxWithdrawalPerTx: 15,
      maxWithdrawalPerHour: 75,
      maxWithdrawalPerDay: 300,
    });

    logger.log(`   ✅ New limits for BNB:`);
    logger.log(`      Max/Tx: ${updatedWallet.maxWithdrawalPerTx}`);
    logger.log(`      Max/Hour: ${updatedWallet.maxWithdrawalPerHour}`);
    logger.log(`      Max/Day: ${updatedWallet.maxWithdrawalPerDay}\n`);

    // ============================================
    // 6. RECONCILIATION
    // ============================================
    logger.log('═'.repeat(80));
    logger.log('6️⃣  BALANCE RECONCILIATION');
    logger.log('═'.repeat(80) + '\n');

    logger.log('🔍 Running reconciliation report...\n');
    const reconciliationReport = await reconciliationService.runReconciliation(new Date());

    logger.log(`Status: ${reconciliationReport.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}`);
    logger.log(`Date: ${reconciliationReport.date.toISOString()}`);
    logger.log(`Assets Checked: ${reconciliationReport.assets.length}`);
    logger.log(`Discrepancies: ${reconciliationReport.discrepancies.length}\n`);

    if (reconciliationReport.discrepancies.length > 0) {
      logger.log('⚠️  Discrepancies Found:');
      for (const disc of reconciliationReport.discrepancies) {
        const icon = disc.severity === 'critical' ? '🚨' : '⚠️';
        logger.log(`   ${icon} ${disc.assetCode}:`);
        logger.log(`      Virtual: ${disc.virtualBalance}`);
        logger.log(`      Real: ${disc.realBalance}`);
        logger.log(`      Difference: ${disc.difference}`);
        logger.log(`      Severity: ${disc.severity}\n`);
      }
    } else {
      logger.log('✅ All balances reconciled perfectly\n');
    }

    // ============================================
    // 7. WATCHTOWER SERVICE
    // ============================================
    logger.log('═'.repeat(80));
    logger.log('7️⃣  WATCHTOWER SERVICE (Deposit Monitoring)');
    logger.log('═'.repeat(80) + '\n');

    // Get watchtower status
    const watchtowerStatus = watchtowerService.getStatus();
    logger.log(`Watchtower Status: ${watchtowerStatus.isRunning ? '🟢 RUNNING' : '🔴 STOPPED'}`);
    logger.log(`Active Watchers: ${watchtowerStatus.activeWatchers.length}`);
    
    if (watchtowerStatus.activeWatchers.length > 0) {
      logger.log('\nMonitoring blockchains:');
      for (const blockchain of watchtowerStatus.activeWatchers) {
        logger.log(`   - ${blockchain.toUpperCase()}`);
      }
    }

    logger.log('\n💡 Watchtower continuously:');
    logger.log('   - Scans blockchains for new blocks');
    logger.log('   - Detects deposits to user addresses');
    logger.log('   - Tracks transaction confirmations');
    logger.log('   - Updates custody wallet balances');
    logger.log('   - Triggers reconciliation checks\n');

    // Summary
    logger.log('\n═'.repeat(80));
    logger.log('✅ CUSTODY & RECONCILIATION TEST COMPLETED');
    logger.log('═'.repeat(80));
    logger.log('\n📊 Summary:');
    logger.log(`  ✅ Created/verified ${allWallets.length} custody wallets`);
    logger.log(`  ✅ Tested withdrawal limit validation`);
    logger.log(`  ✅ Verified multi-sig requirements`);
    logger.log(`  ✅ Tested emergency lock/unlock`);
    logger.log(`  ✅ Updated wallet limits dynamically`);
    logger.log(`  ✅ Ran balance reconciliation`);
    logger.log(`  ✅ Checked watchtower status`);
    
    logger.log('\n💡 Production Features:');
    logger.log('  - Real-time blockchain monitoring');
    logger.log('  - Automatic reconciliation (daily at 2 AM)');
    logger.log('  - Multi-signature approval workflows');
    logger.log('  - Emergency wallet lockdown capability');
    logger.log('  - Rate limiting and velocity checks');
    logger.log('  - KMS integration for key management');
    logger.log('  - Automated alerts and notifications');

  } catch (error) {
    logger.error('❌ Custody test failed:', error.message);
    if (error.stack) {
      logger.error(error.stack);
    }
    throw error;
  } finally {
    await app.close();
  }
}

// Run the test
testCryptoCustody()
  .then(() => {
    logger.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n❌ Test script failed:', error);
    process.exit(1);
  });

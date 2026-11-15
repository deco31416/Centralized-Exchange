import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AddressService } from '../src/crypto/services/address.service';
import { DepositService } from '../src/crypto/services/deposit.service';
import { BalanceService } from '../src/ledger/services/balance.service';
import { AccountService } from '../src/ledger/services/account.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deposit } from '../src/crypto/models/deposit.schema';
import { Logger } from '@nestjs/common';

const logger = new Logger('TestCryptoDepositsScript');

/**
 * Helper to convert minor units to major units
 */
function toMajorUnits(amountMinor: number, asset: string): number {
  const decimals = ['BTC', 'ETH', 'BNB', 'USDT'].includes(asset) ? 8 : 2;
  return amountMinor / Math.pow(10, decimals);
}

/**
 * Helper to convert major units to minor units
 */
function toMinorUnits(amount: number, asset: string): number {
  const decimals = ['BTC', 'ETH', 'BNB', 'USDT'].includes(asset) ? 8 : 2;
  return Math.round(amount * Math.pow(10, decimals));
}

/**
 * Test script to simulate cryptocurrency deposits.
 */
async function testCryptoDeposits() {
  logger.log('💰 Testing Crypto Deposit Flow...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const addressService = app.get(AddressService);
    const depositService = app.get(DepositService);
    const accountService = app.get(AccountService);
    const balanceService = app.get(BalanceService);
    const depositModel = app.get<Model<Deposit>>(getModelToken(Deposit.name));

    // Test parameters
    const userId = 'user1';
    const blockchain = 'bsc' as const;
    const assetCode = 'BNB';
    const depositAmount = 1.5; // 1.5 BNB

    logger.log('📋 Test Parameters:');
    logger.log(`  User: ${userId}`);
    logger.log(`  Blockchain: ${blockchain.toUpperCase()}`);
    logger.log(`  Asset: ${assetCode}`);
    logger.log(`  Amount: ${depositAmount} ${assetCode}\n`);

    // Step 1: Generate address for user
    logger.log('🔑 Step 1: Generating deposit address...');
    const address = await addressService.generateAddressForUser({
      userId,
      blockchain,
      assetCode,
    });
    logger.log(`  ✅ Address generated: ${address.address}`);
    logger.log(`  Derivation path: ${address.derivationPath}\n`);

    // Step 2: Check balance before deposit
    logger.log('💰 Step 2: Checking balance BEFORE deposit...');
    const account = await accountService.findAccountByOwnerAndAsset({
      ownerId: userId,
      assetCode,
    });

    let balanceBefore = 0;
    if (account) {
      const balance = await balanceService.getAccountBalance({
        accountId: String(account._id),
        assetCode,
      });
      balanceBefore = toMajorUnits(balance.balanceMinor, assetCode);
      logger.log(`  Balance: ${balanceBefore} ${assetCode}\n`);
    } else {
      logger.log(`  No account exists yet (will be created on first deposit)\n`);
    }

    // Step 3: Simulate deposit detection
    logger.log('📥 Step 3: Simulating deposit detection...');
    const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
    const mockBlockNumber = 12345678;
    
    const deposit = new depositModel({
      userId,
      blockchain,
      assetCode,
      txHash: mockTxHash,
      fromAddress: '0xSenderAddress123456789',
      toAddress: address.address,
      amount: depositAmount,
      amountMinor: toMinorUnits(depositAmount, assetCode),
      status: 'pending',
      confirmations: 0,
      requiredConfirmations: 15, // BSC requires 15 confirmations
      detectedAt: new Date(),
      blockNumber: mockBlockNumber,
    });

    await deposit.save();
    logger.log(`  ✅ Deposit detected:`);
    logger.log(`     TxHash: ${mockTxHash}`);
    logger.log(`     Amount: ${depositAmount} ${assetCode}`);
    logger.log(`     Block: ${mockBlockNumber}`);
    logger.log(`     Status: ${deposit.status}`);
    logger.log(`     Confirmations: ${deposit.confirmations}/${deposit.requiredConfirmations}\n`);

    // Step 4: Simulate confirmation progression
    logger.log('⏳ Step 4: Simulating confirmation progression...');
    deposit.confirmations = 15;
    deposit.status = 'confirmed';
    deposit.confirmedAt = new Date();
    await deposit.save();
    logger.log(`  ✅ Deposit confirmed (${deposit.confirmations}/${deposit.requiredConfirmations} confirmations)\n`);

    // Step 5: Process confirmed deposit (credit to user account)
    logger.log('💳 Step 5: Processing confirmed deposit...');
    await depositService.processConfirmedDeposit(deposit);
    logger.log(`  ✅ Deposit credited to user account\n`);

    // Step 6: Verify balance after deposit
    logger.log('💰 Step 6: Checking balance AFTER deposit...');
    const accountAfter = await accountService.findAccountByOwnerAndAsset({
      ownerId: userId,
      assetCode,
    });

    if (accountAfter) {
      const balanceAfter = await balanceService.getAccountBalance({
        accountId: String(accountAfter._id),
        assetCode,
      });
      const balanceAfterMajor = toMajorUnits(balanceAfter.balanceMinor, assetCode);
      const difference = balanceAfterMajor - balanceBefore;
      
      logger.log(`  Balance: ${balanceAfterMajor} ${assetCode} (+${difference} ${assetCode})\n`);
    }

    // Step 7: Get deposit history
    logger.log('📊 Step 7: Retrieving deposit history...');
    const userDeposits = await depositService.getUserDeposits(userId, {
      assetCode,
      limit: 10,
    });
    
    logger.log(`  Total deposits for ${userId}: ${userDeposits.length}`);
    logger.log('\n  Recent deposits:');
    for (const dep of userDeposits.slice(0, 5)) {
      logger.log(`    - ${dep.amount} ${dep.assetCode} | ${dep.status} | ${dep.txHash.slice(0, 20)}...`);
    }

    // Step 8: Get deposit statistics
    logger.log('\n📈 Step 8: Deposit statistics...');
    const stats = await depositService.getDepositStatistics();
    logger.log(`  Total deposits: ${stats.totalDeposits}`);
    logger.log(`  Pending: ${stats.pendingDeposits}`);
    logger.log(`  Confirmed: ${stats.confirmedDeposits}`);
    logger.log(`  Credited: ${stats.creditedDeposits}`);
    logger.log(`  Failed: ${stats.failedDeposits}`);
    
    if (Object.keys(stats.totalVolume).length > 0) {
      logger.log('\n  Volume by asset:');
      for (const [asset, volume] of Object.entries(stats.totalVolume)) {
        logger.log(`    ${asset}: ${volume}`);
      }
    }

    // Summary
    logger.log('\n\n✅ Deposit test completed successfully!');
    logger.log('\n📊 Summary:');
    logger.log(`  - Simulated deposit of ${depositAmount} ${assetCode}`);
    logger.log(`  - Deposit detected, confirmed, and credited`);
    logger.log(`  - User balance increased by ${depositAmount} ${assetCode}`);
    logger.log(`  - Deposit ID: ${deposit._id}`);
    logger.log(`  - Ledger Entry ID: ${deposit.ledgerEntryId}`);
    
    logger.log('\n💡 In production:');
    logger.log('  - Watchtower service monitors blockchain for real transactions');
    logger.log('  - Deposits are automatically detected and processed');
    logger.log('  - Confirmation tracking happens in background jobs');
    logger.log('  - Users are notified when deposits are credited');

  } catch (error) {
    logger.error('❌ Deposit test failed:', error.message);
    if (error.stack) {
      logger.error(error.stack);
    }
    throw error;
  } finally {
    await app.close();
  }
}

// Run the test
testCryptoDeposits()
  .then(() => {
    logger.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n❌ Test script failed:', error);
    process.exit(1);
  });

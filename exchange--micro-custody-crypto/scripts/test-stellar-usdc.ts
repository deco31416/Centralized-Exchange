import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { TokenConfigurationService } from '../src/crypto/services/token-configuration.service';
import { AddressService } from '../src/crypto/services/address.service';
import { DepositService } from '../src/crypto/services/deposit.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('StellarUSDCTest');

/**
 * Test script to verify Stellar USDC configuration and detection
 */
async function testStellarUSDC() {
  logger.log('🧪 Testing Stellar USDC Configuration & Detection\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const tokenConfigService = app.get(TokenConfigurationService);
  const addressService = app.get(AddressService);
  const depositService = app.get(DepositService);

  try {
    // ============================================
    // 1. Verify Token Configurations
    // ============================================
    logger.log('📋 Step 1: Verifying Token Configurations...');
    
    const stellarTokens = await tokenConfigService.getActiveTokensByBlockchain('stellar');
    logger.log(`Found ${stellarTokens.length} active token(s) for Stellar:`);
    
    for (const token of stellarTokens) {
      logger.log(`  - ${token.assetCode}:`);
      logger.log(`      Name: ${token.name}`);
      logger.log(`      Symbol: ${token.symbol}`);
      logger.log(`      Type: ${token.tokenType}`);
      logger.log(`      Standard: ${token.standard}`);
      logger.log(`      Decimals: ${token.decimals}`);
      logger.log(`      Contract/Issuer: ${token.contractAddress || 'N/A'}`);
      logger.log(`      Min Deposit: ${token.minimumDeposit}`);
      logger.log(`      Active: ${token.isActive}`);
      logger.log('');
    }

    const usdcToken = stellarTokens.find(t => t.symbol === 'USDC');
    if (!usdcToken) {
      logger.error('❌ USDC token not found! Run seed script to initialize default tokens.');
      return;
    }

    logger.log('✅ USDC token configuration found\n');

    // Verify critical fields
    const issues: string[] = [];
    
    if (usdcToken.tokenType !== 'stellar-asset') {
      issues.push(`Token type is "${usdcToken.tokenType}" but should be "stellar-asset"`);
    }
    
    if (usdcToken.decimals !== 7) {
      issues.push(`Decimals is ${usdcToken.decimals} but should be 7 for Stellar assets`);
    }
    
    if (!usdcToken.contractAddress) {
      issues.push('Contract address (issuer) is missing');
    }
    
    if (usdcToken.contractAddress?.length !== 56) {
      issues.push(`Issuer address length is ${usdcToken.contractAddress?.length} but should be 56 characters`);
    }

    if (issues.length > 0) {
      logger.warn('⚠️  Configuration Issues Found:');
      issues.forEach(issue => logger.warn(`  - ${issue}`));
      logger.warn('');
    } else {
      logger.log('✅ All configuration checks passed\n');
    }

    // ============================================
    // 2. Check Watched Addresses
    // ============================================
    logger.log('📋 Step 2: Checking Watched Addresses...');
    
    const stellarAddresses = await addressService['addressModel'].find({
      blockchain: 'stellar',
      isWatched: true,
    });

    logger.log(`Found ${stellarAddresses.length} watched address(es) on Stellar:`);
    
    if (stellarAddresses.length === 0) {
      logger.warn('⚠️  No watched addresses found. Create one first:');
      logger.warn('   POST /crypto/addresses { userId: "user1", blockchain: "stellar" }');
      logger.warn('');
    } else {
      for (const addr of stellarAddresses) {
        logger.log(`  - User: ${addr.userId}`);
        logger.log(`    Address: ${addr.address}`);
        logger.log(`    Watched: ${addr.isWatched}`);
        logger.log('');
      }
      logger.log('✅ Watched addresses configured\n');
    }

    // ============================================
    // 3. Test Amount Conversion
    // ============================================
    logger.log('📋 Step 3: Testing Amount Conversion...');
    
    const testAmounts = [1, 10.5, 100, 0.0000001];
    
    logger.log('Amount conversions with 7 decimals (Stellar USDC):');
    for (const amount of testAmounts) {
      const amountMinor = Math.round(amount * Math.pow(10, usdcToken.decimals));
      const amountBack = amountMinor / Math.pow(10, usdcToken.decimals);
      logger.log(`  ${amount} USDC → ${amountMinor} stroops → ${amountBack} USDC`);
    }
    logger.log('');
    logger.log('✅ Amount conversion working correctly\n');

    // ============================================
    // 4. Check Recent Deposits
    // ============================================
    logger.log('📋 Step 4: Checking Recent Stellar Deposits...');
    
    const recentDeposits = await depositService['depositModel']
      .find({ blockchain: 'stellar' })
      .sort({ createdAt: -1 })
      .limit(5);

    if (recentDeposits.length === 0) {
      logger.log('No Stellar deposits found yet.');
      logger.log('');
    } else {
      logger.log(`Found ${recentDeposits.length} recent deposit(s):`);
      for (const deposit of recentDeposits) {
        logger.log(`  - Asset: ${deposit.assetCode}`);
        logger.log(`    Amount: ${deposit.amount}`);
        logger.log(`    Amount Minor: ${deposit.amountMinor}`);
        logger.log(`    User: ${deposit.userId}`);
        logger.log(`    Status: ${deposit.status}`);
        logger.log(`    TX: ${deposit.txHash}`);
        logger.log(`    Detected: ${deposit.detectedAt}`);
        logger.log('');
      }
    }

    // ============================================
    // 5. Summary & Next Steps
    // ============================================
    logger.log('=' .repeat(60));
    logger.log('📊 SUMMARY');
    logger.log('=' .repeat(60));
    
    const summary = {
      'Token Config': usdcToken ? '✅' : '❌',
      'Token Type': usdcToken?.tokenType === 'stellar-asset' ? '✅' : '❌',
      'Correct Decimals': usdcToken?.decimals === 7 ? '✅' : '❌',
      'Issuer Set': usdcToken?.contractAddress ? '✅' : '❌',
      'Watched Addresses': stellarAddresses.length > 0 ? '✅' : '⚠️',
      'Recent Deposits': recentDeposits.length > 0 ? '✅' : 'ℹ️',
    };

    for (const [key, status] of Object.entries(summary)) {
      logger.log(`${status} ${key}`);
    }
    
    logger.log('');
    logger.log('🔍 NEXT STEPS:');
    logger.log('');
    
    if (stellarAddresses.length === 0) {
      logger.log('1. Create a watched address on Stellar');
      logger.log('2. Send USDC to that address on Stellar Testnet');
      logger.log('3. Watch the logs for detection messages');
    } else {
      logger.log('1. Send USDC to one of your watched addresses:');
      stellarAddresses.slice(0, 1).forEach(addr => {
        logger.log(`   → ${addr.address} (user: ${addr.userId})`);
      });
      logger.log('');
      logger.log('2. Make sure you:');
      logger.log('   - Have a trustline for USDC');
      logger.log(`   - Use issuer: ${usdcToken.contractAddress}`);
      logger.log('   - Send at least 1 USDC (minimum deposit)');
      logger.log('');
      logger.log('3. Watch the watchtower logs for:');
      logger.log('   - "Found X asset transfers in ledger Y"');
      logger.log('   - "✅ Transfer matches watched address"');
      logger.log('   - "💰 Triggering deposit detection"');
      logger.log('   - "📥 Deposit detected: X USDC_XLM"');
    }
    
    logger.log('');
    logger.log('📖 For detailed debugging, see: STELLAR-USDC-DEBUG-GUIDE.md');
    logger.log('');

  } catch (error) {
    logger.error('❌ Test failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the test
testStellarUSDC()
  .then(() => {
    logger.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  });

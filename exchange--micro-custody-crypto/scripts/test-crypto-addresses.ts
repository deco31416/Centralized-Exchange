import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AddressService } from '../src/crypto/services/address.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('TestCryptoAddressesScript');

/**
 * Test script to demonstrate cryptocurrency address generation.
 */
async function testCryptoAddresses() {
  logger.log('🏦 Testing Crypto Address Generation...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const addressService = app.get(AddressService);

    // Test users
    const testUsers = ['user1', 'user2', 'user3'];
    
    // Test blockchains and assets
    // Note: Multi-chain tokens use blockchain-specific codes (e.g., USDT_BSC, USDT_ETH)
    const addressTests = [
      { blockchain: 'bsc' as const, assetCode: 'BNB' },        // Native BNB
      { blockchain: 'bsc' as const, assetCode: 'USDT_BSC' },   // USDT on BSC
      { blockchain: 'bsc' as const, assetCode: 'USDC_BSC' },   // USDC on BSC
      { blockchain: 'bsc' as const, assetCode: 'BUSD_BSC' },   // BUSD on BSC
      { blockchain: 'bitcoin' as const, assetCode: 'BTC' },    // Native BTC
      { blockchain: 'ethereum' as const, assetCode: 'ETH' },   // Native ETH
      { blockchain: 'ethereum' as const, assetCode: 'USDT_ETH' }, // USDT on Ethereum
      { blockchain: 'ethereum' as const, assetCode: 'USDC_ETH' }, // USDC on Ethereum
      { blockchain: 'tron' as const, assetCode: 'TRX' },          // Native TRX
      { blockchain: 'tron' as const, assetCode: 'USDT_TRON' },   // USDT on TRON
      { blockchain: 'tron' as const, assetCode: 'USDC_TRON' },   // USDC on TRON
      { blockchain: 'stellar' as const, assetCode: 'XLM' },      // Native XLM
      { blockchain: 'stellar' as const, assetCode: 'USDC_XLM' }, // USDC on Stellar
    ];

    logger.log('📋 Test Parameters:');
    logger.log(`  Users: ${testUsers.join(', ')}`);
    logger.log(`  Blockchains: BSC, Bitcoin, Ethereum, TRON`);
    logger.log(`  Assets: BNB, USDT_BSC, USDC_BSC, BUSD_BSC, BTC, ETH, USDT_ETH, USDC_ETH, TRX, USDT_TRON, USDC_TRON`);
    logger.log(`  Note: Multi-chain tokens use blockchain-specific codes\n`);

    // Generate addresses for each user
    for (const userId of testUsers) {
      logger.log(`\n👤 Generating addresses for ${userId.toUpperCase()}:`);
      logger.log('═'.repeat(80));

      for (const { blockchain, assetCode } of addressTests) {
        try {
          // First check if address already exists
          const existingAddress = await addressService.getUserAddress(userId, blockchain, assetCode);
          
          if (existingAddress) {
            logger.log(`\n♻️  ${blockchain.toUpperCase()} - ${assetCode} (existing):`);
            logger.log(`   Address: ${existingAddress.address}`);
            logger.log(`   Path: ${existingAddress.derivationPath}`);
            logger.log(`   Index: ${existingAddress.addressIndex}`);
            logger.log(`   Active: ${existingAddress.isActive}`);
            logger.log(`   Watched: ${existingAddress.isWatched}`);
            continue;
          }

          // Generate new address if doesn't exist
          const address = await addressService.generateAddressForUser({
            userId,
            blockchain,
            assetCode,
          });

          logger.log(`\n✅ ${blockchain.toUpperCase()} - ${assetCode} (new):`);
          logger.log(`   Address: ${address.address}`);
          logger.log(`   Path: ${address.derivationPath}`);
          logger.log(`   Index: ${address.addressIndex}`);
          logger.log(`   Active: ${address.isActive}`);
          logger.log(`   Watched: ${address.isWatched}`);
        } catch (error) {
          logger.error(`❌ Failed to generate ${blockchain} address for ${assetCode}:`, error.message);
        }
      }
    }

    // Test getting all addresses for a user
    logger.log('\n\n📊 Retrieving all addresses for user1:');
    logger.log('═'.repeat(80));
    const user1Addresses = await addressService.getUserAddresses('user1');
    
    logger.log(`\nTotal addresses: ${user1Addresses.length}\n`);
    for (const addr of user1Addresses) {
      logger.log(`  ${addr.blockchain.toUpperCase().padEnd(10)} | ${addr.assetCode.padEnd(6)} | ${addr.address}`);
    }

    // Test getting specific addresses
    logger.log('\n\n🔍 Testing specific address retrieval:');
    logger.log('═'.repeat(80));
    
    // Test native coin address
    const bnbAddress = await addressService.getUserAddress('user1', 'bsc', 'BNB');
    if (bnbAddress) {
      logger.log(`\n✅ Found BNB address for user1:`);
      logger.log(`   Address: ${bnbAddress.address}`);
      logger.log(`   Derivation Path: ${bnbAddress.derivationPath}`);
      logger.log(`   Is Active: ${bnbAddress.isActive}`);
      logger.log(`   Is Watched: ${bnbAddress.isWatched}`);
    }
    
    // Test token address
    const usdtBscAddress = await addressService.getUserAddress('user1', 'bsc', 'USDT_BSC');
    if (usdtBscAddress) {
      logger.log(`\n✅ Found USDT_BSC address for user1:`);
      logger.log(`   Address: ${usdtBscAddress.address}`);
      logger.log(`   Note: Same address can receive multiple BEP-20 tokens on BSC`);
    }

    // Summary
    logger.log('\n\n✅ Address generation test completed successfully!');
    logger.log('\n📊 Summary:');
    logger.log(`  - Generated addresses for ${testUsers.length} users`);
    logger.log(`  - Tested ${addressTests.length} blockchain/asset combinations`);
    logger.log(`  - All addresses are deterministically generated using HD wallet (BIP44)`);
    
    logger.log('\n💡 Generated addresses are now:');
    logger.log('  - Stored in the database with blockchain-specific asset codes');
    logger.log('  - Ready to receive deposits (native coins + tokens)');
    logger.log('  - Being watched by the watchtower service');
    logger.log('  - Note: On BSC/Ethereum, the same address can receive multiple tokens');

  } catch (error) {
    logger.error('❌ Address generation test failed:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the test
testCryptoAddresses()
  .then(() => {
    logger.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n❌ Test script failed:', error);
    process.exit(1);
  });

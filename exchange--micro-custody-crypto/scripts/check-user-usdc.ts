import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BalanceService } from '../src/ledger/services/balance.service';
import { AccountService } from '../src/ledger/services/account.service';
import { Logger } from '@nestjs/common';
import { OwnerType, AccountType } from '../src/ledger/models/account.schema';

const logger = new Logger('CheckUserUSDC');

async function checkUserUSDC() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const balanceService = app.get(BalanceService);
  const accountService = app.get(AccountService);
  
  const userId = 'user1';
  const assetCode = 'USDC'; // Unified ledger code
  
  logger.log(`\n🔍 Checking ${assetCode} balance for user: ${userId}\n`);
  
  // Get user account
  const account = await accountService.getOrCreateAccount({
    ownerType: OwnerType.USER,
    ownerId: userId,
    assetCode: assetCode,
    accountType: AccountType.ASSET,
  });
  
  logger.log(`Account ID: ${account._id}`);
  logger.log(`Account Code: ${account.assetCode}`);
  logger.log(`Owner: ${account.ownerId}\n`);
  
  // Get balance
  const balance = await balanceService.getAccountBalance({
    accountId: String(account._id),
    assetCode: assetCode,
  });
  
  logger.log(`Balance:`);
  logger.log(`  Total Minor Units: ${balance.balanceMinor}`);
  logger.log(`  Available Minor Units: ${balance.availableMinor}`);
  logger.log(`  On Hold Minor Units: ${balance.heldMinor}`);
  
  // Convert to major units (USDC uses 7 decimals on Stellar, but 6 on Ethereum)
  // In ledger, we typically use standard precision
  const majorBalance = balance.balanceMinor / Math.pow(10, 8); // Using 8 decimals standard
  const majorBalance6 = balance.balanceMinor / Math.pow(10, 6); // Using 6 decimals (USDC on ETH)
  const majorBalance7 = balance.balanceMinor / Math.pow(10, 7); // Using 7 decimals (USDC on Stellar)
  
  logger.log(`\n  Converted to major units:`);
  logger.log(`    With 8 decimals (standard crypto): ${majorBalance} USDC`);
  logger.log(`    With 6 decimals (USDC on ETH): ${majorBalance6} USDC`);
  logger.log(`    With 7 decimals (USDC on Stellar): ${majorBalance7} USDC`);
  
  logger.log(`\n✅ Expected: 6 USDC from Stellar deposit`);
  logger.log(`📊 Actual total: ${balance.balanceMinor} minor units`);
  
  // Check if it matches the expected 6 USDC
  if (balance.balanceMinor === 60000000) {
    logger.log(`✅ Balance is CORRECT (60,000,000 minor units = 6 USDC with 7 decimals)`);
  } else if (balance.balanceMinor === 600000000) {
    logger.log(`❌ Balance is WRONG (600,000,000 minor units - used 8 decimals instead of 7)`);
  } else if (balance.balanceMinor === 6000000) {
    logger.log(`❌ Balance is WRONG (6,000,000 minor units - used 6 decimals instead of 7)`);
  } else {
    logger.log(`⚠️  Unexpected balance: ${balance.balanceMinor}`);
  }
  
  await app.close();
}

checkUserUSDC()
  .then(() => process.exit(0))
  .catch(err => {
    logger.error(err);
    process.exit(1);
  });

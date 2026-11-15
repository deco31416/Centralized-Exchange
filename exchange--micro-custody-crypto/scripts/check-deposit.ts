import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DepositService } from '../src/crypto/services/deposit.service';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Deposit } from '../src/crypto/models/deposit.schema';

const logger = new Logger('CheckDeposit');

async function checkDeposits() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const depositModel = app.get<Model<Deposit>>('DepositModel');
  
  const address = 'GBDSA7LAYCRO55AWY5L6FVG3KKM4DGJG4XA42EUS2BHIOHTN6URUXZ6J';
  
  logger.log(`\n🔍 Checking deposits for address: ${address}\n`);
  
  const deposits = await depositModel.find({
    toAddress: address
  }).sort({ createdAt: -1 });
  
  logger.log(`Found ${deposits.length} deposit(s):\n`);
  
  for (const deposit of deposits) {
    logger.log(`📥 Deposit:`);
    logger.log(`   Asset: ${deposit.assetCode}`);
    logger.log(`   Amount (major): ${deposit.amount}`);
    logger.log(`   Amount (minor): ${deposit.amountMinor}`);
    logger.log(`   User: ${deposit.userId}`);
    logger.log(`   Status: ${deposit.status}`);
    logger.log(`   Blockchain: ${deposit.blockchain}`);
    logger.log(`   TX Hash: ${deposit.txHash}`);
    logger.log(`   From: ${deposit.fromAddress}`);
    logger.log(`   To: ${deposit.toAddress}`);
    logger.log(`   Detected: ${deposit.detectedAt}`);
    logger.log(`   Confirmations: ${deposit.confirmations}/${deposit.requiredConfirmations}`);
    
    // Calculate what the minor amount should be
    const expectedMinor = Math.round(deposit.amount * Math.pow(10, 7)); // 7 decimals for Stellar
    const isCorrect = expectedMinor === deposit.amountMinor;
    
    logger.log(`   ✓ Expected minor (7 decimals): ${expectedMinor}`);
    logger.log(`   ${isCorrect ? '✅' : '❌'} Stored minor: ${deposit.amountMinor} ${isCorrect ? '(CORRECT)' : '(WRONG!)'}`);
    
    if (!isCorrect) {
      const storedDecimals = Math.log10(deposit.amountMinor / deposit.amount);
      logger.log(`   ⚠️  Appears to use ${storedDecimals} decimals instead of 7`);
    }
    logger.log('');
  }
  
  await app.close();
}

checkDeposits()
  .then(() => process.exit(0))
  .catch(err => {
    logger.error(err);
    process.exit(1);
  });

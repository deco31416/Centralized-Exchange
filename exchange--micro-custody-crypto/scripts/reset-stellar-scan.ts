#!/usr/bin/env ts-node

/**
 * Reset Stellar scan state to start from current ledger
 * This fixes the issue where the watchtower tries to scan from ledger 1 (which is too old)
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { BlockchainScanState } from '../src/crypto/models/blockchain-scan-state.schema';
import { StellarBlockchainService } from '../src/crypto/services/blockchain/stellar-blockchain.service';

async function resetStellarScanState() {
  console.log('🔄 Resetting Stellar scan state...');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // Get the scan state model
    const scanStateModel = app.get<Model<BlockchainScanState>>(
      getModelToken(BlockchainScanState.name)
    );

    // Get Stellar blockchain service
    const stellarService = app.get(StellarBlockchainService);

    // Connect to Stellar and get current ledger
    await stellarService.connect();
    const currentLedger = await stellarService.getBlockHeight();
    
    console.log(`📊 Current Stellar ledger: ${currentLedger}`);

    // Delete existing Stellar scan state
    await scanStateModel.deleteOne({ blockchain: 'stellar' });
    console.log('🗑️  Deleted existing Stellar scan state');

    // Create new scan state starting from current ledger - 20
    const startLedger = Math.max(0, currentLedger - 20);
    await scanStateModel.create({
      blockchain: 'stellar',
      lastScannedBlock: startLedger,
      lastScanAt: new Date(),
    });

    console.log(`✅ Created new Stellar scan state starting from ledger: ${startLedger}`);
    console.log('🎉 Stellar watchtower will now scan from recent ledgers only');

  } catch (error) {
    console.error('❌ Error resetting Stellar scan state:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the script
resetStellarScanState().catch(console.error);
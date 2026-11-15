import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

// Schemas
import { UserAddress, UserAddressSchema } from './models/user-address.schema';
import { Deposit, DepositSchema } from './models/deposit.schema';
import { Withdrawal, WithdrawalSchema } from './models/withdrawal.schema';
import { CustodyWallet, CustodyWalletSchema } from './models/custody-wallet.schema';
import { MultiSigRequest, MultiSigRequestSchema } from './models/multi-sig-request.schema';
import { BlockchainScanState, BlockchainScanStateSchema } from './models/blockchain-scan-state.schema';
import { TokenConfiguration, TokenConfigurationSchema } from './models/token-configuration.schema';

// Services
import { AddressService } from './services/address.service';
import { CustodyService } from './services/custody.service';
import { DepositService } from './services/deposit.service';
import { WithdrawalService } from './services/withdrawal.service';
import { MultiSigService } from './services/multi-sig.service';
import { ReconciliationService } from './services/reconciliation.service';
import { NotificationService } from './services/notification.service';
import { WatchtowerService } from './services/watchtower.service';
import { TokenConfigurationService } from './services/token-configuration.service';

// Blockchain Services
import { BSCBlockchainService } from './services/blockchain/bsc-blockchain.service';
import { BitcoinBlockchainService } from './services/blockchain/bitcoin-blockchain.service';
import { EthereumBlockchainService } from './services/blockchain/ethereum-blockchain.service';
import { TronBlockchainService } from './services/blockchain/tron-blockchain.service';
import { StellarBlockchainService } from './services/blockchain/stellar-blockchain.service';

// Controllers
import { CryptoController } from './controllers/crypto.controller';

// Processors
import { DepositDetectionProcessor } from './processors/deposit-detection.processor';

// Import Ledger Module
import { LedgerModule } from '../ledger/ledger.module';
import { ConfigService } from '@nestjs/config';

/**
 * Crypto Module - Handles cryptocurrency deposits and withdrawals
 */
@Module({
  imports: [
    // Import Ledger Module for account management
    LedgerModule,

    // Register MongoDB schemas
    MongooseModule.forFeature([
      { name: UserAddress.name, schema: UserAddressSchema },
      { name: Deposit.name, schema: DepositSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: CustodyWallet.name, schema: CustodyWalletSchema },
      { name: MultiSigRequest.name, schema: MultiSigRequestSchema },
      { name: BlockchainScanState.name, schema: BlockchainScanStateSchema },
      { name: TokenConfiguration.name, schema: TokenConfigurationSchema },
    ]),

    // Register Bull queue for deposit detection
    BullModule.registerQueue({
      name: 'deposit-detection',
    }),

    // Register Schedule module for cron jobs
    ScheduleModule.forRoot(),
  ],
  controllers: [CryptoController],
  providers: [
    // Core Services
    AddressService,
    CustodyService,
    DepositService,
    WithdrawalService,
    MultiSigService,
    ReconciliationService,
    NotificationService,
    WatchtowerService,
    TokenConfigurationService,

    // Blockchain Services
    {
      provide: BSCBlockchainService,
      useFactory: () => {
        return new BSCBlockchainService(
          process.env.BSC_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
          (process.env.BSC_NETWORK as 'mainnet' | 'testnet') || 'testnet',
          process.env.BSC_HOT_WALLET_PRIVATE_KEY,
        );
      },
    },
    {
      provide: BitcoinBlockchainService,
      useFactory: () => {
        return new BitcoinBlockchainService(
          (process.env.BTC_NETWORK as 'mainnet' | 'testnet') || 'testnet',
          new ConfigService(),
        );
      },
    },
    {
      provide: EthereumBlockchainService,
      useFactory: () => {
        return new EthereumBlockchainService(
          process.env.ETH_RPC_URL || '',
          (process.env.ETH_NETWORK as 'mainnet' | 'testnet') || 'testnet',
          process.env.ETH_HOT_WALLET_PRIVATE_KEY,
        );
      },
    },
    {
      provide: TronBlockchainService,
      useFactory: () => {
        return new TronBlockchainService(
          (process.env.TRON_NETWORK as 'mainnet' | 'testnet') || 'testnet',
        );
      },
    },
    {
      provide: StellarBlockchainService,
      useFactory: () => {
        return new StellarBlockchainService(
          (process.env.STELLAR_NETWORK as 'mainnet' | 'testnet') || 'testnet',
        );
      },
    },

    // Processors
    DepositDetectionProcessor,
  ],
  exports: [
    AddressService,
    CustodyService,
    DepositService,
    WithdrawalService,
    MultiSigService,
    ReconciliationService,
    NotificationService,
    WatchtowerService,
    TokenConfigurationService,
  ],
})
export class CryptoModule implements OnModuleInit {
  constructor(private readonly tokenConfigService: TokenConfigurationService) {}

  /**
   * Initialize token configurations when module starts
   */
  async onModuleInit(): Promise<void> {
    await this.tokenConfigService.initializeDefaultTokens();
  }
}

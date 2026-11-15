import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { getQueueToken } from '@nestjs/bull';
import { WatchtowerService } from './watchtower.service';
import { UserAddress } from '../models/user-address.schema';
import { Deposit } from '../models/deposit.schema';
import { BlockchainScanState } from '../models/blockchain-scan-state.schema';
import { BSCBlockchainService } from './blockchain/bsc-blockchain.service';
import { BitcoinBlockchainService } from './blockchain/bitcoin-blockchain.service';

describe('WatchtowerService', () => {
  let service: WatchtowerService;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
  };

  const mockAddressModel = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDepositModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue(dto),
  }));
  mockDepositModel.findOne = jest.fn();
  mockDepositModel.find = jest.fn();

  const mockScanStateModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue(dto),
  }));
  mockScanStateModel.findOne = jest.fn();
  mockScanStateModel.findOneAndUpdate = jest.fn();

  const mockBSCService = {
    connect: jest.fn().mockResolvedValue(undefined),
    getBlockHeight: jest.fn().mockResolvedValue(100),
    getBlock: jest.fn().mockResolvedValue({
      number: 100,
      hash: '0xabc',
      timestamp: Date.now(),
      transactions: [],
    }),
  };

  const mockBitcoinService = {
    connect: jest.fn().mockResolvedValue(undefined),
    getBlockHeight: jest.fn().mockResolvedValue(800000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchtowerService,
        {
          provide: getModelToken(UserAddress.name),
          useValue: mockAddressModel,
        },
        {
          provide: getModelToken(Deposit.name),
          useValue: mockDepositModel,
        },
        {
          provide: getModelToken(BlockchainScanState.name),
          useValue: mockScanStateModel,
        },
        {
          provide: getQueueToken('deposit-detection'),
          useValue: mockQueue,
        },
        {
          provide: BSCBlockchainService,
          useValue: mockBSCService,
        },
        {
          provide: BitcoinBlockchainService,
          useValue: mockBitcoinService,
        },
      ],
    }).compile();

    service = module.get<WatchtowerService>(WatchtowerService);
  });

  afterEach(async () => {
    // Stop the watchtower to clean up intervals
    await service.stop();
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should start the watchtower service', async () => {
      await service.start();
      const status = service.getStatus();
      
      expect(status.isRunning).toBe(true);
      expect(mockBSCService.connect).toHaveBeenCalled();
    });

    it('should not start if already running', async () => {
      await service.start();
      await service.start();
      
      expect(mockBSCService.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('should stop the watchtower service', async () => {
      await service.start();
      await service.stop();
      
      const status = service.getStatus();
      expect(status.isRunning).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return watchtower status', () => {
      const status = service.getStatus();
      
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('activeWatchers');
      expect(Array.isArray(status.activeWatchers)).toBe(true);
    });
  });
});

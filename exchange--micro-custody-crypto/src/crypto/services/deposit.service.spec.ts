import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DepositService } from './deposit.service';
import { Deposit } from '../models/deposit.schema';
import { PostingService } from '../../ledger/services/posting.service';
import { AccountService } from '../../ledger/services/account.service';

describe('DepositService', () => {
  let service: DepositService;

  const mockDepositModel = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    }),
    findById: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(0),
  };

  const mockPostingService = {
    postJournalEntry: jest.fn().mockResolvedValue({ _id: 'journal123' }),
  };

  const mockAccountService = {
    getOrCreateAccount: jest.fn().mockResolvedValue({ _id: 'account123' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositService,
        {
          provide: getModelToken(Deposit.name),
          useValue: mockDepositModel,
        },
        {
          provide: PostingService,
          useValue: mockPostingService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    service = module.get<DepositService>(DepositService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserDeposits', () => {
    it('should return user deposits', async () => {
      const mockDeposits = [
        { userId: 'user123', assetCode: 'BNB', amount: 1.5 },
      ];
      
      mockDepositModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockDeposits),
        }),
      });

      const result = await service.getUserDeposits('user123');

      expect(result).toEqual(mockDeposits);
      expect(mockDepositModel.find).toHaveBeenCalledWith({ userId: 'user123' });
    });

    it('should filter deposits by asset code', async () => {
      mockDepositModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      });

      await service.getUserDeposits('user123', { assetCode: 'BNB' });

      expect(mockDepositModel.find).toHaveBeenCalledWith({
        userId: 'user123',
        assetCode: 'BNB',
      });
    });

    it('should filter deposits by status', async () => {
      mockDepositModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      });

      await service.getUserDeposits('user123', { status: 'credited' });

      expect(mockDepositModel.find).toHaveBeenCalledWith({
        userId: 'user123',
        status: 'credited',
      });
    });
  });

  describe('getDepositById', () => {
    it('should return deposit by ID', async () => {
      const mockDeposit = { _id: 'deposit123', userId: 'user123' };
      mockDepositModel.findById.mockResolvedValue(mockDeposit);

      const result = await service.getDepositById('deposit123');

      expect(result).toEqual(mockDeposit);
      expect(mockDepositModel.findById).toHaveBeenCalledWith('deposit123');
    });
  });

  describe('getDepositByTxHash', () => {
    it('should return deposit by transaction hash', async () => {
      const mockDeposit = { txHash: '0xabc', userId: 'user123' };
      mockDepositModel.findOne.mockResolvedValue(mockDeposit);

      const result = await service.getDepositByTxHash('0xabc');

      expect(result).toEqual(mockDeposit);
      expect(mockDepositModel.findOne).toHaveBeenCalledWith({ txHash: '0xabc' });
    });
  });

  describe('getDepositStatistics', () => {
    it('should return deposit statistics', async () => {
      const mockDeposits = [
        { status: 'pending', assetCode: 'BNB', amount: 1 },
        { status: 'credited', assetCode: 'BNB', amount: 2 },
        { status: 'credited', assetCode: 'BTC', amount: 0.5 },
      ];
      mockDepositModel.find.mockResolvedValue(mockDeposits);

      const result = await service.getDepositStatistics();

      expect(result.totalDeposits).toBe(3);
      expect(result.pendingDeposits).toBe(1);
      expect(result.creditedDeposits).toBe(2);
      expect(result.totalVolume['BNB']).toBe(2);
      expect(result.totalVolume['BTC']).toBe(0.5);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { Withdrawal } from '../models/withdrawal.schema';
import { AccountService } from '../../ledger/services/account.service';
import { BalanceService } from '../../ledger/services/balance.service';
import { HoldService } from '../../ledger/services/hold.service';
import { PostingService } from '../../ledger/services/posting.service';
import { CustodyService } from './custody.service';
import { BSCBlockchainService } from './blockchain/bsc-blockchain.service';
import { BitcoinBlockchainService } from './blockchain/bitcoin-blockchain.service';

describe('WithdrawalService', () => {
  let service: WithdrawalService;

  const mockWithdrawalModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue(dto),
  }));
  mockWithdrawalModel.findOne = jest.fn();
  mockWithdrawalModel.findById = jest.fn();
  mockWithdrawalModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([]),
    }),
  });

  const mockAccountService = {
    getOrCreateAccount: jest.fn().mockResolvedValue({ _id: 'account123' }),
  };

  const mockBalanceService = {
    getAccountBalance: jest.fn().mockResolvedValue({
      balanceMinor: 100000000,
      availableMinor: 100000000,
    }),
  };

  const mockHoldService = {
    createHold: jest.fn().mockResolvedValue({ _id: 'hold123' }),
    cancelHold: jest.fn().mockResolvedValue(undefined),
    releaseHold: jest.fn().mockResolvedValue(undefined),
  };

  const mockPostingService = {
    postJournalEntry: jest.fn().mockResolvedValue({ _id: 'journal123' }),
  };

  const mockCustodyService = {
    validateWithdrawalLimits: jest.fn().mockResolvedValue(undefined),
    requiresMultiSig: jest.fn().mockResolvedValue(false),
    incrementWithdrawalCounter: jest.fn().mockResolvedValue(undefined),
    signTransactionWithKMS: jest.fn().mockResolvedValue({ raw: '0xsigned', hash: '0xhash' }),
  };

  const mockBSCService = {
    isValidAddress: jest.fn().mockReturnValue(true),
    isConnected: jest.fn().mockReturnValue(false),
    connect: jest.fn().mockResolvedValue(undefined),
    estimateGasFee: jest.fn().mockResolvedValue({ fee: 0.001, assetCode: 'BNB' }),
    createTransaction: jest.fn().mockResolvedValue({ to: '0xabc', value: '1000000000' }),
    broadcastTransaction: jest.fn().mockResolvedValue('0xtxhash'),
    getTransaction: jest.fn().mockResolvedValue({ confirmations: 15 }),
  };

  const mockBitcoinService = {
    isValidAddress: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalService,
        {
          provide: getModelToken(Withdrawal.name),
          useValue: mockWithdrawalModel,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
        {
          provide: HoldService,
          useValue: mockHoldService,
        },
        {
          provide: PostingService,
          useValue: mockPostingService,
        },
        {
          provide: CustodyService,
          useValue: mockCustodyService,
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

    service = module.get<WithdrawalService>(WithdrawalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestWithdrawal', () => {
    it('should create a withdrawal request', async () => {
      mockWithdrawalModel.findOne.mockResolvedValue(null);

      const result = await service.requestWithdrawal({
        userId: 'user123',
        assetCode: 'BNB',
        amount: 1.0,
        destinationAddress: '0xabcdef',
        idempotencyKey: 'idempotency123',
      });

      expect(result).toBeDefined();
      expect(mockAccountService.getOrCreateAccount).toHaveBeenCalled();
      expect(mockBalanceService.getAccountBalance).toHaveBeenCalled();
      expect(mockHoldService.createHold).toHaveBeenCalled();
    });

    it('should return existing withdrawal for duplicate idempotency key', async () => {
      const existingWithdrawal = { _id: 'withdrawal123', idempotencyKey: 'idempotency123' };
      mockWithdrawalModel.findOne.mockResolvedValue(existingWithdrawal);

      const result = await service.requestWithdrawal({
        userId: 'user123',
        assetCode: 'BNB',
        amount: 1.0,
        destinationAddress: '0xabcdef',
        idempotencyKey: 'idempotency123',
      });

      expect(result).toEqual(existingWithdrawal);
      expect(mockAccountService.getOrCreateAccount).not.toHaveBeenCalled();
    });

    it('should reject invalid destination address', async () => {
      mockWithdrawalModel.findOne.mockResolvedValue(null);
      mockBSCService.isValidAddress.mockReturnValue(false);

      await expect(
        service.requestWithdrawal({
          userId: 'user123',
          assetCode: 'BNB',
          amount: 1.0,
          destinationAddress: 'invalid-address',
          idempotencyKey: 'idempotency123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject withdrawal with insufficient balance', async () => {
      mockWithdrawalModel.findOne.mockResolvedValue(null);
      mockBalanceService.getAccountBalance.mockResolvedValue({
        balanceMinor: 1000,
        availableMinor: 1000,
      });

      await expect(
        service.requestWithdrawal({
          userId: 'user123',
          assetCode: 'BNB',
          amount: 1.0,
          destinationAddress: '0xabcdef',
          idempotencyKey: 'idempotency123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserWithdrawals', () => {
    it('should return user withdrawals', async () => {
      const mockWithdrawals = [
        { userId: 'user123', assetCode: 'BNB', amount: 1.0 },
      ];
      mockWithdrawalModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockWithdrawals),
        }),
      });

      const result = await service.getUserWithdrawals('user123');

      expect(result).toEqual(mockWithdrawals);
      expect(mockWithdrawalModel.find).toHaveBeenCalledWith({ userId: 'user123' });
    });
  });

  describe('getWithdrawalById', () => {
    it('should return withdrawal by ID', async () => {
      const mockWithdrawal = { _id: 'withdrawal123', userId: 'user123' };
      mockWithdrawalModel.findById.mockResolvedValue(mockWithdrawal);

      const result = await service.getWithdrawalById('withdrawal123');

      expect(result).toEqual(mockWithdrawal);
      expect(mockWithdrawalModel.findById).toHaveBeenCalledWith('withdrawal123');
    });
  });

  describe('cancelWithdrawal', () => {
    it('should cancel a pending withdrawal', async () => {
      const mockWithdrawal = {
        _id: 'withdrawal123',
        userId: 'user123',
        status: 'pending_approval',
        holdId: 'hold123',
        save: jest.fn().mockResolvedValue(true),
      };
      mockWithdrawalModel.findById.mockResolvedValue(mockWithdrawal);

      await service.cancelWithdrawal('withdrawal123', 'user123');

      expect(mockWithdrawal.status).toBe('cancelled');
      expect(mockHoldService.cancelHold).toHaveBeenCalledWith('hold123');
      expect(mockWithdrawal.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if withdrawal not found', async () => {
      mockWithdrawalModel.findById.mockResolvedValue(null);

      await expect(
        service.cancelWithdrawal('withdrawal123', 'user123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if user is not authorized', async () => {
      const mockWithdrawal = {
        _id: 'withdrawal123',
        userId: 'user456',
        status: 'pending_approval',
      };
      mockWithdrawalModel.findById.mockResolvedValue(mockWithdrawal);

      await expect(
        service.cancelWithdrawal('withdrawal123', 'user123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if withdrawal is not pending', async () => {
      const mockWithdrawal = {
        _id: 'withdrawal123',
        userId: 'user123',
        status: 'completed',
      };
      mockWithdrawalModel.findById.mockResolvedValue(mockWithdrawal);

      await expect(
        service.cancelWithdrawal('withdrawal123', 'user123'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

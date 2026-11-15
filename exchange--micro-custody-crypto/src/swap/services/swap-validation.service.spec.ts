import { Test, TestingModule } from '@nestjs/testing';
import { SwapValidationService } from './swap-validation.service';
import { getModelToken } from '@nestjs/mongoose';
import { SwapLimit } from '../models/swap-limit.schema';
import { PlatformReserve } from '../models/platform-reserve.schema';
import { BalanceService } from '../../ledger/services/balance.service';
import { AccountService } from '../../ledger/services/account.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SwapValidationService', () => {
  let service: SwapValidationService;
  let mockSwapLimitModel: any;
  let mockPlatformReserveModel: any;
  let mockBalanceService: any;
  let mockAccountService: any;

  beforeEach(async () => {
    mockSwapLimitModel = {
      findOne: jest.fn(),
      prototype: {},
    };

    mockPlatformReserveModel = {
      findOne: jest.fn(),
      prototype: {},
    };

    mockBalanceService = {
      getAccountBalance: jest.fn(),
    };

    mockAccountService = {
      findAccountByOwnerAndAsset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwapValidationService,
        {
          provide: getModelToken(SwapLimit.name),
          useValue: mockSwapLimitModel,
        },
        {
          provide: getModelToken(PlatformReserve.name),
          useValue: mockPlatformReserveModel,
        },
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    service = module.get<SwapValidationService>(SwapValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateSwap', () => {
    it('should throw error when swapping same asset', async () => {
      await expect(
        service.validateSwap({
          userId: 'user1',
          fromAsset: 'USD',
          toAsset: 'USD',
          fromAmount: 100,
          toAmount: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when insufficient balance', async () => {
      mockAccountService.findAccountByOwnerAndAsset.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
      });

      mockBalanceService.getAccountBalance.mockResolvedValue({
        availableMinor: 5000, // 50 USD in cents
      });

      await expect(
        service.validateSwap({
          userId: 'user1',
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 100,
          toAmount: 0.002,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when daily limit exceeded', async () => {
      mockAccountService.findAccountByOwnerAndAsset.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
      });

      mockBalanceService.getAccountBalance.mockResolvedValue({
        availableMinor: 1000000, // 10000 USD in cents
      });

      mockSwapLimitModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          dailyLimit: 5000,
          dailyUsed: 4500,
          lastResetDate: new Date(),
          save: jest.fn(),
        }),
      });

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          virtualBalance: 100,
          exposureLimit: 100000,
        }),
      });

      await expect(
        service.validateSwap({
          userId: 'user1',
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          toAmount: 0.02,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when platform reserves insufficient', async () => {
      mockAccountService.findAccountByOwnerAndAsset.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
      });

      mockBalanceService.getAccountBalance.mockResolvedValue({
        availableMinor: 1000000, // 10000 USD in cents
      });

      mockSwapLimitModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          dailyLimit: 10000,
          dailyUsed: 0,
          lastResetDate: new Date(),
          save: jest.fn(),
        }),
      });

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          virtualBalance: 0.001,
          exposureLimit: 100000,
        }),
      });

      await expect(
        service.validateSwap({
          userId: 'user1',
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          toAmount: 0.02,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when reserve not found', async () => {
      mockAccountService.findAccountByOwnerAndAsset.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
      });

      mockBalanceService.getAccountBalance.mockResolvedValue({
        availableMinor: 1000000, // 10000 USD in cents
      });

      mockSwapLimitModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          dailyLimit: 10000,
          dailyUsed: 0,
          lastResetDate: new Date(),
          save: jest.fn(),
        }),
      });

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.validateSwap({
          userId: 'user1',
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          toAmount: 0.02,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should pass validation for valid swap', async () => {
      mockAccountService.findAccountByOwnerAndAsset.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
      });

      mockBalanceService.getAccountBalance.mockResolvedValue({
        availableMinor: 1000000, // 10000 USD in cents
      });

      mockSwapLimitModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          dailyLimit: 10000,
          dailyUsed: 0,
          lastResetDate: new Date(),
          save: jest.fn(),
        }),
      });

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          virtualBalance: 1,
          exposureLimit: 100000,
        }),
      });

      await expect(
        service.validateSwap({
          userId: 'user1',
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          toAmount: 0.02,
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('updateDailyUsage', () => {
    it('should update daily usage after swap', async () => {
      const mockLimit = {
        dailyUsed: 0,
        save: jest.fn(),
      };

      mockSwapLimitModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLimit),
      });

      await service.updateDailyUsage('user1', 'USD', 'BTC', 1000);

      expect(mockLimit.dailyUsed).toBe(1000);
      expect(mockLimit.save).toHaveBeenCalled();
    });
  });
});
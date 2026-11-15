import { Test, TestingModule } from '@nestjs/testing';
import { SwapExecutionService } from './swap-execution.service';
import { getModelToken } from '@nestjs/mongoose';
import { SwapRequest, SwapStatus } from '../models/swap-request.schema';
import { SwapValidationService } from './swap-validation.service';
import { SwapCalculationService } from './swap-calculation.service';
import { PlatformReservesService } from './platform-reserves.service';
import { PostingService } from '../../ledger/services/posting.service';
import { AccountService } from '../../ledger/services/account.service';
import { PriceOracleService } from '../../pricing/services/price-oracle.service';
import { SpreadManagerService } from '../../pricing/services/spread-manager.service';
import { PricingConfigurationService } from '../../pricing/services/pricing-configuration.service';
import { ConflictException } from '@nestjs/common';

describe('SwapExecutionService', () => {
  let service: SwapExecutionService;
  let mockSwapRequestModel: any;
  let mockValidationService: any;
  let mockCalculationService: any;
  let mockReservesService: any;
  let mockPostingService: any;
  let mockAccountService: any;
  let mockPriceOracleService: any;
  let mockSpreadManagerService: any;
  let mockPricingConfigService: any;

  beforeEach(async () => {
    const MockSwapClass = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: '507f1f77bcf86cd799439011',
      save: jest.fn().mockResolvedValue(undefined),
    }));

    mockSwapRequestModel = Object.assign(MockSwapClass, {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      prototype: {},
    });

    mockValidationService = {
      validateSwap: jest.fn(),
      updateDailyUsage: jest.fn(),
    };

    mockCalculationService = {
      calculateSwap: jest.fn(),
      validateAmounts: jest.fn(),
      toMinorUnits: jest.fn((amount) => Math.round(amount * 100000000)),
    };

    mockReservesService = {
      getReserve: jest.fn(),
    };

    mockPostingService = {
      postJournalEntry: jest.fn(),
    };

    mockAccountService = {
      getOrCreateAccount: jest.fn(),
    };

    mockPriceOracleService = {
      getBaseRate: jest.fn().mockResolvedValue(50000), // Mock base rate
    };

    mockSpreadManagerService = {
      applySpread: jest.fn().mockResolvedValue({
        finalRate: 51250, // Base rate + spread
        baseRate: 50000,
        spread: 2.5,
        band: 'green',
        requiresJustification: false,
      }),
    };

    mockPricingConfigService = {
      getConfigurationByPair: jest.fn().mockResolvedValue({
        _id: 'config123',
        assetPair: 'USD/BTC',
        buySpread: 2.5,
        sellSpread: 2.5,
        totalSpread: 5.0,
        currentBand: 'green',
        enabled: true,
        requiresJustification: false,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwapExecutionService,
        {
          provide: getModelToken(SwapRequest.name),
          useValue: mockSwapRequestModel,
        },
        {
          provide: SwapValidationService,
          useValue: mockValidationService,
        },
        {
          provide: SwapCalculationService,
          useValue: mockCalculationService,
        },
        {
          provide: PlatformReservesService,
          useValue: mockReservesService,
        },
        {
          provide: PostingService,
          useValue: mockPostingService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
        {
          provide: PriceOracleService,
          useValue: mockPriceOracleService,
        },
        {
          provide: SpreadManagerService,
          useValue: mockSpreadManagerService,
        },
        {
          provide: PricingConfigurationService,
          useValue: mockPricingConfigService,
        },
      ],
    }).compile();

    service = module.get<SwapExecutionService>(SwapExecutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuote', () => {
    it('should return a quote with correct calculation', async () => {
      mockCalculationService.calculateSwap.mockReturnValue({
        fromAmount: 1000,
        toAmount: 0.02,
      });

      const result = await service.getQuote(
        {
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
        },
        'user1',
      );

      expect(result).toMatchObject({
        fromAsset: 'USD',
        toAsset: 'BTC',
        fromAmount: 1000,
        toAmount: 0.02,
      });
      expect(result.quoteId).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });
  });

  describe('executeSwap', () => {
    it('should return existing swap if idempotency key exists', async () => {
      const existingSwap = {
        _id: '507f1f77bcf86cd799439011',
        status: SwapStatus.EXECUTED,
        fromAsset: 'USD',
        toAsset: 'BTC',
        fromAmount: 1000,
        toAmount: 0.02,
        executedRate: 50000,
        spread: 2.5,
        pricingBand: 'green',
        executedAt: new Date(),
        ledgerEntryId: 'entry123',
      };

      mockSwapRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSwap),
      });

      const result = await service.executeSwap(
        {
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          idempotencyKey: 'swap123',
        },
        'user1',
      );

      expect(result.swapId).toBe('507f1f77bcf86cd799439011');
      expect(result.status).toBe(SwapStatus.EXECUTED);
    });

    it('should throw ConflictException if swap exists with different status', async () => {
      const existingSwap = {
        status: SwapStatus.FAILED,
      };

      mockSwapRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSwap),
      });

      await expect(
        service.executeSwap(
          {
            fromAsset: 'USD',
            toAsset: 'BTC',
            fromAmount: 1000,
            idempotencyKey: 'swap123',
          },
          'user1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should execute new swap successfully', async () => {
      mockSwapRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockCalculationService.calculateSwap.mockReturnValue({
        fromAmount: 1000,
        toAmount: 0.02,
      });

      mockAccountService.getOrCreateAccount.mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
      });

      mockPostingService.postJournalEntry.mockResolvedValue({
        _id: 'entry123',
      });

      const result = await service.executeSwap(
        {
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          idempotencyKey: 'swap123',
        },
        'user1',
      );

      expect(result.swapId).toBe('507f1f77bcf86cd799439011');
      expect(mockValidationService.validateSwap).toHaveBeenCalled();
      expect(mockPostingService.postJournalEntry).toHaveBeenCalled();
      expect(mockValidationService.updateDailyUsage).toHaveBeenCalled();
    });

    it('should mark swap as failed if ledger execution fails', async () => {
      mockSwapRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockCalculationService.calculateSwap.mockReturnValue({
        fromAmount: 1000,
        toAmount: 0.02,
      });

      mockAccountService.getOrCreateAccount.mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
      });

      mockPostingService.postJournalEntry.mockRejectedValue(new Error('Ledger error'));

      await expect(
        service.executeSwap(
          {
            fromAsset: 'USD',
            toAsset: 'BTC',
            fromAmount: 1000,
            idempotencyKey: 'swap123',
          },
          'user1',
        ),
      ).rejects.toThrow('Ledger error');

      expect(mockSwapRequestModel).toHaveBeenCalled();
    });
  });

  describe('getSwapHistory', () => {
    it('should return user swap history', async () => {
      const mockSwaps = [
        {
          _id: '507f1f77bcf86cd799439011',
          userId: 'user1',
          fromAsset: 'USD',
          toAsset: 'BTC',
        },
      ];

      mockSwapRequestModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSwaps),
      });

      const result = await service.getSwapHistory('user1');

      expect(result).toEqual(mockSwaps);
      expect(mockSwapRequestModel.find).toHaveBeenCalledWith({ userId: 'user1' });
    });
  });
});
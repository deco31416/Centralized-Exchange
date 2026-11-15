import { Test, TestingModule } from '@nestjs/testing';
import { SpreadManagerService } from './spread-manager.service';
import { getModelToken } from '@nestjs/mongoose';
import { PricingConfiguration, PricingBand } from '../models/pricing-configuration.schema';
import { PricingBandLog } from '../models/pricing-band-log.schema';
import { BadRequestException } from '@nestjs/common';

describe('SpreadManagerService', () => {
  let service: SpreadManagerService;
  let mockConfigModel: any;
  let mockBandLogModel: any;

  beforeEach(async () => {
    const MockBandLogClass = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ ...data }),
    }));

    mockConfigModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    mockBandLogModel = Object.assign(MockBandLogClass, {
      find: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpreadManagerService,
        {
          provide: getModelToken(PricingConfiguration.name),
          useValue: mockConfigModel,
        },
        {
          provide: getModelToken(PricingBandLog.name),
          useValue: mockBandLogModel,
        },
      ],
    }).compile();

    service = module.get<SpreadManagerService>(SpreadManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePricingBand', () => {
    it('should return green band for spread <= 10%', () => {
      const result = service.validatePricingBand(2.5, 2.5);
      expect(result.band).toBe(PricingBand.GREEN);
      expect(result.isAllowed).toBe(true);
      expect(result.requiresJustification).toBe(false);
      expect(result.totalSpread).toBe(5);
    });

    it('should return yellow band for spread 10-15%', () => {
      const result = service.validatePricingBand(6, 6);
      expect(result.band).toBe(PricingBand.YELLOW);
      expect(result.isAllowed).toBe(true);
      expect(result.requiresJustification).toBe(true);
      expect(result.totalSpread).toBe(12);
    });

    it('should return red band for spread > 15%', () => {
      const result = service.validatePricingBand(8, 8);
      expect(result.band).toBe(PricingBand.RED);
      expect(result.isAllowed).toBe(false);
      expect(result.requiresJustification).toBe(false);
      expect(result.totalSpread).toBe(16);
    });

    it('should handle edge case at 10%', () => {
      const result = service.validatePricingBand(5, 5);
      expect(result.band).toBe(PricingBand.GREEN);
      expect(result.totalSpread).toBe(10);
    });

    it('should handle edge case at 15%', () => {
      const result = service.validatePricingBand(7.5, 7.5);
      expect(result.band).toBe(PricingBand.YELLOW);
      expect(result.totalSpread).toBe(15);
    });
  });

  describe('applySpread', () => {
    const mockConfig = {
      _id: '507f1f77bcf86cd799439011',
      assetPair: 'USD/BSS',
      buySpread: 2.7,
      sellSpread: 2.7,
      totalSpread: 5.4,
      currentBand: PricingBand.GREEN,
    } as any;

    it('should apply sell spread correctly (platform sells)', async () => {
      const result = await service.applySpread({
        baseRate: 100,
        config: mockConfig,
        direction: 'buy',
      });

      expect(result.finalRate).toBeCloseTo(102.7, 1); // 100 + 2.7%
      expect(result.baseRate).toBe(100);
      expect(result.spread).toBe(2.7);
      expect(result.band).toBe(PricingBand.GREEN);
    });

    it('should apply buy spread correctly (platform buys)', async () => {
      const result = await service.applySpread({
        baseRate: 100,
        config: mockConfig,
        direction: 'sell',
      });

      expect(result.finalRate).toBe(97.3); // 100 - 2.7%
      expect(result.baseRate).toBe(100);
      expect(result.spread).toBe(2.7);
    });

    it('should throw error for red band configuration', async () => {
      const redConfig = {
        ...mockConfig,
        buySpread: 8,
        sellSpread: 8,
        currentBand: PricingBand.RED,
      };

      await expect(
        service.applySpread({
          baseRate: 100,
          config: redConfig,
          direction: 'buy',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should log usage for yellow band', async () => {
      const yellowConfig = {
        ...mockConfig,
        buySpread: 6,
        sellSpread: 6,
        currentBand: PricingBand.YELLOW,
      };

      await service.applySpread({
        baseRate: 100,
        config: yellowConfig,
        direction: 'buy',
      });

      expect(mockBandLogModel).toHaveBeenCalled();
    });
  });

  describe('getBandLogs', () => {
    it('should retrieve logs for a configuration', async () => {
      const mockLogs = [
        { band: PricingBand.GREEN, timestamp: new Date() },
        { band: PricingBand.YELLOW, timestamp: new Date() },
      ];

      mockBandLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLogs),
          }),
        }),
      });

      const logs = await service.getBandLogs('507f1f77bcf86cd799439011', 50);
      expect(logs).toHaveLength(2);
    });
  });
});
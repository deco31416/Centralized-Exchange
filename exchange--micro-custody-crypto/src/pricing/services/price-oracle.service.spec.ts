import { Test, TestingModule } from '@nestjs/testing';
import { PriceOracleService } from './price-oracle.service';
import { getModelToken } from '@nestjs/mongoose';
import { PriceProvider, ProviderType } from '../models/price-provider.schema';
import { ExchangeRate } from '../models/exchange-rate.schema';
import { NotFoundException } from '@nestjs/common';

describe('PriceOracleService', () => {
  let service: PriceOracleService;
  let mockProviderModel: any;
  let mockRateModel: any;

  beforeEach(async () => {
    const MockRateClass = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ ...data }),
    }));

    mockProviderModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      }),
    };

    mockRateModel = Object.assign(MockRateClass, {
      findOne: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceOracleService,
        {
          provide: getModelToken(PriceProvider.name),
          useValue: mockProviderModel,
        },
        {
          provide: getModelToken(ExchangeRate.name),
          useValue: mockRateModel,
        },
      ],
    }).compile();

    service = module.get<PriceOracleService>(PriceOracleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBaseRate', () => {
    it('should return rate from cache if available', async () => {
      // First call to populate cache
      mockProviderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              _id: '507f1f77bcf86cd799439011',
              name: 'binance',
              weight: 1.0,
              enabled: true,
              assetPairs: ['USD/BTC'],
              consecutiveFailures: 0,
            },
          ]),
        }),
      });

      mockProviderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'binance',
          enabled: true,
          weight: 1.0,
        }),
      });

      mockRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const rate1 = await service.getBaseRate('USD', 'BTC');
      
      // Second call should use cache
      const rate2 = await service.getBaseRate('USD', 'BTC');

      expect(rate1).toBe(rate2);
    });

    it('should throw error if no providers available and no fallback', async () => {
      mockProviderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      mockRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getBaseRate('USD', 'UNKNOWN')).rejects.toThrow(NotFoundException);
    });

    it('should use fallback if all providers fail', async () => {
      // No enabled providers
      mockProviderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const fallbackRate = {
        rate: 48000,
        timestamp: new Date(),
      };

      mockRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(fallbackRate),
        }),
      });

      // This should trigger fallback
      const rate = await service.getBaseRate('USD', 'BTC');
      expect(rate).toBe(48000);
    });
  });

  describe('getRateFromProvider', () => {
    it('should get rate from provider successfully', async () => {
      mockProviderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'binance',
          enabled: true,
          weight: 1.0,
        }),
      });

      const rate = await service.getRateFromProvider('507f1f77bcf86cd799439011', 'USD', 'BTC');
      expect(rate).toBeGreaterThan(0);
    });

    it('should throw error if provider not found', async () => {
      mockProviderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getRateFromProvider('invalid-id', 'USD', 'BTC'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if provider is disabled', async () => {
      mockProviderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'binance',
          enabled: false,
        }),
      });

      await expect(
        service.getRateFromProvider('507f1f77bcf86cd799439011', 'USD', 'BTC'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProvider', () => {
    it('should update provider successfully', async () => {
      const mockProvider = {
        _id: '507f1f77bcf86cd799439011',
        name: 'binance',
        enabled: true,
        weight: 0.5,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockProviderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProvider),
      });

      const updated = await service.updateProvider('507f1f77bcf86cd799439011', {
        enabled: false,
      });

      expect(mockProvider.save).toHaveBeenCalled();
      expect(updated.enabled).toBe(false);
    });

    it('should throw error if provider not found', async () => {
      mockProviderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateProvider('invalid-id', { enabled: false }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCachedRateInfo', () => {
    it('should return null if no cache available', () => {
      const info = service.getCachedRateInfo('USD', 'UNKNOWN');
      expect(info).toBeNull();
    });

    it('should return cached info if available', async () => {
      // Mock provider with proper chaining
      mockProviderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              _id: '507f1f77bcf86cd799439011',
              name: 'binance',
              weight: 1.0,
              enabled: true,
              assetPairs: ['USD/BTC'],
              consecutiveFailures: 0,
            },
          ]),
        }),
      });

      // Mock provider findById for getRateFromProvider
      mockProviderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'binance',
          enabled: true,
          weight: 1.0,
        }),
      });

      await service.getBaseRate('USD', 'BTC');
      const info = service.getCachedRateInfo('USD', 'BTC');

      expect(info).not.toBeNull();
      expect(info?.cached).toBe(true);
      expect(info?.rate).toBeGreaterThan(0);
    });
  });
});
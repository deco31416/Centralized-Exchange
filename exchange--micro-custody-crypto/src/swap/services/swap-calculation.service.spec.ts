import { Test, TestingModule } from '@nestjs/testing';
import { SwapCalculationService } from './swap-calculation.service';
import { BadRequestException } from '@nestjs/common';

describe('SwapCalculationService', () => {
  let service: SwapCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwapCalculationService],
    }).compile();

    service = module.get<SwapCalculationService>(SwapCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateSwap', () => {
    it('should calculate toAmount when fromAmount is provided', () => {
      const result = service.calculateSwap({
        fromAsset: 'USD',
        toAsset: 'BTC',
        fromAmount: 50000,
        rate: 50000,
      });

      expect(result.fromAmount).toBe(50000);
      expect(result.toAmount).toBe(1);
      expect(result.rate).toBe(50000);
    });

    it('should calculate fromAmount when toAmount is provided', () => {
      const result = service.calculateSwap({
        fromAsset: 'USD',
        toAsset: 'BTC',
        toAmount: 0.5,
        rate: 50000,
      });

      expect(result.fromAmount).toBe(25000);
      expect(result.toAmount).toBe(0.5);
      expect(result.rate).toBe(50000);
    });

    it('should throw error when neither fromAmount nor toAmount is provided', () => {
      expect(() => {
        service.calculateSwap({
          fromAsset: 'USD',
          toAsset: 'BTC',
          rate: 50000,
        });
      }).toThrow(BadRequestException);
    });

    it('should throw error when both fromAmount and toAmount are provided', () => {
      expect(() => {
        service.calculateSwap({
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          toAmount: 0.02,
          rate: 50000,
        });
      }).toThrow(BadRequestException);
    });

    it('should throw error when rate is invalid', () => {
      expect(() => {
        service.calculateSwap({
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          rate: 0,
        });
      }).toThrow(BadRequestException);
    });

    it('should handle small amounts correctly', () => {
      const result = service.calculateSwap({
        fromAsset: 'BTC',
        toAsset: 'USD',
        fromAmount: 0.001,
        rate: 0.00002, // 1 USD = 0.00002 BTC, so 0.001 BTC / 0.00002 = 50 USD
      });

      expect(result.fromAmount).toBe(0.001);
      expect(result.toAmount).toBe(50); // Corrected: 0.001 / 0.00002 = 50
    });
  });

  describe('toMinorUnits', () => {
    it('should convert crypto to 8 decimals', () => {
      expect(service.toMinorUnits(1.5, 'BTC')).toBe(150000000);
      expect(service.toMinorUnits(0.001, 'ETH')).toBe(100000);
    });

    it('should convert fiat to 2 decimals', () => {
      expect(service.toMinorUnits(100.50, 'USD')).toBe(10050);
      expect(service.toMinorUnits(1000, 'BSS')).toBe(100000);
    });
  });

  describe('fromMinorUnits', () => {
    it('should convert from crypto minor units', () => {
      expect(service.fromMinorUnits(150000000, 'BTC')).toBe(1.5);
      expect(service.fromMinorUnits(100000, 'ETH')).toBe(0.001);
    });

    it('should convert from fiat minor units', () => {
      expect(service.fromMinorUnits(10050, 'USD')).toBe(100.50);
      expect(service.fromMinorUnits(100000, 'BSS')).toBe(1000);
    });
  });

  describe('validateAmounts', () => {
    it('should pass for valid amounts', () => {
      expect(() => {
        service.validateAmounts(100, 0.002);
      }).not.toThrow();
    });

    it('should throw error for zero fromAmount', () => {
      expect(() => {
        service.validateAmounts(0, 0.002);
      }).toThrow(BadRequestException);
    });

    it('should throw error for negative fromAmount', () => {
      expect(() => {
        service.validateAmounts(-100, 0.002);
      }).toThrow(BadRequestException);
    });

    it('should throw error for zero toAmount', () => {
      expect(() => {
        service.validateAmounts(100, 0);
      }).toThrow(BadRequestException);
    });

    it('should throw error for negative toAmount', () => {
      expect(() => {
        service.validateAmounts(100, -0.002);
      }).toThrow(BadRequestException);
    });
  });
});
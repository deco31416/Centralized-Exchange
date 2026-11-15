import { Test, TestingModule } from '@nestjs/testing';
import { PlatformReservesService } from './platform-reserves.service';
import { getModelToken } from '@nestjs/mongoose';
import { PlatformReserve } from '../models/platform-reserve.schema';
import { NotFoundException } from '@nestjs/common';

describe('PlatformReservesService', () => {
  let service: PlatformReservesService;
  let mockPlatformReserveModel: any;

  beforeEach(async () => {
    const MockReserveClass = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ ...data }),
    }));

    mockPlatformReserveModel = Object.assign(MockReserveClass, {
      findOne: jest.fn(),
      find: jest.fn(),
      prototype: {},
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformReservesService,
        {
          provide: getModelToken(PlatformReserve.name),
          useValue: mockPlatformReserveModel,
        },
      ],
    }).compile();

    service = module.get<PlatformReservesService>(PlatformReservesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReserve', () => {
    it('should return reserve for existing asset', async () => {
      const mockReserve = {
        assetCode: 'BTC',
        virtualBalance: 10,
        realBalance: 10,
        coverage: 1.0,
      };

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReserve),
      });

      const result = await service.getReserve('BTC');

      expect(result).toEqual(mockReserve);
    });

    it('should throw NotFoundException for non-existing asset', async () => {
      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getReserve('XYZ')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllReserves', () => {
    it('should return all reserves', async () => {
      const mockReserves = [
        { assetCode: 'BTC', virtualBalance: 10 },
        { assetCode: 'USD', virtualBalance: 100000 },
      ];

      mockPlatformReserveModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReserves),
      });

      const result = await service.getAllReserves();

      expect(result).toEqual(mockReserves);
    });
  });

  describe('createReserve', () => {
    it('should return existing reserve if already exists', async () => {
      const existingReserve = {
        assetCode: 'BTC',
        virtualBalance: 10,
      };

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingReserve),
      });

      const result = await service.createReserve({
        assetCode: 'BTC',
        virtualBalance: 20,
        realBalance: 20,
        exposureLimit: 100,
      });

      expect(result).toEqual(existingReserve);
    });

    it('should create new reserve if does not exist', async () => {
      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.createReserve({
        assetCode: 'ETH',
        virtualBalance: 100,
        realBalance: 100,
        exposureLimit: 1000,
      });

      expect(mockPlatformReserveModel).toHaveBeenCalled();
      expect(result.assetCode).toBe('ETH');
    });
  });

  describe('getCoverageRatio', () => {
    it('should return coverage ratio for asset', async () => {
      const mockReserve = {
        assetCode: 'BTC',
        coverage: 1.5,
      };

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReserve),
      });

      const result = await service.getCoverageRatio('BTC');

      expect(result).toBe(1.5);
    });
  });

  describe('getExposure', () => {
    it('should calculate exposure correctly', async () => {
      const mockReserve = {
        assetCode: 'BTC',
        virtualBalance: 8,
        realBalance: 10,
      };

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReserve),
      });

      const result = await service.getExposure('BTC');

      expect(result).toBe(-2); // 8 - 10 = -2
    });
  });

  describe('hasSufficientReserves', () => {
    it('should return true when reserves are sufficient', async () => {
      const mockReserve = {
        assetCode: 'BTC',
        virtualBalance: 10,
      };

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReserve),
      });

      const result = await service.hasSufficientReserves('BTC', 5);

      expect(result).toBe(true);
    });

    it('should return false when reserves are insufficient', async () => {
      const mockReserve = {
        assetCode: 'BTC',
        virtualBalance: 3,
      };

      mockPlatformReserveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReserve),
      });

      const result = await service.hasSufficientReserves('BTC', 5);

      expect(result).toBe(false);
    });
  });
});
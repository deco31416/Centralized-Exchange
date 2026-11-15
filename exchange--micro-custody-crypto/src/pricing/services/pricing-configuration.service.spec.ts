import { Test, TestingModule } from '@nestjs/testing';
import { PricingConfigurationService } from './pricing-configuration.service';
import { SpreadManagerService } from './spread-manager.service';
import { getModelToken } from '@nestjs/mongoose';
import { PricingConfiguration, PricingBand } from '../models/pricing-configuration.schema';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('PricingConfigurationService', () => {
  let service: PricingConfigurationService;
  let mockConfigModel: any;
  let mockSpreadManager: any;

  beforeEach(async () => {
    const MockConfigClass = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: '507f1f77bcf86cd799439011',
      save: jest.fn().mockResolvedValue({ ...data, _id: '507f1f77bcf86cd799439011' }),
    }));

    mockConfigModel = Object.assign(MockConfigClass, {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndDelete: jest.fn(),
    });

    mockSpreadManager = {
      validatePricingBand: jest.fn(),
      logConfigurationChange: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingConfigurationService,
        {
          provide: getModelToken(PricingConfiguration.name),
          useValue: mockConfigModel,
        },
        {
          provide: SpreadManagerService,
          useValue: mockSpreadManager,
        },
      ],
    }).compile();

    service = module.get<PricingConfigurationService>(PricingConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConfiguration', () => {
    it('should create configuration successfully', async () => {
      mockConfigModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockSpreadManager.validatePricingBand.mockReturnValue({
        band: PricingBand.GREEN,
        isAllowed: true,
        requiresJustification: false,
      });

      const config = await service.createConfiguration({
        assetPair: 'USD/BSS',
        buySpread: 2.7,
        sellSpread: 2.7,
      });

      expect(config).toBeDefined();
      expect(mockSpreadManager.logConfigurationChange).toHaveBeenCalled();
    });

    it('should throw error if configuration already exists', async () => {
      mockConfigModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ assetPair: 'USD/BSS' }),
      });

      await expect(
        service.createConfiguration({
          assetPair: 'USD/BSS',
          buySpread: 2.7,
          sellSpread: 2.7,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw error if band is not allowed', async () => {
      mockConfigModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockSpreadManager.validatePricingBand.mockReturnValue({
        band: PricingBand.RED,
        isAllowed: false,
        message: 'Red band not allowed',
      });

      await expect(
        service.createConfiguration({
          assetPair: 'USD/BSS',
          buySpread: 8,
          sellSpread: 8,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSpreads', () => {
    it('should update spreads successfully', async () => {
      const mockConfig = {
        _id: '507f1f77bcf86cd799439011',
        assetPair: 'USD/BSS',
        buySpread: 2.7,
        sellSpread: 2.7,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockConfigModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConfig),
      });

      mockSpreadManager.validatePricingBand.mockReturnValue({
        band: PricingBand.GREEN,
        isAllowed: true,
        requiresJustification: false,
      });

      const updated = await service.updateSpreads('507f1f77bcf86cd799439011', {
        buySpread: 3.0,
        sellSpread: 3.0,
      });

      expect(updated.buySpread).toBe(3.0);
      expect(mockConfig.save).toHaveBeenCalled();
    });

    it('should require justification for yellow band', async () => {
      const mockConfig = {
        _id: '507f1f77bcf86cd799439011',
        assetPair: 'USD/BSS',
        buySpread: 2.7,
        sellSpread: 2.7,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockConfigModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConfig),
      });

      mockSpreadManager.validatePricingBand.mockReturnValue({
        band: PricingBand.YELLOW,
        isAllowed: true,
        requiresJustification: true,
      });

      await expect(
        service.updateSpreads('507f1f77bcf86cd799439011', {
          buySpread: 6.0,
          sellSpread: 6.0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if configuration not found', async () => {
      mockConfigModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateSpreads('invalid-id', {
          buySpread: 3.0,
          sellSpread: 3.0,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConfigurationByPair', () => {
    it('should get configuration by asset pair', async () => {
      const mockConfig = {
        assetPair: 'USD/BSS',
        buySpread: 2.7,
        sellSpread: 2.7,
      };

      mockConfigModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConfig),
      });

      const config = await service.getConfigurationByPair('USD/BSS');
      expect(config.assetPair).toBe('USD/BSS');
    });

    it('should throw error if not found', async () => {
      mockConfigModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getConfigurationByPair('UNKNOWN')).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleConfiguration', () => {
    it('should toggle enabled status', async () => {
      const mockConfig = {
        _id: '507f1f77bcf86cd799439011',
        enabled: true,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockConfigModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConfig),
      });

      const updated = await service.toggleConfiguration('507f1f77bcf86cd799439011', false);
      expect(updated.enabled).toBe(false);
      expect(mockConfig.save).toHaveBeenCalled();
    });
  });

  describe('deleteConfiguration', () => {
    it('should delete configuration successfully', async () => {
      mockConfigModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011' }),
      });

      await service.deleteConfiguration('507f1f77bcf86cd799439011');
      expect(mockConfigModel.findByIdAndDelete).toHaveBeenCalled();
    });

    it('should throw error if not found', async () => {
      mockConfigModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteConfiguration('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
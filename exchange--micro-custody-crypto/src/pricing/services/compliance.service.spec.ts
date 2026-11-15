import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceService } from './compliance.service';
import { getModelToken } from '@nestjs/mongoose';
import { PricingConfiguration, PricingBand } from '../models/pricing-configuration.schema';
import { PricingBandLog, BandEventType } from '../models/pricing-band-log.schema';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let mockConfigModel: any;
  let mockBandLogModel: any;

  beforeEach(async () => {
    mockConfigModel = {
      find: jest.fn(),
    };

    mockBandLogModel = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
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

    service = module.get<ComplianceService>(ComplianceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDailyReport', () => {
    it('should generate report with correct statistics', async () => {
      const mockLogs = [
        { band: PricingBand.GREEN },
        { band: PricingBand.GREEN },
        { band: PricingBand.YELLOW },
      ];

      mockBandLogModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLogs),
        }),
      });

      const report = await service.generateDailyReport(new Date('2025-10-01'));

      expect(report.totalPricingOperations).toBe(3);
      expect(report.operationsByBand.green).toBe(2);
      expect(report.operationsByBand.yellow).toBe(1);
      expect(report.operationsByBand.red).toBe(0);
    });
  });

  describe('getActiveAlerts', () => {
    it('should return alerts for yellow band configurations needing review', async () => {
      const oldDate = new Date(Date.now() - 50 * 60 * 60 * 1000); // 50 hours ago (more than 48h)
      
      mockConfigModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: '507f1f77bcf86cd799439011',
            assetPair: 'USD/BSS',
            currentBand: PricingBand.YELLOW,
            enabled: true,
            lastBandCheck: oldDate,
          },
        ]),
      });

      mockBandLogModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const alerts = await service.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe('critical'); // More than 48h (24h * 2)
      expect(alerts[0].band).toBe(PricingBand.YELLOW);
    });

    it('should return critical alerts for red band violations', async () => {
      mockConfigModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      mockBandLogModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              _id: '507f1f77bcf86cd799439012',
              band: PricingBand.RED,
              eventType: BandEventType.VIOLATION_ATTEMPT,
              timestamp: new Date(),
              totalSpread: 16,
              pricingConfigId: { assetPair: 'USD/BSS' },
            },
          ]),
        }),
      });

      const alerts = await service.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[0].band).toBe(PricingBand.RED);
    });
  });

  describe('getComplianceStats', () => {
    it('should return compliance statistics', async () => {
      const mockLogs = [
        { band: PricingBand.GREEN, totalSpread: 5 },
        { band: PricingBand.GREEN, totalSpread: 6 },
        { band: PricingBand.YELLOW, totalSpread: 12 },
      ];

      mockBandLogModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLogs),
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      mockConfigModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const stats = await service.getComplianceStats(30);

      expect(stats.totalOperations).toBe(3);
      expect(stats.bandDistribution.green).toBe(2);
      expect(stats.bandDistribution.yellow).toBe(1);
      expect(stats.averageSpread).toBeCloseTo(7.67, 1);
    });
  });

  describe('requiresApproval', () => {
    it('should return true for yellow band without approval', async () => {
      const config = {
        currentBand: PricingBand.YELLOW,
        approvedBy: undefined,
      } as any;

      const requires = await service.requiresApproval(config);
      expect(requires).toBe(true);
    });

    it('should return false for green band', async () => {
      const config = {
        currentBand: PricingBand.GREEN,
      } as any;

      const requires = await service.requiresApproval(config);
      expect(requires).toBe(false);
    });

    it('should return false for yellow band with approval', async () => {
      const config = {
        currentBand: PricingBand.YELLOW,
        approvedBy: 'admin123',
      } as any;

      const requires = await service.requiresApproval(config);
      expect(requires).toBe(false);
    });
  });
});
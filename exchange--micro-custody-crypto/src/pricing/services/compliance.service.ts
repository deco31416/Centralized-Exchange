import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingConfiguration, PricingBand } from '../models/pricing-configuration.schema';
import { PricingBandLog, BandEventType } from '../models/pricing-band-log.schema';

interface ComplianceAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  band: PricingBand;
  message: string;
  configId: string;
  assetPair: string;
  requiresAction: boolean;
  actionDeadline?: Date;
  createdAt: Date;
}

interface RegulatoryReport {
  reportId: string;
  period: { start: Date; end: Date };
  totalPricingOperations: number;
  operationsByBand: {
    green: number;
    yellow: number;
    red: number;
  };
  yellowBandJustifications: Array<{
    assetPair: string;
    justification: string;
    approvedBy: string;
    timestamp: Date;
  }>;
  redBandAttempts: Array<{
    assetPair: string;
    attemptedSpread: number;
    timestamp: Date;
  }>;
  generatedAt: Date;
}

/**
 * Service responsible for compliance monitoring and regulatory reporting.
 */
@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);
  private readonly YELLOW_BAND_REVIEW_HOURS = 24;

  constructor(
    @InjectModel(PricingConfiguration.name) private configModel: Model<PricingConfiguration>,
    @InjectModel(PricingBandLog.name) private bandLogModel: Model<PricingBandLog>,
  ) {}

  /**
   * Generate daily regulatory report.
   */
  async generateDailyReport(date: Date): Promise<RegulatoryReport> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await this.bandLogModel
      .find({
        timestamp: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate('pricingConfigId')
      .exec();

    const greenOps = logs.filter(l => l.band === PricingBand.GREEN).length;
    const yellowOps = logs.filter(l => l.band === PricingBand.YELLOW).length;
    const redOps = logs.filter(l => l.band === PricingBand.RED).length;

    const yellowJustifications = await this.getYellowBandJustifications(startOfDay, endOfDay);
    const redAttempts = await this.getRedBandAttempts(startOfDay, endOfDay);

    return {
      reportId: `report_${date.toISOString().split('T')[0]}`,
      period: { start: startOfDay, end: endOfDay },
      totalPricingOperations: logs.length,
      operationsByBand: {
        green: greenOps,
        yellow: yellowOps,
        red: redOps,
      },
      yellowBandJustifications: yellowJustifications,
      redBandAttempts: redAttempts,
      generatedAt: new Date(),
    };
  }

  /**
   * Get active alerts that require attention.
   */
  async getActiveAlerts(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    // Check yellow band configurations that need review
    const yellowConfigs = await this.configModel
      .find({
        currentBand: PricingBand.YELLOW,
        enabled: true,
      })
      .exec();

    for (const config of yellowConfigs) {
      const hoursSinceCheck = (Date.now() - config.lastBandCheck.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCheck > this.YELLOW_BAND_REVIEW_HOURS) {
        const deadline = new Date(config.lastBandCheck.getTime() + this.YELLOW_BAND_REVIEW_HOURS * 60 * 60 * 1000);
        
        alerts.push({
          id: String(config._id),
          severity: hoursSinceCheck > this.YELLOW_BAND_REVIEW_HOURS * 2 ? 'critical' : 'warning',
          band: PricingBand.YELLOW,
          message: `Spread in yellow band requires review - last checked ${Math.floor(hoursSinceCheck)}h ago`,
          configId: String(config._id),
          assetPair: config.assetPair,
          requiresAction: true,
          actionDeadline: deadline,
          createdAt: config.lastBandCheck,
        });
      }
    }

    // Check for recent red band violation attempts
    const recentViolations = await this.bandLogModel
      .find({
        band: PricingBand.RED,
        eventType: BandEventType.VIOLATION_ATTEMPT,
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
      .populate('pricingConfigId')
      .exec();

    for (const violation of recentViolations) {
      const config = violation.pricingConfigId as any;
      
      alerts.push({
        id: String(violation._id),
        severity: 'critical',
        band: PricingBand.RED,
        message: `RED BAND VIOLATION ATTEMPT - Spread ${violation.totalSpread}% exceeds legal limit`,
        configId: String(violation.pricingConfigId),
        assetPair: config?.assetPair || 'Unknown',
        requiresAction: true,
        createdAt: violation.timestamp,
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Resolve an alert.
   */
  async resolveAlert(alertId: string, resolution: string): Promise<void> {
    this.logger.log(`Alert ${alertId} resolved: ${resolution}`);
    // In a real implementation, we'd mark the alert as resolved in a separate collection
  }

  /**
   * Check if configuration requires approval.
   */
  async requiresApproval(config: PricingConfiguration): Promise<boolean> {
    return config.currentBand === PricingBand.YELLOW && !config.approvedBy;
  }

  /**
   * Get yellow band justifications for a period.
   */
  private async getYellowBandJustifications(start: Date, end: Date): Promise<Array<{
    assetPair: string;
    justification: string;
    approvedBy: string;
    timestamp: Date;
  }>> {
    const logs = await this.bandLogModel
      .find({
        band: PricingBand.YELLOW,
        timestamp: { $gte: start, $lte: end },
        justification: { $exists: true, $ne: null },
      })
      .populate('pricingConfigId')
      .exec();

    return logs.map(log => {
      const config = log.pricingConfigId as any;
      return {
        assetPair: config?.assetPair || 'Unknown',
        justification: log.justification || '',
        approvedBy: log.approvedBy || 'N/A',
        timestamp: log.timestamp,
      };
    });
  }

  /**
   * Get red band violation attempts for a period.
   */
  private async getRedBandAttempts(start: Date, end: Date): Promise<Array<{
    assetPair: string;
    attemptedSpread: number;
    timestamp: Date;
  }>> {
    const logs = await this.bandLogModel
      .find({
        band: PricingBand.RED,
        eventType: BandEventType.VIOLATION_ATTEMPT,
        timestamp: { $gte: start, $lte: end },
      })
      .populate('pricingConfigId')
      .exec();

    return logs.map(log => {
      const config = log.pricingConfigId as any;
      return {
        assetPair: config?.assetPair || 'Unknown',
        attemptedSpread: log.totalSpread,
        timestamp: log.timestamp,
      };
    });
  }

  /**
   * Get compliance statistics.
   */
  async getComplianceStats(days: number = 30): Promise<{
    totalOperations: number;
    bandDistribution: { green: number; yellow: number; red: number };
    averageSpread: number;
    alertCount: number;
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await this.bandLogModel
      .find({ timestamp: { $gte: since } })
      .exec();

    const greenCount = logs.filter(l => l.band === PricingBand.GREEN).length;
    const yellowCount = logs.filter(l => l.band === PricingBand.YELLOW).length;
    const redCount = logs.filter(l => l.band === PricingBand.RED).length;

    const avgSpread = logs.length > 0
      ? logs.reduce((sum, l) => sum + l.totalSpread, 0) / logs.length
      : 0;

    const alerts = await this.getActiveAlerts();

    return {
      totalOperations: logs.length,
      bandDistribution: {
        green: greenCount,
        yellow: yellowCount,
        red: redCount,
      },
      averageSpread: Math.round(avgSpread * 100) / 100,
      alertCount: alerts.length,
    };
  }
}
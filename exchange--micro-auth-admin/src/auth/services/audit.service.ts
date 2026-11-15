import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AuditLog,
  AuditLogDocument,
} from '../../database/schemas/audit-log.schema';
import { CryptoService } from '../../crypto/crypto.service';

/**
 * Service for audit logging and security event tracking
 */
@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Logs an audit event
   */
  async logEvent(
    actorUserId: string | null,
    action: string,
    target: string,
    ipAddress: string,
    userAgent: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const ipHash = this.cryptoService.hashData(ipAddress);
    const userAgentHash = this.cryptoService.hashData(userAgent);

    const auditLog = new this.auditLogModel({
      actor_user_id: actorUserId ? new Types.ObjectId(actorUserId) : null,
      action,
      target,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      metadata,
      occurred_at: new Date(),
    });

    await auditLog.save();
  }

  /**
   * Gets audit logs for a user
   */
  async getUserAuditLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<AuditLogDocument[]> {
    return await this.auditLogModel
      .find({ actor_user_id: new Types.ObjectId(userId) })
      .sort({ occurred_at: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  /**
   * Gets recent security events for monitoring
   */
  async getRecentSecurityEvents(
    hours: number = 24,
    limit: number = 100,
  ): Promise<AuditLogDocument[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await this.auditLogModel
      .find({
        occurred_at: { $gte: since },
        action: {
          $in: [
            'auth.login_failed',
            'auth.token_refresh_failed',
            'user.password_changed',
            'mfa.verified',
            'session.revoked',
          ],
        },
      })
      .sort({ occurred_at: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Gets failed login attempts by IP
   */
  async getFailedLoginsByIp(
    ipAddress: string,
    hours: number = 1,
  ): Promise<number> {
    const ipHash = this.cryptoService.hashData(ipAddress);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await this.auditLogModel
      .countDocuments({
        ip_hash: ipHash,
        action: 'auth.login_failed',
        occurred_at: { $gte: since },
      })
      .exec();
  }

  /**
   * Gets failed login attempts for user
   */
  async getFailedLoginsByUser(
    userId: string,
    hours: number = 1,
  ): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await this.auditLogModel
      .countDocuments({
        actor_user_id: new Types.ObjectId(userId),
        action: 'auth.login_failed',
        occurred_at: { $gte: since },
      })
      .exec();
  }

  /**
   * Checks for suspicious activity patterns
   */
  async detectSuspiciousActivity(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{
    isRisky: boolean;
    reasons: string[];
    riskScore: number;
  }> {
    const _ipHash = this.cryptoService.hashData(ipAddress);
    const userAgentHash = this.cryptoService.hashData(userAgent);
    const now = new Date();
    const oneHour = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const reasons: string[] = [];
    let riskScore = 0;

    // Check for multiple failed attempts from same IP
    const failedFromIp = await this.getFailedLoginsByIp(ipAddress, 1);
    if (failedFromIp >= 5) {
      reasons.push('Multiple failed login attempts from IP');
      riskScore += 30;
    }

    // Check for failed attempts from this user
    const failedFromUser = await this.getFailedLoginsByUser(userId, 1);
    if (failedFromUser >= 3) {
      reasons.push('Multiple failed login attempts for user');
      riskScore += 20;
    }

    // Check for new device/location
    const recentLogins = await this.auditLogModel
      .find({
        actor_user_id: new Types.ObjectId(userId),
        action: 'auth.login_succeeded',
        occurred_at: { $gte: oneDay },
      })
      .limit(10)
      .exec();

    const hasSeenThisDevice = recentLogins.some(
      (log) => log.user_agent_hash === userAgentHash,
    );

    if (!hasSeenThisDevice && recentLogins.length > 0) {
      reasons.push('Login from new device');
      riskScore += 15;
    }

    // Check for rapid succession logins
    const recentLoginCount = await this.auditLogModel
      .countDocuments({
        actor_user_id: new Types.ObjectId(userId),
        action: 'auth.login_succeeded',
        occurred_at: { $gte: oneHour },
      })
      .exec();

    if (recentLoginCount >= 3) {
      reasons.push('Multiple logins in short time');
      riskScore += 10;
    }

    return {
      isRisky: riskScore >= 25,
      reasons,
      riskScore,
    };
  }

  /**
   * Cleans up old audit logs based on retention policy
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<void> {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    await this.auditLogModel
      .deleteMany({
        occurred_at: { $lt: cutoff },
      })
      .exec();
  }
}

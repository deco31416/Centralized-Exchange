import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../database/schemas/audit-log.schema';
import { createHash } from 'crypto';

export enum AuditAction {
  // ============ AUTENTICACIÓN ============
  LOGIN_SUCCESS = 'auth:login:success',
  LOGIN_FAILED = 'auth:login:failed',
  LOGIN_LOCKED = 'auth:login:locked',
  LOGOUT = 'auth:logout',
  LOGOUT_ALL_DEVICES = 'auth:logout:all',
  
  // ============ USUARIOS ============
  USER_CREATED = 'user:created',
  USER_UPDATED = 'user:updated',
  USER_DELETED = 'user:deleted',
  USER_SUSPENDED = 'user:suspended',
  USER_REACTIVATED = 'user:reactivated',
  USER_ROLES_CHANGED = 'user:roles:changed',
  
  // ============ ADMIN MANAGEMENT ============
  ADMIN_CREATED = 'admin:created',
  ADMIN_UPDATED = 'admin:updated',
  ADMIN_DELETED = 'admin:deleted',
  ADMIN_ROLES_ASSIGNED = 'admin:roles:assigned',
  
  // ============ PASSWORD & SECURITY ============
  PASSWORD_CHANGED = 'password:changed',
  PASSWORD_RESET_REQUESTED = 'password:reset:requested',
  PASSWORD_RESET_COMPLETED = 'password:reset:completed',
  MFA_ENABLED = 'mfa:enabled',
  MFA_DISABLED = 'mfa:disabled',
  
  // ============ FINANZAS ============
  DEPOSIT_APPROVED = 'deposit:approved',
  DEPOSIT_REJECTED = 'deposit:rejected',
  WITHDRAWAL_APPROVED = 'withdrawal:approved',
  WITHDRAWAL_REJECTED = 'withdrawal:rejected',
  BALANCE_ADJUSTED = 'balance:adjusted',
  
  // ============ COMPLIANCE ============
  KYC_VERIFIED = 'kyc:verified',
  KYC_REJECTED = 'kyc:rejected',
  AML_FLAGGED = 'aml:flagged',
  REPORT_GENERATED = 'compliance:report:generated',
  
  // ============ CONFIGURACIÓN ============
  SETTINGS_CHANGED = 'settings:changed',
  FEE_CHANGED = 'fee:changed',
  PAIR_ADDED = 'pair:added',
  PAIR_REMOVED = 'pair:removed',
  ASSET_ADDED = 'asset:added',
  ASSET_REMOVED = 'asset:removed',
  
  // ============ CUSTODIA ============
  WALLET_CREATED = 'wallet:created',
  WALLET_TRANSFERRED = 'wallet:transferred',
  COLD_WALLET_ACCESSED = 'cold_wallet:accessed',
  
  // ============ SISTEMA ============
  SYSTEM_RESTARTED = 'system:restarted',
  MAINTENANCE_STARTED = 'system:maintenance:started',
  MAINTENANCE_ENDED = 'system:maintenance:ended',
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Hash IP/UserAgent para GDPR compliance (no almacenar IPs directamente)
   */
  private hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex').slice(0, 16);
  }

  /**
   * Registrar una acción en el audit log
   */
  async log(params: {
    action: AuditAction;
    actorUserId?: string;
    target: string;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.auditLogModel.create({
        action: params.action,
        actor_user_id: params.actorUserId || null,
        target: params.target,
        ip_hash: params.ip ? this.hashValue(params.ip) : 'UNKNOWN',
        user_agent_hash: params.userAgent ? this.hashValue(params.userAgent) : 'UNKNOWN',
        metadata: params.metadata || {},
        occurred_at: new Date(),
      });
    } catch (error) {
      // NO fallar el request principal si el audit log falla
      console.error('❌ Audit log failed:', error);
    }
  }

  /**
   * Obtener logs de auditoría de un usuario
   */
  async getUserLogs(userId: string, limit: number = 100) {
    return this.auditLogModel
      .find({ actor_user_id: userId })
      .sort({ occurred_at: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Obtener logs de una acción específica
   */
  async getActionLogs(action: AuditAction, limit: number = 100) {
    return this.auditLogModel
      .find({ action })
      .sort({ occurred_at: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Búsqueda avanzada de logs (para compliance)
   */
  async searchLogs(filters: {
    actorUserId?: string;
    actions?: AuditAction[];
    target?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const query: any = {};

    if (filters.actorUserId) {
      query.actor_user_id = filters.actorUserId;
    }

    if (filters.actions && filters.actions.length > 0) {
      query.action = { $in: filters.actions };
    }

    if (filters.target) {
      query.target = new RegExp(filters.target, 'i');
    }

    if (filters.startDate || filters.endDate) {
      query.occurred_at = {};
      if (filters.startDate) {
        query.occurred_at.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.occurred_at.$lte = filters.endDate;
      }
    }

    return this.auditLogModel
      .find(query)
      .sort({ occurred_at: -1 })
      .limit(filters.limit || 1000)
      .lean();
  }

  /**
   * Exportar logs para compliance (CSV)
   */
  async exportLogs(filters: {
    startDate: Date;
    endDate: Date;
    actions?: AuditAction[];
  }): Promise<string> {
    const logs = await this.searchLogs({
      ...filters,
      limit: 100000, // Sin límite para export
    });

    // Generar CSV
    const headers = ['Timestamp', 'Action', 'Actor', 'Target', 'IP Hash', 'Metadata'];
    const rows = logs.map(log => [
      log.occurred_at.toISOString(),
      log.action,
      log.actor_user_id?.toString() || 'SYSTEM',
      log.target,
      log.ip_hash,
      JSON.stringify(log.metadata || {}),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }

  /**
   * Stats de logs (para dashboard)
   */
  async getStats(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.auditLogModel.aggregate([
      { $match: { occurred_at: { $gte: startDate } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return stats;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { AssessUserRiskDto } from './dto/assess-user-risk.dto';
import { CreateKycRiskCaseDto } from './dto/create-case.dto';
import { UpdateKycRiskCaseStatusDto } from './dto/update-case-status.dto';
import {
  KycRiskCase,
  KycRiskRule,
  UserRiskLevel,
  UserRiskProfile,
  UserRiskSignal,
} from './interfaces/kyc-risk-case.interface';
import { KycRiskCaseEntity } from './schemas/kyc-risk-case.schema';
import { KycRiskRuleEntity } from './schemas/kyc-risk-rule.schema';
import { UserRiskProfileEntity } from './schemas/user-risk-profile.schema';

@Injectable()
export class KycRiskService {
  constructor(
    @InjectModel(KycRiskCaseEntity.name)
    private readonly caseModel: Model<KycRiskCaseEntity>,
    @InjectModel(KycRiskRuleEntity.name)
    private readonly ruleModel: Model<KycRiskRuleEntity>,
    @InjectModel(UserRiskProfileEntity.name)
    private readonly profileModel: Model<UserRiskProfileEntity>,
  ) {}

  async overview() {
    await this.ensureSeedData();

    const [cases, rules, profiles] = await Promise.all([
      this.caseModel.find().lean(),
      this.ruleModel.find().lean(),
      this.profileModel.find().lean(),
    ]);

    return {
      totalCases: cases.length,
      open: cases.filter((item) => item.status === 'open').length,
      inReview: cases.filter((item) => item.status === 'in_review').length,
      escalated: cases.filter((item) => item.status === 'escalated').length,
      critical: cases.filter((item) => item.severity === 'critical').length,
      enabledRules: rules.filter((rule) => rule.enabled).length,
      riskProfiles: profiles.length,
      greenUsers: profiles.filter((item) => item.riskLevel === 'green').length,
      orangeUsers: profiles.filter((item) => item.riskLevel === 'orange').length,
      redUsers: profiles.filter((item) => item.riskLevel === 'red').length,
      monitoringUsers: profiles.filter((item) => item.status === 'monitoring').length,
      blockedUsers: profiles.filter((item) => item.status === 'blocked' || item.status === 'restricted').length,
      source: 'mongo-persistent',
    };
  }

  async listCases() {
    const items = await this.caseModel.find().sort({ createdAt: -1 }).lean();
    return items.map((item) => this.toCase(item));
  }

  async createCase(dto: CreateKycRiskCaseDto) {
    const now = new Date().toISOString();
    const item: KycRiskCase = {
      caseId: randomUUID(),
      userId: dto.userId,
      type: dto.type,
      severity: dto.severity,
      status: 'open',
      reason: dto.reason,
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.caseModel.create(item);
    return this.toCase(created.toObject());
  }

  async updateStatus(caseId: string, dto: UpdateKycRiskCaseStatusDto) {
    const item = await this.caseModel
      .findOneAndUpdate(
        { caseId },
        {
          status: dto.status,
          resolutionNotes: dto.resolutionNotes,
          updatedAt: new Date().toISOString(),
        },
        { new: true },
      )
      .lean();

    if (!item) {
      throw new NotFoundException(`KYC/Risk case not found: ${caseId}`);
    }

    return this.toCase(item);
  }

  async listRules() {
    await this.ensureSeedData();
    const items = await this.ruleModel.find().sort({ code: 1 }).lean();
    return items.map((item) => this.toRule(item));
  }

  async listRiskProfiles() {
    await this.ensureSeedData();
    const items = await this.profileModel.find().sort({ riskScore: -1 }).lean();
    return items.map((item) => this.toProfile(item));
  }

  async getRiskProfile(userId: string) {
    await this.ensureSeedData();
    const profile = await this.profileModel.findOne({ userId }).lean();
    if (!profile) {
      throw new NotFoundException(`User risk profile not found: ${userId}`);
    }
    return this.toProfile(profile);
  }

  async assessUserRisk(dto: AssessUserRiskDto) {
    const now = new Date().toISOString();
    const kycImpact = this.getKycRiskImpact(dto.kycLevel);
    const riskScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(dto.transactionRiskScore * 0.4 + dto.securityRiskScore * 0.25 + dto.externalRiskScore * 0.25 + kycImpact),
      ),
    );
    const riskLevel = this.getRiskLevel(riskScore);
    const status = riskLevel === 'red' ? 'restricted' : riskLevel === 'orange' ? 'monitoring' : 'active';
    const signals: UserRiskSignal[] = [
      this.createSignal('kyc', `Nivel KYC: ${dto.kycLevel}`, kycImpact, kycImpact >= 20 ? 'high' : 'medium'),
      this.createSignal('transaction_behavior', 'Riesgo por comportamiento transaccional', dto.transactionRiskScore, this.getSeverity(dto.transactionRiskScore)),
      this.createSignal('security_event', 'Riesgo por eventos de seguridad', dto.securityRiskScore, this.getSeverity(dto.securityRiskScore)),
      this.createSignal('external_osint', 'Riesgo por fuentes externas y OSINT', dto.externalRiskScore, this.getSeverity(dto.externalRiskScore)),
    ];

    const profile: UserRiskProfile = {
      userId: dto.userId,
      kycLevel: dto.kycLevel,
      riskScore,
      riskLevel,
      status,
      reason: dto.reason || this.getRiskReason(riskLevel),
      signals,
      lastAssessmentAt: now,
      updatedAt: now,
    };

    const saved = await this.profileModel
      .findOneAndUpdate({ userId: dto.userId }, profile, { new: true, upsert: true, setDefaultsOnInsert: true })
      .lean();

    return this.toProfile(saved);
  }

  riskMatrix() {
    return [
      { level: 'green', label: 'Verde', range: '0-35', action: 'Operación normal con monitoreo estándar.' },
      { level: 'orange', label: 'Naranja', range: '36-70', action: 'Monitoreo reforzado y posible revisión manual.' },
      { level: 'red', label: 'Rojo', range: '71-100', action: 'Restricción operativa, escalamiento AML y revisión de seguridad.' },
    ];
  }

  private async ensureSeedData() {
    if (process.env.KYC_RISK_SEED_DEMO_DATA !== 'true') {
      return;
    }

    const [rulesCount, profilesCount] = await Promise.all([
      this.ruleModel.estimatedDocumentCount(),
      this.profileModel.estimatedDocumentCount(),
    ]);

    const writes: Promise<unknown>[] = [];
    if (rulesCount === 0) {
      writes.push(this.ruleModel.insertMany(this.initialRules()));
    }
    if (profilesCount === 0) {
      writes.push(this.profileModel.insertMany(this.initialProfiles()));
    }

    if (writes.length > 0) {
      await Promise.all(writes);
    }
  }

  private initialProfiles(): UserRiskProfile[] {
    const now = new Date().toISOString();
    return [
      {
        userId: 'USR-1001',
        kycLevel: 'level_3',
        riskScore: 18,
        riskLevel: 'green',
        status: 'active',
        reason: 'KYC avanzado completo y comportamiento transaccional estable.',
        signals: [
          this.createSignal('kyc', 'KYC nivel 3 verificado', -12, 'low'),
          this.createSignal('transaction_behavior', 'Movimientos dentro del patrón esperado', 8, 'low'),
        ],
        lastAssessmentAt: now,
        updatedAt: now,
      },
      {
        userId: 'USR-2044',
        kycLevel: 'level_1',
        riskScore: 58,
        riskLevel: 'orange',
        status: 'monitoring',
        reason: 'Actividad superior al perfil KYC y señales externas pendientes de revisión.',
        signals: [
          this.createSignal('kyc', 'KYC básico para volumen medio', 18, 'medium'),
          this.createSignal('external_osint', 'Coincidencia parcial en fuente externa', 20, 'medium'),
          this.createSignal('transaction_behavior', 'Frecuencia inusual de operaciones', 20, 'medium'),
        ],
        lastAssessmentAt: now,
        updatedAt: now,
      },
      {
        userId: 'USR-3099',
        kycLevel: 'none',
        riskScore: 86,
        riskLevel: 'red',
        status: 'restricted',
        reason: 'Intentos de acceso anómalos y exposición blockchain de alto riesgo.',
        signals: [
          this.createSignal('security_event', 'Intentos de acceso anómalos', 30, 'high'),
          this.createSignal('blockchain_analytics', 'Wallet relacionada con flujo de alto riesgo', 34, 'critical'),
          this.createSignal('kyc', 'Usuario sin KYC', 22, 'high'),
        ],
        lastAssessmentAt: now,
        updatedAt: now,
      },
    ];
  }

  private initialRules(): KycRiskRule[] {
    return [
      {
        code: 'KYC_DOC_PENDING',
        name: 'Documento pendiente',
        category: 'kyc',
        severity: 'medium',
        description: 'El usuario debe completar validación documental antes de operar.',
        enabled: true,
      },
      {
        code: 'AML_MANUAL_REVIEW',
        name: 'Revisión AML manual',
        category: 'aml',
        severity: 'high',
        description: 'Actividad o perfil requiere revisión del equipo de cumplimiento.',
        enabled: true,
      },
      {
        code: 'RISK_TRANSACTION_PATTERN',
        name: 'Patrón transaccional inusual',
        category: 'risk',
        severity: 'high',
        description: 'Movimientos fuera del patrón esperado del usuario o región.',
        enabled: true,
      },
    ];
  }

  private getRiskLevel(score: number): UserRiskLevel {
    if (score >= 71) return 'red';
    if (score >= 36) return 'orange';
    return 'green';
  }

  private getSeverity(score: number) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private getKycRiskImpact(kycLevel: AssessUserRiskDto['kycLevel']) {
    const map: Record<AssessUserRiskDto['kycLevel'], number> = {
      none: 28,
      level_1: 18,
      level_2: 8,
      level_3: -8,
      institutional: -10,
    };
    return map[kycLevel];
  }

  private getRiskReason(level: UserRiskLevel) {
    if (level === 'red') return 'Perfil requiere restricción y revisión inmediata.';
    if (level === 'orange') return 'Perfil requiere monitoreo reforzado.';
    return 'Perfil operativo dentro del rango esperado.';
  }

  private createSignal(
    source: UserRiskSignal['source'],
    label: string,
    scoreImpact: number,
    severity: UserRiskSignal['severity'],
  ): UserRiskSignal {
    return {
      source,
      label,
      scoreImpact,
      severity,
      observedAt: new Date().toISOString(),
    };
  }

  private toCase(item: KycRiskCaseEntity): KycRiskCase {
    return {
      caseId: item.caseId,
      userId: item.userId,
      type: item.type,
      severity: item.severity,
      status: item.status,
      reason: item.reason,
      notes: item.notes,
      resolutionNotes: item.resolutionNotes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toRule(item: KycRiskRuleEntity): KycRiskRule {
    return {
      code: item.code,
      name: item.name,
      category: item.category,
      severity: item.severity,
      description: item.description,
      enabled: item.enabled,
    };
  }

  private toProfile(item: UserRiskProfileEntity): UserRiskProfile {
    return {
      userId: item.userId,
      kycLevel: item.kycLevel,
      riskScore: item.riskScore,
      riskLevel: item.riskLevel,
      status: item.status,
      reason: item.reason,
      signals: item.signals,
      lastAssessmentAt: item.lastAssessmentAt,
      updatedAt: item.updatedAt,
    };
  }
}

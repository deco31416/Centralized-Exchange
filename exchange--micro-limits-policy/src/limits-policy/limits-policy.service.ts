import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  KycLevel,
  LimitAssetType,
  LimitDecision,
  LimitEvaluationInput,
  LimitPrecheckInput,
  LimitPolicyChange,
  LimitPolicyChangeRequest,
  LimitPolicyRequestStatus,
  LimitOperation,
  LimitPolicyRule,
  RiskLevel,
  ReviewLimitPolicyRequestInput,
  UpdateLimitPolicyRuleInput,
} from './limits-policy.interfaces';
import { KycRiskClientService } from './kyc-risk-client.service';
import { defaultLimitPolicyRules } from './limit-policy-default-rules';
import { LimitPolicyChangeRequestEntity } from './schemas/limit-policy-change-request.schema';
import { LimitPolicyChangeEntity } from './schemas/limit-policy-change.schema';
import { LimitPolicyRuleEntity } from './schemas/limit-policy-rule.schema';

@Injectable()
export class LimitsPolicyService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(LimitPolicyRuleEntity.name)
    private readonly ruleModel: Model<LimitPolicyRuleEntity>,
    @InjectModel(LimitPolicyChangeEntity.name)
    private readonly changeModel: Model<LimitPolicyChangeEntity>,
    @InjectModel(LimitPolicyChangeRequestEntity.name)
    private readonly requestModel: Model<LimitPolicyChangeRequestEntity>,
    private readonly kycRiskClient: KycRiskClientService,
  ) {}

  async overview() {
    const rules = await this.getRules();
    const pendingRequests = await this.requestModel.countDocuments({ status: 'PENDING' });
    const enabled = rules.filter((rule) => rule.enabled);
    const approval = enabled.filter((rule) => rule.requiresApproval);

    return {
      totalRules: rules.length,
      enabledRules: enabled.length,
      approvalRules: approval.length,
      fiatRules: enabled.filter((rule) => rule.assetType === 'FIAT').length,
      cryptoRules: enabled.filter((rule) => rule.assetType === 'CRYPTO').length,
      riskRules: enabled.filter((rule) => rule.scope === 'RISK_LEVEL').length,
      versionedRules: enabled.filter((rule) => rule.version > 1).length,
      pendingRequests,
      source: 'mongo-persistent',
      updatedAt: new Date().toISOString(),
      nextStep:
        'Conectar ejecucion real contra ledger o custodia solo despues de aprobacion maker-checker.',
    };
  }

  async listRules() {
    const rules = await this.getRules();

    return {
      items: [...rules].sort((a, b) => b.priority - a.priority),
      count: rules.length,
      source: 'mongo-persistent',
      updatedAt: new Date().toISOString(),
    };
  }

  async getRule(id: string) {
    await this.ensureSeedData();
    const rule = await this.ruleModel.findOne({ id }).lean();
    return rule ? this.toRule(rule) : null;
  }

  async listChanges(limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const changes = await this.changeModel
      .find()
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();

    return {
      items: changes.map((change) => this.toChange(change)),
      count: changes.length,
      source: 'mongo-persistent',
      updatedAt: new Date().toISOString(),
    };
  }

  async listRequests(status = 'PENDING', limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const normalizedStatus = status.trim().toUpperCase();
    const query: { status?: LimitPolicyRequestStatus } = {};
    if (normalizedStatus !== 'ALL') {
      query.status = this.normalizeRequestStatus(normalizedStatus);
    }
    const requests = await this.requestModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();

    return {
      items: requests.map((request) => this.toRequest(request)),
      count: requests.length,
      source: 'mongo-persistent',
      updatedAt: new Date().toISOString(),
    };
  }

  async updateRule(
    id: string,
    input: UpdateLimitPolicyRuleInput,
    actor = 'admin-gateway',
  ) {
    return this.createRuleChangeRequest(id, input, actor);
  }

  async createRuleChangeRequest(
    id: string,
    input: UpdateLimitPolicyRuleInput,
    actor = 'admin-gateway',
  ) {
    await this.ensureSeedData();
    const rule = await this.ruleModel.findOne({ id });
    if (!rule) {
      throw new NotFoundException(`Limit policy rule not found: ${id}`);
    }

    const reason = input.reason?.trim();
    if (!reason || reason.length < 8) {
      throw new BadRequestException('A reason with at least 8 characters is required');
    }

    const before = this.toRule(rule);
    const patch = this.buildPatch(input);
    this.validatePatch({ ...before, ...patch });

    const pending = await this.requestModel.findOne({
      ruleId: id,
      status: 'PENDING',
    });
    if (pending) {
      throw new ConflictException(`There is already a pending request for rule: ${id}`);
    }

    const request = await this.requestModel.create({
      id: `limit-request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ruleId: rule.id,
      action: 'UPDATE',
      status: 'PENDING',
      requestedBy: input.changedBy?.trim() || actor,
      requestReason: reason,
      patch,
      before,
      createdAt: new Date().toISOString(),
    });

    return {
      request: this.toRequest(request),
      auditRequired: true,
      makerCheckerRequired: true,
      message: 'Limit policy change request created and waiting for approval.',
    };
  }

  async approveRequest(
    id: string,
    input: ReviewLimitPolicyRequestInput,
    actor = 'admin-gateway',
  ) {
    const request = await this.requestModel.findOne({ id, status: 'PENDING' });
    if (!request) {
      throw new NotFoundException(`Pending limit policy request not found: ${id}`);
    }

    const reviewer = input.reviewedBy?.trim() || actor;
    if (reviewer === request.requestedBy) {
      throw new BadRequestException('Maker-checker requires a different reviewer');
    }

    const reviewReason = this.normalizeReviewReason(input.reason);
    const rule = await this.ruleModel.findOne({ id: request.ruleId });
    if (!rule) {
      throw new NotFoundException(`Limit policy rule not found: ${request.ruleId}`);
    }

    const before = this.toRule(rule);
    if (before.version !== request.before.version) {
      throw new ConflictException('Rule version changed after this request was created');
    }

    const patch = request.patch as Partial<LimitPolicyRule>;
    this.validatePatch({ ...before, ...patch });

    Object.assign(rule, patch, {
      version: (rule.version ?? 1) + 1,
      source: 'admin',
      lastChangedBy: reviewer,
      lastChangeReason: `${request.requestReason} | Aprobado: ${reviewReason}`,
      updatedAt: new Date().toISOString(),
    });

    await rule.save();
    const after = this.toRule(rule);
    const change = await this.changeModel.create({
      id: `limit-change-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ruleId: rule.id,
      version: after.version,
      action: 'UPDATE',
      changedBy: reviewer,
      reason: `${request.requestReason} | Aprobado: ${reviewReason}`,
      before,
      after,
      createdAt: new Date().toISOString(),
    });

    request.status = 'APPROVED';
    request.reviewedBy = reviewer;
    request.reviewReason = reviewReason;
    request.appliedChangeId = change.id;
    request.reviewedAt = new Date().toISOString();
    await request.save();

    return {
      rule: after,
      change: this.toChange(change),
      request: this.toRequest(request),
      auditRequired: true,
      makerCheckerRequired: true,
      message: 'Limit policy request approved and applied.',
    };
  }

  async rejectRequest(
    id: string,
    input: ReviewLimitPolicyRequestInput,
    actor = 'admin-gateway',
  ) {
    const request = await this.requestModel.findOne({ id, status: 'PENDING' });
    if (!request) {
      throw new NotFoundException(`Pending limit policy request not found: ${id}`);
    }

    const reviewer = input.reviewedBy?.trim() || actor;
    const reviewReason = this.normalizeReviewReason(input.reason);

    request.status = 'REJECTED';
    request.reviewedBy = reviewer;
    request.reviewReason = reviewReason;
    request.reviewedAt = new Date().toISOString();
    await request.save();

    return {
      request: this.toRequest(request),
      auditRequired: true,
      makerCheckerRequired: true,
      message: 'Limit policy request rejected.',
    };
  }

  async evaluate(input: LimitEvaluationInput) {
    const rules = await this.getRules();
    const normalized = this.normalize(input);
    const amount = this.toAmount(input.amount);
    const matchingRules = rules
      .filter((rule) => rule.enabled)
      .filter((rule) => this.matches(rule, normalized))
      .sort((a, b) => b.priority - a.priority);
    const selectedRule = matchingRules[0] ?? null;

    if (!selectedRule) {
      return this.decision('REVIEW', null, normalized, amount, [
        'No existe una regla específica para esta combinación.',
        'Enviar a revisión operativa antes de afectar ledger o custodia.',
      ]);
    }

    if (normalized.riskLevel === 'RED') {
      return this.decision('BLOCK', selectedRule, normalized, amount, [
        'Perfil de riesgo rojo restringe operaciones.',
      ]);
    }

    if (amount === null) {
      return this.decision('REVIEW', selectedRule, normalized, amount, [
        'Monto no informado o inválido.',
      ]);
    }

    if (amount < selectedRule.minAmount) {
      return this.decision('BLOCK', selectedRule, normalized, amount, [
        `Monto menor al mínimo permitido de ${selectedRule.minAmount}.`,
      ]);
    }

    if (amount > selectedRule.maxAmount) {
      return this.decision('BLOCK', selectedRule, normalized, amount, [
        `Monto excede el máximo por operación de ${selectedRule.maxAmount}.`,
      ]);
    }

    if (selectedRule.requiresApproval) {
      return this.decision('REVIEW', selectedRule, normalized, amount, [
        'La regla permite la operación solo con aprobación administrativa.',
      ]);
    }

    return this.decision('ALLOW', selectedRule, normalized, amount, [
      'La operación entra dentro de la política actual.',
    ]);
  }

  async precheck(input: LimitPrecheckInput) {
    const base = await this.evaluate({
      ...input,
      amount: this.stringifyAmount(input.amount),
    });
    const amount = this.toAmount(input.amount);
    const dailyUsed = this.toOptionalAmount(input.dailyUsed, 0);
    const monthlyUsed = this.toOptionalAmount(input.monthlyUsed, 0);
    const availableBalance = this.toOptionalAmount(input.availableBalance);
    const custodyAvailable = this.toOptionalAmount(input.custodyAvailable);
    const declaredRiskScore = this.toOptionalAmount(input.riskScore);
    const kycRiskProfile = await this.kycRiskClient.getProfileDecision(input.userId);
    const riskScore = declaredRiskScore ?? this.toOptionalAmount(kycRiskProfile.profile?.riskScore);
    const sourceService = this.normalizeServiceName(input.sourceService);
    const custodyProviderStatus = this.normalizeString(input.custodyProviderStatus, 'UNKNOWN');
    const reasons = [...base.reasons];
    const downstreamChecks: Array<{
      name: string;
      status: 'PASS' | 'REVIEW' | 'FAIL' | 'SKIP';
      message: string;
    }> = [];
    let decision = base.decision;

    const fail = (name: string, message: string) => {
      downstreamChecks.push({ name, status: 'FAIL', message });
      reasons.push(message);
      decision = 'BLOCK';
    };
    const review = (name: string, message: string) => {
      downstreamChecks.push({ name, status: 'REVIEW', message });
      reasons.push(message);
      if (decision !== 'BLOCK') decision = 'REVIEW';
    };
    const pass = (name: string, message: string) => {
      downstreamChecks.push({ name, status: 'PASS', message });
    };
    const skip = (name: string, message: string) => {
      downstreamChecks.push({ name, status: 'SKIP', message });
    };

    if (kycRiskProfile.status === 'FAIL') {
      fail('kyc-risk-profile', kycRiskProfile.message);
    } else if (kycRiskProfile.status === 'REVIEW') {
      review('kyc-risk-profile', kycRiskProfile.message);
    } else if (kycRiskProfile.status === 'PASS') {
      pass('kyc-risk-profile', kycRiskProfile.message);
    } else {
      skip('kyc-risk-profile', kycRiskProfile.message);
    }

    if (base.rule && amount !== null) {
      if (dailyUsed !== null && amount + dailyUsed > base.rule.dailyLimit) {
        fail(
          'daily-limit',
          `Uso diario proyectado ${amount + dailyUsed} excede límite ${base.rule.dailyLimit}.`,
        );
      } else {
        pass('daily-limit', 'Uso diario dentro de la política aprobada.');
      }

      if (monthlyUsed !== null && amount + monthlyUsed > base.rule.monthlyLimit) {
        fail(
          'monthly-limit',
          `Uso mensual proyectado ${amount + monthlyUsed} excede límite ${base.rule.monthlyLimit}.`,
        );
      } else {
        pass('monthly-limit', 'Uso mensual dentro de la política aprobada.');
      }
    } else {
      skip('period-limits', 'No se puede evaluar uso periódico sin regla y monto válidos.');
    }

    if (this.requiresBalanceCheck(base.input.operation)) {
      if (availableBalance === null || amount === null) {
        review('ledger-balance', 'Saldo ledger no informado; requiere revisión antes de ejecutar.');
      } else if (availableBalance < amount) {
        fail('ledger-balance', `Saldo disponible ${availableBalance} menor al monto ${amount}.`);
      } else {
        pass('ledger-balance', 'Saldo ledger suficiente para la operación.');
      }
    } else {
      skip('ledger-balance', 'La operación no requiere débito de saldo del usuario.');
    }

    if (this.requiresCustodyLiquidityCheck(base.input.operation)) {
      if (!this.isHealthyCustodyStatus(custodyProviderStatus)) {
        review(
          'custody-provider',
          `Estado de custodia/proveedor ${custodyProviderStatus}; requiere revisión operativa.`,
        );
      } else {
        pass('custody-provider', 'Custodia/proveedor reporta estado operativo.');
      }

      if (custodyAvailable === null || amount === null) {
        review('custody-liquidity', 'Liquidez de custodia no informada; requiere revisión.');
      } else if (custodyAvailable < amount) {
        fail('custody-liquidity', `Liquidez de custodia ${custodyAvailable} menor al monto ${amount}.`);
      } else {
        pass('custody-liquidity', 'Liquidez de custodia suficiente.');
      }
    } else {
      skip('custody-liquidity', 'La operación no requiere salida desde custodia.');
    }

    if (riskScore !== null) {
      if (riskScore >= 85) {
        fail('risk-score', `Score de riesgo ${riskScore} requiere bloqueo operativo.`);
      } else if (riskScore >= 65) {
        review('risk-score', `Score de riesgo ${riskScore} requiere revisión operativa.`);
      } else {
        pass('risk-score', 'Score de riesgo dentro del rango operativo.');
      }
    } else {
      skip('risk-score', 'Score de riesgo no informado; se usó riskLevel declarado.');
    }

    const allowed = decision === 'ALLOW';
    const requiresApproval = decision === 'REVIEW' || base.requiresApproval;

    return {
      decision,
      allowed,
      canExecute: allowed,
      requiresApproval,
      holdRecommended: this.requiresBalanceCheck(base.input.operation) && decision !== 'BLOCK',
      auditRequired: true,
      sourceService,
      operationId: input.operationId?.trim() || null,
      idempotencyKey: input.idempotencyKey?.trim() || null,
      userId: input.userId?.trim() || null,
      rule: base.rule,
      policyVersion: base.rule?.version ?? null,
      input: {
        ...base.input,
        dailyUsed,
        monthlyUsed,
        availableBalance,
        custodyAvailable,
        custodyProviderStatus,
        riskScore,
        kycRiskProfile: kycRiskProfile.profile ?? null,
      },
      downstreamChecks,
      reasons,
      nextAction: this.nextAction(decision),
      evaluatedAt: new Date().toISOString(),
    };
  }

  private async getRules(): Promise<LimitPolicyRule[]> {
    await this.ensureSeedData();
    const rules = await this.ruleModel.find().lean();
    return rules.map((rule) => this.toRule(rule));
  }

  private async ensureSeedData() {
    if (this.configService.get<string>('LIMITS_POLICY_SEED_DEFAULTS') !== 'true') {
      return;
    }

    for (const rule of defaultLimitPolicyRules) {
      await this.ruleModel.updateOne(
        { id: rule.id },
        { $setOnInsert: rule },
        { upsert: true },
      );
    }
  }

  private normalize(input: LimitEvaluationInput) {
    return {
      operation: this.normalizeEnum<LimitOperation>(input.operation, 'TRANSFER'),
      assetType: this.normalizeEnum<LimitAssetType>(input.assetType, 'ANY'),
      product: this.normalizeString(input.product, 'ALL'),
      country: this.normalizeString(input.country),
      currency: this.normalizeString(input.currency),
      kycLevel: this.normalizeEnum<KycLevel>(input.kycLevel, 'ANY'),
      riskLevel: this.normalizeEnum<RiskLevel>(input.riskLevel, 'ANY'),
    };
  }

  private matches(
    rule: LimitPolicyRule,
    input: ReturnType<LimitsPolicyService['normalize']>,
  ) {
    if (rule.operation !== input.operation && rule.id !== 'GLOBAL-RED-RISK-BLOCK') return false;
    if (rule.assetType !== 'ANY' && rule.assetType !== input.assetType) return false;
    if (rule.product !== 'ALL' && rule.product !== input.product) return false;
    if (rule.country && rule.country !== input.country) return false;
    if (rule.currency && rule.currency !== input.currency) return false;
    if (rule.kycLevel !== 'ANY' && rule.kycLevel !== input.kycLevel) return false;
    if (rule.riskLevel !== 'ANY' && rule.riskLevel !== input.riskLevel) return false;
    return true;
  }

  private decision(
    decision: LimitDecision,
    rule: LimitPolicyRule | null,
    input: ReturnType<LimitsPolicyService['normalize']>,
    amount: number | null,
    reasons: string[],
  ) {
    return {
      decision,
      allowed: decision === 'ALLOW',
      requiresApproval: decision === 'REVIEW',
      rule,
      input: { ...input, amount },
      reasons,
      auditRequired: true,
      evaluatedAt: new Date().toISOString(),
    };
  }

  private toRule(item: LimitPolicyRuleEntity): LimitPolicyRule {
    return {
      id: item.id,
      name: item.name,
      scope: item.scope,
      operation: item.operation,
      assetType: item.assetType,
      product: item.product,
      country: item.country,
      currency: item.currency,
      kycLevel: item.kycLevel,
      riskLevel: item.riskLevel,
      minAmount: item.minAmount,
      maxAmount: item.maxAmount,
      dailyLimit: item.dailyLimit,
      monthlyLimit: item.monthlyLimit,
      requiresApproval: item.requiresApproval,
      enabled: item.enabled,
      priority: item.priority,
      version: item.version ?? 1,
      source: item.source,
      lastChangedBy: item.lastChangedBy,
      lastChangeReason: item.lastChangeReason,
      updatedAt: item.updatedAt,
    };
  }

  private toChange(item: LimitPolicyChangeEntity): LimitPolicyChange {
    return {
      id: item.id,
      ruleId: item.ruleId,
      version: item.version,
      action: item.action,
      changedBy: item.changedBy,
      reason: item.reason,
      before: item.before,
      after: item.after,
      createdAt: item.createdAt,
    };
  }

  private toRequest(item: LimitPolicyChangeRequestEntity): LimitPolicyChangeRequest {
    return {
      id: item.id,
      ruleId: item.ruleId,
      action: item.action,
      status: item.status,
      requestedBy: item.requestedBy,
      requestReason: item.requestReason,
      patch: item.patch,
      before: item.before,
      reviewedBy: item.reviewedBy,
      reviewReason: item.reviewReason,
      appliedChangeId: item.appliedChangeId,
      createdAt: item.createdAt,
      reviewedAt: item.reviewedAt,
    };
  }

  private buildPatch(input: UpdateLimitPolicyRuleInput) {
    const patch: Partial<LimitPolicyRule> = {};
    const booleanFields = ['enabled', 'requiresApproval'] as const;
    const numericFields = [
      'minAmount',
      'maxAmount',
      'dailyLimit',
      'monthlyLimit',
      'priority',
    ] as const;

    for (const field of booleanFields) {
      if (typeof input[field] === 'boolean') {
        patch[field] = input[field];
      }
    }

    for (const field of numericFields) {
      if (input[field] !== undefined) {
        const value = Number(input[field]);
        if (!Number.isFinite(value) || value < 0) {
          throw new BadRequestException(`${field} must be a non-negative number`);
        }
        patch[field] = value;
      }
    }

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('No editable fields were provided');
    }

    return patch;
  }

  private validatePatch(rule: LimitPolicyRule) {
    if (rule.minAmount > rule.maxAmount) {
      throw new BadRequestException('minAmount cannot be greater than maxAmount');
    }
    if (rule.maxAmount > rule.dailyLimit) {
      throw new BadRequestException('maxAmount cannot be greater than dailyLimit');
    }
    if (rule.dailyLimit > rule.monthlyLimit) {
      throw new BadRequestException('dailyLimit cannot be greater than monthlyLimit');
    }
  }

  private normalizeReviewReason(value: string | undefined) {
    const reason = value?.trim();
    if (!reason || reason.length < 6) {
      throw new BadRequestException('A review reason with at least 6 characters is required');
    }
    return reason;
  }

  private normalizeRequestStatus(value: string) {
    if (value === 'PENDING' || value === 'APPROVED' || value === 'REJECTED') {
      return value;
    }
    throw new BadRequestException(`Unsupported request status: ${value}`);
  }

  private normalizeEnum<T extends string>(value: string | undefined, fallback: T): T {
    const normalized = this.normalizeString(value);
    return (normalized || fallback) as T;
  }

  private normalizeString(value: string | undefined, fallback = '') {
    const normalized = value?.trim().toUpperCase();
    return normalized && normalized.length > 0 ? normalized : fallback;
  }

  private toAmount(value: string | number | undefined) {
    if (value === undefined || value === null || value === '') return null;
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : null;
  }

  private toOptionalAmount(value: string | number | undefined, fallback: number | null = null) {
    if (value === undefined || value === null || value === '') return fallback;
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : fallback;
  }

  private stringifyAmount(value: string | number | undefined) {
    if (value === undefined || value === null) return undefined;
    return String(value);
  }

  private normalizeServiceName(value: string | undefined) {
    const normalized = value?.trim();
    return normalized && normalized.length > 0 ? normalized : 'unknown-service';
  }

  private requiresBalanceCheck(operation: LimitOperation) {
    return ['WITHDRAW', 'SELL', 'CONVERT', 'P2P', 'REMITTANCE', 'PAYMENT', 'TRANSFER'].includes(operation);
  }

  private requiresCustodyLiquidityCheck(operation: LimitOperation) {
    return ['WITHDRAW', 'SELL', 'REMITTANCE', 'PAYMENT'].includes(operation);
  }

  private isHealthyCustodyStatus(value: string) {
    return ['AVAILABLE', 'HEALTHY', 'ONLINE', 'OK'].includes(value);
  }

  private nextAction(decision: LimitDecision) {
    if (decision === 'ALLOW') return 'EXECUTE_WITH_AUDIT';
    if (decision === 'REVIEW') return 'WAIT_FOR_ADMIN_APPROVAL';
    return 'DO_NOT_EXECUTE';
  }
}

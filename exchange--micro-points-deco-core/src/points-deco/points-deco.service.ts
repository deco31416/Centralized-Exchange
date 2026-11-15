import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { defaultDecoPoints } from './points-deco-default-data';
import { PointQuoteInput, PointService } from './points-deco.interfaces';
import { PointsDecoLedgerService } from './points-deco-ledger.service';
import { PointsDecoLimitsPolicyService } from './points-deco-limits-policy.service';
import { buildPointOrderAuditEvent } from './points-deco-order-audit';
import { PointsDecoPricingService } from './points-deco-pricing.service';
import { DecoPointEntity } from './schemas/deco-point.schema';
import { PointDisputeEntity } from './schemas/point-dispute.schema';
import { PointOrderEntity } from './schemas/point-order.schema';

@Injectable()
export class PointsDecoService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(DecoPointEntity.name)
    private readonly pointModel: Model<DecoPointEntity>,
    @InjectModel(PointOrderEntity.name)
    private readonly orderModel: Model<PointOrderEntity>,
    @InjectModel(PointDisputeEntity.name)
    private readonly disputeModel: Model<PointDisputeEntity>,
    private readonly limitsPolicyService: PointsDecoLimitsPolicyService,
    private readonly ledgerService: PointsDecoLedgerService,
    private readonly pricingService: PointsDecoPricingService,
  ) {}

  async overview() {
    const [points, orders, disputes] = await Promise.all([
      this.safeListPoints(),
      this.safeListOrders(),
      this.safeListDisputes(),
    ]);

    return {
      totalPoints: points.length,
      activePoints: points.filter((point) => point.status === 'active').length,
      commercePoints: points.filter((point) => point.type === 'commerce').length,
      cashierPoints: points.filter((point) => point.type === 'cashier').length,
      openOrders: orders.filter((order) =>
        ['created', 'accepted', 'rate_locked', 'location_revealed'].includes(order.status),
      ).length,
      disputedOrders: disputes.filter((dispute) => dispute.status !== 'resolved').length,
      line: 'Puntos Deco',
      complements: [
        'P2P',
        'Remesas',
        'Bolsillito',
        'Custodia',
        'Ledger',
        'Pricing',
        'Caja del Punto',
      ],
      source: 'mongo-with-demo-fallback',
      updatedAt: new Date().toISOString(),
      nextStep:
        'Completar conciliacion fiat productiva, GPS protegido y reportes fiscales exportables.',
    };
  }

  async listPoints(query: Record<string, string | undefined>) {
    const points = await this.safeListPoints();
    const country = this.normalize(query.country);
    const service = this.normalize(query.service).toLowerCase() as PointService | '';

    const items = points.filter((point) => {
      if (country && point.country !== country) return false;
      if (service && !point.allowedServices.includes(service)) return false;
      return true;
    });

    return {
      items,
      count: items.length,
      locationPolicy:
        'Solo ubicacion aproximada publica. Direccion exacta despues de orden aceptada.',
      source: 'mongo-with-demo-fallback',
      updatedAt: new Date().toISOString(),
    };
  }

  async nearby(query: Record<string, string | undefined>) {
    const points = await this.safeListPoints();
    const country = this.normalize(query.country, 'CO');

    return {
      items: points
        .filter((point) => point.country === country && point.status === 'active')
        .map((point) => ({
          id: point.id,
          type: point.type,
          tradeName: point.tradeName,
          country: point.country,
          city: point.city,
          zone: point.zone,
          distanceLabel: 'Distancia aproximada',
          liquidityRangeLabel: point.liquidityRangeLabel,
          scheduleLabel: point.scheduleLabel,
          rating: point.rating,
          allowedServices: point.allowedServices,
        })),
      count: points.length,
      privacy:
        'La direccion exacta se revela solo cuando ambas partes aceptan la orden.',
      updatedAt: new Date().toISOString(),
    };
  }

  async quote(input: PointQuoteInput) {
    const amount = this.toAmount(input.amountOrigin);
    const originCurrency = this.normalize(input.originCurrency, 'COP');
    const destinationCurrency = this.normalize(input.destinationCurrency, 'USDT');
    const type = (input.type || 'cash_in') as PointService;
    const pricing = await this.pricingService.quote({
      type,
      originCurrency,
      destinationCurrency,
    });
    const rate = pricing.rate;
    const decoFee = this.round(amount * 0.012);
    const pointFee = this.round(amount * 0.004);
    const amountDestinationEstimated = this.round((amount - decoFee - pointFee) / rate);

    return {
      type,
      originCurrency,
      destinationCurrency,
      amountOrigin: amount,
      rate,
      decoFee,
      pointFee,
      amountDestinationEstimated,
      rateLockSeconds: 600,
      requiresKyc: true,
      requiresRiskCheck: true,
      requiresLedgerHold: ['cash_out', 'remittance'].includes(type),
      routeMode: 'points-deco-primary-with-domain-complements',
      complements: ['pricing', 'limits', 'kyc-risk', 'ledger', 'audit-fiat'],
      pricingSource: pricing.source,
      pricingOperation: pricing.operation,
      pricingCorridor: pricing.corridor,
      pricingMethod: pricing.method,
      pricingWarning: pricing.warning,
      quotedAt: new Date().toISOString(),
    };
  }

  async createOrder(input: PointQuoteInput & { userId?: string; pointId?: string }) {
    const quote = await this.quote(input);
    const id = `pd-${Date.now()}`;
    const limitsPrecheck = await this.limitsPolicyService.precheck({
      ...input,
      quote,
      operationId: id,
    });

    if (limitsPrecheck.decision === 'BLOCK') {
      throw new ForbiddenException({
        message: 'Puntos Deco order blocked by limits policy',
        limitsPrecheck,
      });
    }

    const order = {
      id,
      type: quote.type,
      userId: input.userId || 'pending-user',
      pointId: input.pointId,
      originCurrency: quote.originCurrency,
      destinationCurrency: quote.destinationCurrency,
      amountOrigin: quote.amountOrigin,
      amountDestinationEstimated: quote.amountDestinationEstimated,
      rate: quote.rate,
      decoFee: quote.decoFee,
      pointFee: quote.pointFee,
      pricingSource: quote.pricingSource,
      pricingOperation: quote.pricingOperation,
      pricingCorridor: quote.pricingCorridor,
      pricingMethod: quote.pricingMethod,
      pricingWarning: quote.pricingWarning,
      status: 'created' as const,
      rateLockedUntil: new Date(Date.now() + quote.rateLockSeconds * 1000).toISOString(),
      limitsDecision: limitsPrecheck.decision,
      limitsRequiresApproval: limitsPrecheck.requiresApproval,
      limitsPolicyVersion: limitsPrecheck.policyVersion,
      limitsNextAction: limitsPrecheck.nextAction,
      ...this.ledgerService.buildHoldShape({
        id,
        type: quote.type,
        originCurrency: quote.originCurrency,
        amountOrigin: quote.amountOrigin,
      }),
      statusChangedAt: new Date().toISOString(),
      auditTrail: [
        buildPointOrderAuditEvent('created', {
          actorId: 'system',
          actorRole: 'system',
          reason: 'Order created after limits precheck',
        }),
      ],
    };

    try {
      await this.orderModel.create(order);
      const ledgerHold = await this.ledgerService.holdOrder(order);
      const ledgerPatch = this.ledgerPatchFromResult(ledgerHold);

      if (Object.keys(ledgerPatch).length > 0) {
        await this.orderModel.updateOne(
          { id },
          {
            $set: ledgerPatch,
            $push: {
              auditTrail: buildPointOrderAuditEvent('ledger_hold', {
                actorId: 'wallet-ledger-core',
                actorRole: 'microservice',
                reason: `Ledger hold status: ${ledgerHold.status}`,
              }),
            },
          },
        );
      }

      return {
        ...order,
        ...ledgerPatch,
        limitsPrecheck,
        ledgerHold,
        source: 'mongo-persistent',
      };
    } catch {
      return {
        ...order,
        limitsPrecheck,
        source: 'demo-fallback',
        warning:
          'Order not persisted. Configure MongoDB runtime before economic operations.',
      };
    }
  }

  async listOrders(query: Record<string, string | undefined>) {
    const orders = await this.safeListOrders();
    const status = this.normalize(query.status).toLowerCase();

    const items = status
      ? orders.filter((order) => order.status === status)
      : orders;

    return {
      items,
      count: items.length,
      source: 'mongo-with-demo-fallback',
      updatedAt: new Date().toISOString(),
    };
  }

  async getOrder(id: string) {
    try {
      const order = await this.orderModel.findOne({ id }).lean();
      return order ?? null;
    } catch {
      return null;
    }
  }

  async listDisputes() {
    const disputes = await this.safeListDisputes();
    return {
      items: disputes,
      count: disputes.length,
      source: 'mongo-with-demo-fallback',
      updatedAt: new Date().toISOString(),
    };
  }

  private async safeListPoints() {
    try {
      await this.ensureSeedData();
      const points = await this.pointModel.find().lean();
      return points.length > 0 ? points : defaultDecoPoints;
    } catch {
      return defaultDecoPoints;
    }
  }

  private async safeListOrders() {
    try {
      return await this.orderModel.find().lean();
    } catch {
      return [];
    }
  }

  private async safeListDisputes() {
    try {
      return await this.disputeModel.find().lean();
    } catch {
      return [];
    }
  }

  private async ensureSeedData() {
    if (this.configService.get<string>('POINTS_DECO_SEED_DEFAULTS') !== 'true') {
      return;
    }

    const count = await this.pointModel.estimatedDocumentCount();
    if (count > 0) return;

    await this.pointModel.insertMany(defaultDecoPoints);
  }

  private normalize(value: string | undefined, fallback = '') {
    const normalized = value?.trim().toUpperCase();
    return normalized && normalized.length > 0 ? normalized : fallback;
  }

  private toAmount(value: number | string | undefined) {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }

  private ledgerPatchFromResult(result: {
    status: string;
    txId?: string;
    eventId?: string;
    error?: Record<string, unknown>;
  }) {
    if (result.status === 'skipped') return {};
    return {
      ledgerHoldStatus: result.status,
      ledgerHoldTxId: result.txId,
      ledgerHoldEventId: result.eventId,
      ledgerHoldError: result.error,
      ledgerHoldUpdatedAt: new Date().toISOString(),
    };
  }
}

import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PointOrderActionInput } from './points-deco.interfaces';
import { amountToMinorUnits } from './points-deco-money';
import {
  PointCashMovementEntity,
} from './schemas/point-cash-movement.schema';
import {
  PointOrderEntity,
} from './schemas/point-order.schema';
import {
  PointSettlementEntity,
  PointSettlementStatus,
} from './schemas/point-settlement.schema';

@Injectable()
export class PointsDecoSettlementService {
  constructor(
    @InjectModel(PointOrderEntity.name)
    private readonly orderModel: Model<PointOrderEntity>,
    @InjectModel(PointCashMovementEntity.name)
    private readonly movementModel: Model<PointCashMovementEntity>,
    @InjectModel(PointSettlementEntity.name)
    private readonly settlementModel: Model<PointSettlementEntity>,
  ) {}

  async listSettlements(query: Record<string, string | undefined>) {
    try {
      const limit = Math.min(Math.max(Number(query.limit ?? 50), 1), 200);
      const filter: Record<string, string> = {};
      if (query.pointId) filter.pointId = query.pointId;
      if (query.status) filter.status = query.status;
      if (query.orderId) filter.orderId = query.orderId;

      const items = await this.settlementModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return {
        items,
        count: items.length,
        updatedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco settlements.',
      );
    }
  }

  async getOrderSettlement(orderId: string) {
    try {
      const existing = await this.settlementModel.findOne({ orderId }).lean();
      if (existing) return existing;

      const order = await this.orderModel.findOne({ id: orderId }).lean();
      if (!order) {
        throw new NotFoundException(`Point Deco order not found: ${orderId}`);
      }

      return this.reconcileOrder(order as PointOrderEntity, {
        actorId: 'points-deco-settlement',
        actorRole: 'system',
        reason: 'Settlement preview requested.',
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco settlements.',
      );
    }
  }

  async reconcileOrder(order: PointOrderEntity, input: PointOrderActionInput = {}) {
    try {
      const movements = await this.movementModel
        .find({ orderId: order.id })
        .sort({ createdAt: 1 })
        .lean();

      const now = new Date().toISOString();
      const settlement = this.buildSettlement(
        order,
        movements as PointCashMovementEntity[],
        input,
        now,
      );

      return await this.settlementModel
        .findOneAndUpdate(
          { orderId: order.id },
          { $set: settlement },
          { upsert: true, new: true },
        )
        .lean();
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco settlement reconciliation.',
      );
    }
  }

  async markOrderCompleted(orderId: string) {
    try {
      await this.settlementModel.updateOne(
        { orderId },
        {
          $set: {
            completedAt: new Date().toISOString(),
            fiscalReportStatus: 'ready_for_export',
          },
        },
      );
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required to complete Puntos Deco settlement.',
      );
    }
  }

  private buildSettlement(
    order: PointOrderEntity,
    movements: PointCashMovementEntity[],
    input: PointOrderActionInput,
    now: string,
  ) {
    const expectedOrigin = this.expectedOriginMinorUnits(order);
    const expectedDestination = this.expectedDestinationMinorUnits(order);
    const actualReceived = this.sumMovements(
      movements,
      'order_cash_received',
      order.originCurrency,
    );
    const actualDelivered = this.sumMovements(
      movements,
      'order_cash_delivered',
      order.destinationCurrency,
    );

    const originDifference = actualReceived - expectedOrigin;
    const destinationDifference = actualDelivered - expectedDestination;
    const reviewReasons = this.reviewReasons(
      order,
      expectedOrigin,
      actualReceived,
      expectedDestination,
      actualDelivered,
    );
    const status: PointSettlementStatus =
      reviewReasons.length > 0 ? 'review_required' : 'balanced';

    return {
      id: `pd-settlement-${order.id}`,
      orderId: order.id,
      pointId: order.pointId,
      type: order.type,
      status,
      originCurrency: order.originCurrency,
      destinationCurrency: order.destinationCurrency,
      expectedOriginMinorUnits: expectedOrigin.toString(),
      actualReceivedMinorUnits: actualReceived.toString(),
      originDifferenceMinorUnits: originDifference.toString(),
      expectedDestinationMinorUnits: expectedDestination.toString(),
      actualDeliveredMinorUnits: actualDelivered.toString(),
      destinationDifferenceMinorUnits: destinationDifference.toString(),
      ledgerStatus: order.ledgerHoldStatus ?? 'not_required',
      approvalStatus: status === 'balanced' ? 'not_required' : 'pending_admin_review',
      reviewReasons,
      fiscalReportStatus: status === 'balanced' ? 'ready_for_export' : 'draft',
      generatedBy: input.actorId ?? 'points-deco-gateway',
      generatedByRole: input.actorRole ?? 'system',
      generatedAt: now,
      metadata: {
        pricingSource: order.pricingSource,
        pricingOperation: order.pricingOperation,
        limitsDecision: order.limitsDecision,
        auditTrailEvents: order.auditTrail?.length ?? 0,
        cashMovements: movements.length,
      },
    };
  }

  private expectedOriginMinorUnits(order: PointOrderEntity) {
    if (order.type === 'cash_out') return 0n;
    return BigInt(amountToMinorUnits(order.amountOrigin, order.originCurrency));
  }

  private expectedDestinationMinorUnits(order: PointOrderEntity) {
    if (order.type === 'cash_in') return 0n;
    return BigInt(
      amountToMinorUnits(order.amountDestinationEstimated, order.destinationCurrency),
    );
  }

  private sumMovements(
    movements: PointCashMovementEntity[],
    type: string,
    currency: string,
  ) {
    return movements
      .filter(
        (movement) =>
          movement.type === type && movement.currency.toUpperCase() === currency.toUpperCase(),
      )
      .reduce((total, movement) => total + BigInt(movement.amountMinorUnits), 0n);
  }

  private reviewReasons(
    order: PointOrderEntity,
    expectedOrigin: bigint,
    actualReceived: bigint,
    expectedDestination: bigint,
    actualDelivered: bigint,
  ) {
    const reasons: string[] = [];

    if (expectedOrigin !== actualReceived) {
      reasons.push('origin_cash_mismatch');
    }

    if (expectedDestination !== actualDelivered) {
      reasons.push('destination_cash_mismatch');
    }

    if (order.requiresLedgerHold && order.ledgerHoldStatus !== 'captured') {
      reasons.push('ledger_hold_not_captured');
    }

    if (order.limitsDecision !== 'ALLOW' || order.limitsRequiresApproval) {
      reasons.push('limits_requires_admin_review');
    }

    if (order.status === 'disputed') {
      reasons.push('order_disputed');
    }

    return reasons;
  }
}

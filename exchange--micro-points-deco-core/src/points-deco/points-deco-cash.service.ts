import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PointOrderActionInput } from './points-deco.interfaces';
import { amountToMinorUnits } from './points-deco-money';
import {
  CashMovementDirection,
  CashMovementType,
  PointCashMovementEntity,
} from './schemas/point-cash-movement.schema';
import { PointCashPositionEntity } from './schemas/point-cash-position.schema';
import { PointOrderEntity } from './schemas/point-order.schema';

interface CashMovementInput {
  pointId: string;
  currency: string;
  type: CashMovementType;
  direction: CashMovementDirection;
  amountMinorUnits: string;
  orderId?: string;
  actorId?: string;
  actorRole?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PointsDecoCashService {
  constructor(
    @InjectModel(PointCashPositionEntity.name)
    private readonly positionModel: Model<PointCashPositionEntity>,
    @InjectModel(PointCashMovementEntity.name)
    private readonly movementModel: Model<PointCashMovementEntity>,
  ) {}

  async listPositions(query: Record<string, string | undefined>) {
    try {
      const filter: Record<string, string> = {};
      if (query.pointId) filter.pointId = query.pointId;
      if (query.currency) filter.currency = query.currency.toUpperCase();

      const items = await this.positionModel.find(filter).sort({ pointId: 1 }).lean();
      return {
        items,
        count: items.length,
        privacy:
          'La caja real es interna. Usuario final solo ve rangos seguros de liquidez.',
        updatedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco cash positions.',
      );
    }
  }

  async listMovements(query: Record<string, string | undefined>) {
    try {
      const limit = Math.min(Math.max(Number(query.limit ?? 50), 1), 200);
      const filter: Record<string, string> = {};
      if (query.pointId) filter.pointId = query.pointId;
      if (query.currency) filter.currency = query.currency.toUpperCase();
      if (query.orderId) filter.orderId = query.orderId;

      const items = await this.movementModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return { items, count: items.length, updatedAt: new Date().toISOString() };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco cash movements.',
      );
    }
  }

  async summary(query: Record<string, string | undefined>) {
    try {
      const filter: Record<string, string> = {};
      if (query.pointId) filter.pointId = query.pointId;
      if (query.currency) filter.currency = query.currency.toUpperCase();

      const [positions, movements] = await Promise.all([
        this.positionModel.find(filter).sort({ pointId: 1, currency: 1 }).lean(),
        this.movementModel.find(filter).sort({ createdAt: -1 }).limit(250).lean(),
      ]);

      const currencies = new Map<
        string,
        {
          currency: string;
          positions: number;
          balanceMinorUnits: string;
          cashInMinorUnits: string;
          cashOutMinorUnits: string;
          neutralMovements: number;
        }
      >();

      for (const position of positions) {
        const current = this.currencySummary(currencies, position.currency);
        current.positions += 1;
        current.balanceMinorUnits = (
          this.assertInteger(current.balanceMinorUnits) +
          this.assertInteger(position.physicalBalanceMinorUnits)
        ).toString();
      }

      for (const movement of movements) {
        const current = this.currencySummary(currencies, movement.currency);
        const amount = this.assertInteger(movement.amountMinorUnits);
        if (movement.direction === 'in') {
          current.cashInMinorUnits = (
            this.assertInteger(current.cashInMinorUnits) + amount
          ).toString();
        } else if (movement.direction === 'out') {
          current.cashOutMinorUnits = (
            this.assertInteger(current.cashOutMinorUnits) + amount
          ).toString();
        } else {
          current.neutralMovements += 1;
        }
      }

      const openReviewMovements = movements.filter(
        (movement) =>
          movement.type === 'manual_adjustment' || movement.type === 'daily_close',
      ).length;

      return {
        positions: positions.length,
        movements: movements.length,
        currencies: Array.from(currencies.values()),
        review: {
          manualOrCloseMovements: openReviewMovements,
          nextAction:
            'Cruzar posiciones fisicas, comprobantes, auditoria fiat y ledger antes de cierre final.',
        },
        source: 'mongo-persistent',
        updatedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco cash summary.',
      );
    }
  }

  async adjustPosition(
    input: {
      pointId?: string;
      currency?: string;
      amountMinorUnits?: string;
      reason?: string;
    } & PointOrderActionInput,
  ) {
    if (!input.pointId || !input.currency || !input.amountMinorUnits) {
      throw new BadRequestException('pointId, currency and amountMinorUnits are required');
    }

    const amount = this.assertInteger(input.amountMinorUnits);
    const direction: CashMovementDirection = amount < 0n ? 'out' : 'in';
    const normalizedAmount = amount < 0n ? (-amount).toString() : amount.toString();

    return this.applyMovement({
      pointId: input.pointId,
      currency: input.currency.toUpperCase(),
      type: 'manual_adjustment',
      direction,
      amountMinorUnits: normalizedAmount,
      actorId: input.actorId,
      actorRole: input.actorRole,
      reason: input.reason || 'Manual cash adjustment',
    });
  }

  async closeDay(
    input: {
      pointId?: string;
      currency?: string;
      reason?: string;
    } & PointOrderActionInput,
  ) {
    if (!input.pointId || !input.currency) {
      throw new BadRequestException('pointId and currency are required');
    }

    return this.applyMovement({
      pointId: input.pointId,
      currency: input.currency.toUpperCase(),
      type: 'daily_close',
      direction: 'neutral',
      amountMinorUnits: '0',
      actorId: input.actorId,
      actorRole: input.actorRole,
      reason: input.reason || 'Daily cash close',
    });
  }

  async recordCashReceived(order: PointOrderEntity, input: PointOrderActionInput = {}) {
    if (!order.pointId) {
      return this.skipped('Order has no assigned Punto Deco.');
    }

    return this.applyMovement({
      pointId: order.pointId,
      currency: order.originCurrency,
      type: 'order_cash_received',
      direction: 'in',
      amountMinorUnits: amountToMinorUnits(order.amountOrigin, order.originCurrency),
      orderId: order.id,
      actorId: input.actorId,
      actorRole: input.actorRole,
      reason: input.reason || 'Cash received from user',
      metadata: { serviceType: order.type, userId: order.userId },
    });
  }

  async recordCashDelivered(order: PointOrderEntity, input: PointOrderActionInput = {}) {
    if (!order.pointId) {
      return this.skipped('Order has no assigned Punto Deco.');
    }

    return this.applyMovement({
      pointId: order.pointId,
      currency: order.destinationCurrency,
      type: 'order_cash_delivered',
      direction: 'out',
      amountMinorUnits: amountToMinorUnits(
        order.amountDestinationEstimated,
        order.destinationCurrency,
      ),
      orderId: order.id,
      actorId: input.actorId,
      actorRole: input.actorRole,
      reason: input.reason || 'Cash delivered to user or beneficiary',
      metadata: { serviceType: order.type, userId: order.userId },
    });
  }

  private async applyMovement(input: CashMovementInput) {
    const amount = this.assertInteger(input.amountMinorUnits);
    if (amount < 0n) {
      throw new BadRequestException('amountMinorUnits must be positive');
    }

    const position = await this.ensurePosition(input.pointId, input.currency);
    const before = this.assertInteger(position.physicalBalanceMinorUnits);
    const after =
      input.direction === 'out'
        ? before - amount
        : input.direction === 'in'
          ? before + amount
          : before;

    if (after < 0n) {
      throw new BadRequestException({
        message: 'Punto Deco cash position has insufficient physical balance',
        pointId: input.pointId,
        currency: input.currency,
        availableMinorUnits: before.toString(),
        requestedMinorUnits: amount.toString(),
      });
    }

    const movementId = `pd-cash-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const movement = {
      id: movementId,
      pointId: input.pointId,
      currency: input.currency.toUpperCase(),
      type: input.type,
      direction: input.direction,
      amountMinorUnits: amount.toString(),
      balanceBeforeMinorUnits: before.toString(),
      balanceAfterMinorUnits: after.toString(),
      orderId: input.orderId,
      actorId: input.actorId || 'points-deco-gateway',
      actorRole: input.actorRole || 'system',
      reason: input.reason,
      metadata: input.metadata,
    };

    try {
      await this.movementModel.create(movement);
      await this.positionModel.updateOne(
        { id: position.id },
        {
          $set: {
            physicalBalanceMinorUnits: after.toString(),
            lastMovementId: movementId,
            lastClosedAt:
              input.type === 'daily_close' ? new Date().toISOString() : position.lastClosedAt,
          },
          $inc: { version: 1 },
        },
      );

      return {
        movement,
        position: {
          ...position,
          physicalBalanceMinorUnits: after.toString(),
          lastMovementId: movementId,
        },
        source: 'mongo-persistent',
      };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco cash movements.',
      );
    }
  }

  private async ensurePosition(pointId: string, currency: string) {
    const normalizedCurrency = currency.toUpperCase();
    const id = `${pointId}:${normalizedCurrency}`;
    const position = await this.positionModel
      .findOneAndUpdate(
        { id },
        {
          $setOnInsert: {
            id,
            pointId,
            currency: normalizedCurrency,
            physicalBalanceMinorUnits: '0',
            status: 'active',
            version: 0,
          },
        },
        { upsert: true, new: true },
      )
      .lean();

    if (!position) {
      throw new ServiceUnavailableException('Unable to ensure Punto Deco cash position');
    }

    return position;
  }

  private assertInteger(value: string) {
    if (!/^-?\d+$/.test(value)) {
      throw new BadRequestException('amountMinorUnits must be an integer string');
    }
    return BigInt(value);
  }

  private currencySummary(
    currencies: Map<
      string,
      {
        currency: string;
        positions: number;
        balanceMinorUnits: string;
        cashInMinorUnits: string;
        cashOutMinorUnits: string;
        neutralMovements: number;
      }
    >,
    currency: string,
  ) {
    const normalizedCurrency = currency.toUpperCase();
    const current = currencies.get(normalizedCurrency);
    if (current) return current;

    const summary = {
      currency: normalizedCurrency,
      positions: 0,
      balanceMinorUnits: '0',
      cashInMinorUnits: '0',
      cashOutMinorUnits: '0',
      neutralMovements: 0,
    };
    currencies.set(normalizedCurrency, summary);
    return summary;
  }

  private skipped(reason: string) {
    return { status: 'skipped', reason };
  }
}

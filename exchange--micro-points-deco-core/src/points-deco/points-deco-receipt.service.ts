import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PointCashMovementEntity } from './schemas/point-cash-movement.schema';
import { PointOrderEntity } from './schemas/point-order.schema';

@Injectable()
export class PointsDecoReceiptService {
  constructor(
    @InjectModel(PointOrderEntity.name)
    private readonly orderModel: Model<PointOrderEntity>,
    @InjectModel(PointCashMovementEntity.name)
    private readonly movementModel: Model<PointCashMovementEntity>,
  ) {}

  async getOrderReceipt(orderId: string) {
    const order = await this.requireOrder(orderId);
    const movements = await this.listOrderMovements(orderId);
    return this.buildReceipt(order, movements);
  }

  async listReceipts(query: Record<string, string | undefined>) {
    try {
      const limit = Math.min(Math.max(Number(query.limit ?? 25), 1), 100);
      const filter: Record<string, string> = {};
      if (query.pointId) filter.pointId = query.pointId;
      if (query.status) filter.status = query.status;

      const orders = await this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const orderIds = orders.map((order) => order.id);
      const movements = await this.movementModel
        .find({ orderId: { $in: orderIds } })
        .sort({ createdAt: 1 })
        .lean();

      const movementsByOrder = new Map<string, PointCashMovementEntity[]>();
      for (const movement of movements) {
        if (!movement.orderId) continue;
        const current = movementsByOrder.get(movement.orderId) ?? [];
        current.push(movement as PointCashMovementEntity);
        movementsByOrder.set(movement.orderId, current);
      }

      const items = orders.map((order) =>
        this.buildReceipt(
          order as PointOrderEntity,
          movementsByOrder.get(order.id) ?? [],
          false,
        ),
      );

      return {
        items,
        count: items.length,
        source: 'mongo-persistent',
        updatedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco receipts.',
      );
    }
  }

  private async requireOrder(orderId: string) {
    try {
      const order = await this.orderModel.findOne({ id: orderId }).lean();
      if (!order) {
        throw new NotFoundException(`Point Deco order not found: ${orderId}`);
      }
      return order as PointOrderEntity;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco receipts.',
      );
    }
  }

  private async listOrderMovements(orderId: string) {
    try {
      return (await this.movementModel
        .find({ orderId })
        .sort({ createdAt: 1 })
        .lean()) as PointCashMovementEntity[];
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco cash movements.',
      );
    }
  }

  private buildReceipt(
    order: PointOrderEntity,
    movements: PointCashMovementEntity[],
    includeMovements = true,
  ) {
    const cashReceived = movements.find(
      (movement) => movement.type === 'order_cash_received',
    );
    const cashDelivered = movements.find(
      (movement) => movement.type === 'order_cash_delivered',
    );
    const completed = order.status === 'completed';
    const reviewRequired =
      order.status === 'disputed' ||
      order.ledgerHoldStatus === 'review_required' ||
      movements.length === 0;

    return {
      id: `pd-receipt-${order.id}`,
      orderId: order.id,
      pointId: order.pointId,
      type: order.type,
      status: completed ? 'final' : reviewRequired ? 'review_required' : 'draft',
      orderStatus: order.status,
      userId: order.userId,
      fiat: {
        originCurrency: order.originCurrency,
        destinationCurrency: order.destinationCurrency,
        amountOrigin: order.amountOrigin,
        amountDestinationEstimated: order.amountDestinationEstimated,
        rate: order.rate,
        decoFee: order.decoFee,
        pointFee: order.pointFee,
      },
      cash: {
        receivedMovementId: cashReceived?.id,
        deliveredMovementId: cashDelivered?.id,
        receivedAt: cashReceived
          ? this.valueFromMovement(cashReceived, 'createdAt')
          : order.cashReceivedAt,
        deliveredAt: cashDelivered
          ? this.valueFromMovement(cashDelivered, 'createdAt')
          : order.cashDeliveredAt,
      },
      ledger: {
        requiresHold: order.requiresLedgerHold,
        holdStatus: order.ledgerHoldStatus,
        holdCurrency: order.ledgerHoldCurrency,
        holdAmountMinorUnits: order.ledgerHoldAmountMinorUnits,
        txId: order.ledgerHoldTxId,
        eventId: order.ledgerHoldEventId,
      },
      evidence: {
        cashMovements: movements.length,
        auditTrailEvents: order.auditTrail?.length ?? 0,
        reconciliationState: reviewRequired ? 'requires_review' : 'ready',
      },
      movements: includeMovements ? movements : undefined,
      disclaimer:
        'Comprobante operativo de Puntos Deco. No constituye licencia financiera ni recibo fiscal definitivo.',
      generatedAt: new Date().toISOString(),
    };
  }

  private valueFromMovement(movement: PointCashMovementEntity, key: string) {
    return (movement as unknown as Record<string, unknown>)[key];
  }
}

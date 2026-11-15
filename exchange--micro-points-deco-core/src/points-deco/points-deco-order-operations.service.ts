import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PointOrderActionInput,
  PointOrderStatus,
} from './points-deco.interfaces';
import {
  buildPointOrderAuditEvent,
  pointOrderActorId,
} from './points-deco-order-audit';
import { PointsDecoCashService } from './points-deco-cash.service';
import { PointsDecoFiatAuditService } from './points-deco-fiat-audit.service';
import { PointsDecoLedgerService } from './points-deco-ledger.service';
import { PointsDecoOrderStateService } from './points-deco-order-state.service';
import { PointsDecoSettlementService } from './points-deco-settlement.service';
import { PointDisputeEntity } from './schemas/point-dispute.schema';
import { PointOrderEntity } from './schemas/point-order.schema';
import { PointSettlementEntity } from './schemas/point-settlement.schema';

@Injectable()
export class PointsDecoOrderOperationsService {
  constructor(
    @InjectModel(PointOrderEntity.name)
    private readonly orderModel: Model<PointOrderEntity>,
    @InjectModel(PointDisputeEntity.name)
    private readonly disputeModel: Model<PointDisputeEntity>,
    private readonly orderStateService: PointsDecoOrderStateService,
    private readonly ledgerService: PointsDecoLedgerService,
    private readonly cashService: PointsDecoCashService,
    private readonly fiatAuditService: PointsDecoFiatAuditService,
    private readonly settlementService: PointsDecoSettlementService,
  ) {}

  async acceptOrder(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    this.assertLimitsAllowOperationalProgress(order);
    this.assertLedgerHoldReady(order);
    return this.transitionOrder(id, order.status, 'accepted', input);
  }

  async revealLocation(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    return this.transitionOrder(id, order.status, 'location_revealed', input);
  }

  async checkIn(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    return this.transitionOrder(id, order.status, 'user_checked_in', input);
  }

  async confirmCode(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    return this.transitionOrder(id, order.status, 'code_verified', input);
  }

  async confirmCashReceived(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    const transition = await this.transitionOrder(id, order.status, 'cash_received', input);
    const cashMovement = await this.cashService.recordCashReceived(
      transition.order as PointOrderEntity,
      input,
    );
    const fiatAudit = await this.fiatAuditService.recordCashMovement(
      transition.order as PointOrderEntity,
      cashMovement,
      'cash_received',
    );
    return { ...transition, cashMovement, fiatAudit };
  }

  async confirmCashDelivered(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    const transition = await this.transitionOrder(id, order.status, 'cash_delivered', input);
    const updatedOrder = transition.order as PointOrderEntity;
    const cashMovement = await this.cashService.recordCashDelivered(updatedOrder, input);
    const fiatAudit = await this.fiatAuditService.recordCashMovement(
      updatedOrder,
      cashMovement,
      'cash_delivered',
    );

    if (!updatedOrder.requiresLedgerHold || updatedOrder.ledgerHoldStatus !== 'held') {
      return { ...transition, cashMovement, fiatAudit };
    }

    const ledgerCapture = await this.ledgerService.captureOrder(
      updatedOrder,
      input.reason || 'Cash delivered by Punto Deco operator.',
    );

    const patch = this.ledgerPatchFromResult(ledgerCapture);
    if (ledgerCapture.requiresReview) {
      await this.markLedgerReview(id, 'cash_delivered', patch, ledgerCapture);
      return {
        ...transition,
        cashMovement,
        fiatAudit,
        ledgerCapture,
        nextRequiredAction: 'WAIT_FOR_ADMIN_LEDGER_REVIEW',
      };
    }

    await this.orderModel.updateOne(
      { id },
      {
        $set: {
          ...patch,
          status: 'settlement_pending',
          statusChangedAt: new Date().toISOString(),
        },
        $push: {
          auditTrail: buildPointOrderAuditEvent('settlement_pending', {
            ...input,
            actorId: 'wallet-ledger-core',
            actorRole: 'microservice',
            reason: 'Ledger hold captured after cash delivery.',
          }),
        },
      },
    );

    return {
      ...transition,
      cashMovement,
      fiatAudit,
      ledgerCapture,
      nextRequiredAction: 'READY_TO_COMPLETE_SETTLEMENT',
    };
  }

  async completeSettlement(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    const settlement = await this.settlementService.reconcileOrder(order, input);

    if (settlement.status !== 'balanced') {
      return {
        order,
        settlement,
        nextRequiredAction: 'WAIT_FOR_ADMIN_RECONCILIATION_REVIEW',
        source: 'mongo-persistent',
      };
    }

    const transition = await this.transitionOrder(id, order.status, 'completed', {
      ...input,
      reason: input.reason || 'Puntos Deco settlement reconciled and balanced.',
    });
    const completedAt = new Date().toISOString();
    await this.settlementService.markOrderCompleted(id);
    const fiatReconciliation = await this.fiatAuditService.recordSettlement(
      transition.order as PointOrderEntity,
      {
        ...(settlement as object),
        completedAt,
        fiscalReportStatus: 'ready_for_export',
      } as PointSettlementEntity,
    );

    return {
      ...transition,
      settlement,
      fiatReconciliation,
      nextRequiredAction: 'ORDER_COMPLETED_AND_READY_FOR_FISCAL_EXPORT',
    };
  }

  async cancelOrder(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    if (order.requiresLedgerHold && order.ledgerHoldStatus === 'held') {
      const ledgerRelease = await this.ledgerService.releaseOrder(
        order,
        input.reason || 'Puntos Deco order cancelled.',
      );

      const patch = this.ledgerPatchFromResult(ledgerRelease);
      if (ledgerRelease.requiresReview) {
        await this.markLedgerReview(id, order.status, patch, ledgerRelease);
        throw new ServiceUnavailableException({
          message: 'Ledger hold release requires administrative review before cancellation',
          ledgerRelease,
        });
      }

      await this.orderModel.updateOne({ id }, { $set: patch });
    }

    return this.transitionOrder(id, order.status, 'cancelled', input);
  }

  async cancelAfterApprovedDispute(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    if (order.status === 'cancelled') {
      return {
        order,
        nextRequiredAction: 'ORDER_ALREADY_CANCELLED',
        idempotent: true,
        source: 'mongo-persistent',
      };
    }

    if (['completed', 'expired'].includes(order.status)) {
      throw new ForbiddenException({
        message: 'Approved dispute cancellation cannot mutate a completed or expired order',
        status: order.status,
      });
    }

    if (order.requiresLedgerHold && order.ledgerHoldStatus === 'held') {
      const ledgerRelease = await this.ledgerService.releaseOrder(
        order,
        input.reason || 'Approved Puntos Deco dispute cancelled the order.',
      );

      const patch = this.ledgerPatchFromResult(ledgerRelease);
      if (ledgerRelease.requiresReview) {
        await this.markLedgerReview(id, order.status, patch, ledgerRelease);
        throw new ServiceUnavailableException({
          message: 'Ledger hold release requires administrative review before dispute cancellation',
          ledgerRelease,
        });
      }

      await this.orderModel.updateOne({ id }, { $set: patch });
    }

    const event = buildPointOrderAuditEvent(
      'dispute_resolution_cancelled',
      {
        ...input,
        reason:
          input.reason ||
          'Orden cancelada por resolucion de disputa aprobada con doble control.',
      },
      order.status,
    );

    const updated = await this.orderModel
      .findOneAndUpdate(
        { id },
        {
          $set: {
            status: 'cancelled',
            statusChangedAt: event.at,
            cancelledAt: event.at,
          },
          $push: { auditTrail: event },
        },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException(`Point Deco order not found: ${id}`);
    }

    return {
      order: updated,
      transition: {
        from: order.status,
        to: 'cancelled',
        auditEvent: event,
      },
      nextRequiredAction: 'ORDER_CANCELLED_BY_APPROVED_DISPUTE',
      source: 'mongo-persistent',
    };
  }

  async refundUserAfterApprovedDispute(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    if (order.status === 'cancelled' && order.ledgerHoldStatus === 'released') {
      return {
        order,
        nextRequiredAction: 'USER_HOLD_ALREADY_RELEASED',
        idempotent: true,
        source: 'mongo-persistent',
      };
    }

    if (['completed', 'expired'].includes(order.status)) {
      throw new ForbiddenException({
        message: 'Approved dispute refund cannot mutate a completed or expired order',
        status: order.status,
      });
    }

    if (!order.requiresLedgerHold) {
      throw new ServiceUnavailableException({
        message:
          'Refund executor requires a confirmed ledger hold. Non-hold refunds need a dedicated custody/ledger credit workflow.',
        orderId: id,
        status: order.status,
      });
    }

    if (order.ledgerHoldStatus !== 'held' && order.ledgerHoldStatus !== 'released') {
      throw new ServiceUnavailableException({
        message: 'Refund executor can only release a held balance safely',
        orderId: id,
        ledgerHoldStatus: order.ledgerHoldStatus,
      });
    }

    if (order.ledgerHoldStatus === 'held') {
      const ledgerRelease = await this.ledgerService.releaseOrder(
        order,
        input.reason || 'Approved Puntos Deco dispute refunded user hold.',
      );

      const patch = this.ledgerPatchFromResult(ledgerRelease);
      if (ledgerRelease.requiresReview) {
        await this.markLedgerReview(id, order.status, patch, ledgerRelease);
        throw new ServiceUnavailableException({
          message: 'Ledger hold release requires administrative review before user refund',
          ledgerRelease,
        });
      }

      await this.orderModel.updateOne({ id }, { $set: patch });
    }

    const event = buildPointOrderAuditEvent(
      'dispute_resolution_refunded_user',
      {
        ...input,
        reason:
          input.reason ||
          'Hold liberado al usuario por resolucion de disputa aprobada con doble control.',
      },
      order.status,
    );

    const updated = await this.orderModel
      .findOneAndUpdate(
        { id },
        {
          $set: {
            status: 'cancelled',
            statusChangedAt: event.at,
            cancelledAt: event.at,
          },
          $push: { auditTrail: event },
        },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException(`Point Deco order not found: ${id}`);
    }

    return {
      order: updated,
      transition: {
        from: order.status,
        to: 'cancelled',
        auditEvent: event,
      },
      nextRequiredAction: 'USER_REFUNDED_BY_LEDGER_HOLD_RELEASE',
      source: 'mongo-persistent',
    };
  }

  async releaseToPointAfterApprovedDispute(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    if (['settlement_pending', 'completed'].includes(order.status)) {
      return {
        order,
        nextRequiredAction:
          order.status === 'completed'
            ? 'ORDER_ALREADY_COMPLETED'
            : 'POINT_RELEASE_ALREADY_READY_FOR_SETTLEMENT',
        idempotent: true,
        source: 'mongo-persistent',
      };
    }

    if (['cancelled', 'expired'].includes(order.status)) {
      throw new ForbiddenException({
        message: 'Approved dispute point release cannot mutate a cancelled or expired order',
        status: order.status,
      });
    }

    if (!order.requiresLedgerHold) {
      throw new ServiceUnavailableException({
        message:
          'Point release executor requires a confirmed ledger hold. Non-hold point settlement needs a dedicated custody/ledger payout workflow.',
        orderId: id,
        status: order.status,
      });
    }

    if (order.ledgerHoldStatus !== 'held' && order.ledgerHoldStatus !== 'captured') {
      throw new ServiceUnavailableException({
        message: 'Point release executor can only capture a held balance safely',
        orderId: id,
        ledgerHoldStatus: order.ledgerHoldStatus,
      });
    }

    if (order.ledgerHoldStatus === 'held') {
      const ledgerCapture = await this.ledgerService.captureOrder(
        order,
        input.reason || 'Approved Puntos Deco dispute released value to point settlement.',
      );

      const patch = this.ledgerPatchFromResult(ledgerCapture);
      if (ledgerCapture.requiresReview) {
        await this.markLedgerReview(id, order.status, patch, ledgerCapture);
        throw new ServiceUnavailableException({
          message: 'Ledger hold capture requires administrative review before point release',
          ledgerCapture,
        });
      }

      await this.orderModel.updateOne({ id }, { $set: patch });
    }

    const event = buildPointOrderAuditEvent(
      'dispute_resolution_released_to_point',
      {
        ...input,
        reason:
          input.reason ||
          'Hold capturado para liquidacion del Punto Deco por resolucion aprobada.',
      },
      order.status,
    );

    const updated = await this.orderModel
      .findOneAndUpdate(
        { id },
        {
          $set: {
            status: 'settlement_pending',
            statusChangedAt: event.at,
            settlementPendingAt: event.at,
          },
          $push: { auditTrail: event },
        },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException(`Point Deco order not found: ${id}`);
    }

    return {
      order: updated,
      transition: {
        from: order.status,
        to: 'settlement_pending',
        auditEvent: event,
      },
      nextRequiredAction: 'POINT_RELEASE_READY_FOR_SETTLEMENT_RECONCILIATION',
      source: 'mongo-persistent',
    };
  }

  async openDispute(id: string, input: PointOrderActionInput = {}) {
    const order = await this.requireOrder(id);
    const actorId = pointOrderActorId(input);
    const reason = input.reason?.trim() || 'Disputa abierta para revision operativa.';
    const disputeId = `pd-dispute-${Date.now()}`;
    const openedAt = new Date().toISOString();
    const slaDueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const auditEvent = buildPointOrderAuditEvent(
      'dispute_opened',
      {
        ...input,
        reason,
      },
      order.status,
    );

    const updatedOrder = await this.transitionOrder(id, order.status, 'disputed', {
      ...input,
      reason,
    });

    try {
      await this.disputeModel.create({
        id: disputeId,
        orderId: id,
        pointId: order.pointId,
        userId: order.userId,
        orderType: order.type,
        originCurrency: order.originCurrency,
        destinationCurrency: order.destinationCurrency,
        amountOrigin: order.amountOrigin,
        amountDestinationEstimated: order.amountDestinationEstimated,
        openedBy: actorId,
        openedByRole: input.actorRole || 'user',
        reason,
        status: 'open',
        evidenceRefs: input.evidenceRefs ?? [],
        auditTrail: [auditEvent],
        openedAt,
        slaDueAt,
      });
    } catch {
      return {
        ...updatedOrder,
        dispute: {
          id: disputeId,
          orderId: id,
          pointId: order.pointId,
          userId: order.userId,
          orderType: order.type,
          openedBy: actorId,
          openedByRole: input.actorRole || 'user',
          reason,
          status: 'open',
          openedAt,
          slaDueAt,
          source: 'demo-fallback',
        },
        warning:
          'Dispute not persisted. Configure MongoDB runtime before operational disputes.',
      };
    }

    return {
      ...updatedOrder,
      dispute: {
        id: disputeId,
        orderId: id,
        pointId: order.pointId,
        userId: order.userId,
        orderType: order.type,
        openedBy: actorId,
        openedByRole: input.actorRole || 'user',
        reason,
        status: 'open',
        openedAt,
        slaDueAt,
        source: 'mongo-persistent',
      },
    };
  }

  private async requireOrder(id: string) {
    try {
      const order = await this.orderModel.findOne({ id }).lean();
      if (!order) {
        throw new NotFoundException(`Point Deco order not found: ${id}`);
      }
      return order as PointOrderEntity & { status: PointOrderStatus };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco order state transitions.',
      );
    }
  }

  private async transitionOrder(
    id: string,
    current: PointOrderStatus,
    next: PointOrderStatus,
    input: PointOrderActionInput,
  ) {
    this.orderStateService.assertCanOperate(current);
    this.orderStateService.assertTransition(current, next);

    const event = buildPointOrderAuditEvent(next, input, current);
    const setPatch: Record<string, unknown> = {
      status: next,
      statusChangedAt: event.at,
    };
    const timestampField = this.timestampFieldFor(next);
    if (timestampField) {
      setPatch[timestampField] = event.at;
    }

    const updated = await this.orderModel
      .findOneAndUpdate(
        { id },
        {
          $set: setPatch,
          $push: { auditTrail: event },
        },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException(`Point Deco order not found: ${id}`);
    }

    return {
      order: updated,
      transition: {
        from: current,
        to: next,
        auditEvent: event,
      },
      nextRequiredAction: this.nextRequiredAction(next),
      source: 'mongo-persistent',
    };
  }

  private assertLimitsAllowOperationalProgress(
    order: PointOrderEntity & { status: PointOrderStatus },
  ) {
    if (order.limitsDecision !== 'ALLOW' || order.limitsRequiresApproval) {
      throw new ForbiddenException({
        message: 'Puntos Deco order requires administrative approval before acceptance',
        limitsDecision: order.limitsDecision,
        limitsRequiresApproval: order.limitsRequiresApproval,
        limitsNextAction: order.limitsNextAction,
      });
    }
  }

  private assertLedgerHoldReady(order: PointOrderEntity & { status: PointOrderStatus }) {
    if (order.requiresLedgerHold && order.ledgerHoldStatus !== 'held') {
      throw new ForbiddenException({
        message: 'Puntos Deco order requires a confirmed ledger hold before acceptance',
        ledgerHoldStatus: order.ledgerHoldStatus,
        ledgerHoldCurrency: order.ledgerHoldCurrency,
        ledgerHoldAmountMinorUnits: order.ledgerHoldAmountMinorUnits,
      });
    }
  }

  private ledgerPatchFromResult(result: {
    status: string;
    txId?: string;
    eventId?: string;
    error?: Record<string, unknown>;
  }) {
    return {
      ledgerHoldStatus: result.status,
      ledgerHoldTxId: result.txId,
      ledgerHoldEventId: result.eventId,
      ledgerHoldError: result.error,
      ledgerHoldUpdatedAt: new Date().toISOString(),
    };
  }

  private async markLedgerReview(
    id: string,
    from: PointOrderStatus | string,
    patch: Record<string, unknown>,
    payload: Record<string, unknown>,
  ) {
    await this.orderModel.updateOne(
      { id },
      {
        $set: patch,
        $push: {
          auditTrail: buildPointOrderAuditEvent(
            'ledger_review_required',
            {
              actorId: 'wallet-ledger-core',
              actorRole: 'microservice',
              reason: 'Ledger hold mutation requires administrative review.',
              note: JSON.stringify(payload),
            },
            from,
          ),
        },
      },
    );
  }

  private timestampFieldFor(status: PointOrderStatus) {
    const map: Partial<Record<PointOrderStatus, string>> = {
      accepted: 'acceptedAt',
      location_revealed: 'locationRevealedAt',
      user_checked_in: 'checkedInAt',
      code_verified: 'codeVerifiedAt',
      cash_received: 'cashReceivedAt',
      cash_delivered: 'cashDeliveredAt',
      settlement_pending: 'settlementPendingAt',
      completed: 'completedAt',
      cancelled: 'cancelledAt',
      disputed: 'disputedAt',
    };
    return map[status];
  }

  private nextRequiredAction(status: PointOrderStatus) {
    const map: Partial<Record<PointOrderStatus, string>> = {
      accepted: 'REVEAL_PROTECTED_LOCATION',
      location_revealed: 'WAIT_FOR_USER_CHECK_IN',
      user_checked_in: 'VERIFY_ONE_TIME_QR_OR_PIN',
      code_verified: 'WAIT_FOR_CASH_CONFIRMATION_OR_LEDGER_HOLD',
      cash_received: 'PREPARE_LEDGER_SETTLEMENT',
      cash_delivered: 'CAPTURE_LEDGER_HOLD',
      settlement_pending: 'COMPLETE_SETTLEMENT_AFTER_RECONCILIATION',
      completed: 'ORDER_COMPLETED',
      cancelled: 'STOP_OPERATION_AND_RELEASE_ANY_FUTURE_HOLDS',
      disputed: 'WAIT_FOR_ADMIN_REVIEW',
    };
    return map[status] ?? 'CONTINUE_OPERATION';
  }
}

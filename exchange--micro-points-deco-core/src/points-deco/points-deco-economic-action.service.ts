import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PointOrderActionInput } from './points-deco.interfaces';
import { PointsDecoCustodySettlementService } from './points-deco-custody-settlement.service';
import { PointsDecoLedgerService } from './points-deco-ledger.service';
import { pointOrderActorId } from './points-deco-order-audit';
import {
  PointEconomicActionEntity,
  PointEconomicActionResolution,
  PointEconomicActionStatus,
} from './schemas/point-economic-action.schema';
import { PointDisputeEntity } from './schemas/point-dispute.schema';
import { PointOrderEntity } from './schemas/point-order.schema';

@Injectable()
export class PointsDecoEconomicActionService {
  constructor(
    @InjectModel(PointEconomicActionEntity.name)
    private readonly actionModel: Model<PointEconomicActionEntity>,
    private readonly custodySettlementService: PointsDecoCustodySettlementService,
    private readonly ledgerService: PointsDecoLedgerService,
  ) {}

  async listActions(query: Record<string, string | undefined> = {}) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.disputeId) filter.disputeId = query.disputeId;
    if (query.orderId) filter.orderId = query.orderId;
    if (query.pointId) filter.pointId = query.pointId;
    if (query.userId) filter.userId = query.userId;
    if (query.resolution) filter.resolution = query.resolution;

    const limit = Math.min(Number(query.limit ?? 50) || 50, 100);

    try {
      const items = await this.actionModel
        .find(filter)
        .sort({ createdAtIso: -1 })
        .limit(limit)
        .lean();

      return {
        items,
        count: items.length,
        source: 'mongo-persistent',
        updatedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco economic actions.',
      );
    }
  }

  async createNoHoldAction(input: {
    dispute: PointDisputeEntity;
    order: PointOrderEntity;
    resolution: PointEconomicActionResolution;
    sourceExecutionId: string;
    reason: string;
    actionInput: PointOrderActionInput;
  }) {
    const id = `pd-economic-action-${input.dispute.id}-${input.resolution}`;
    const existing = await this.findAction(id);
    if (existing) {
      return {
        action: existing,
        idempotent: true,
        source: 'mongo-persistent',
      };
    }

    const createdAtIso = new Date().toISOString();
    const actionType =
      input.resolution === 'refund_user'
        ? 'non_hold_refund'
        : 'non_hold_point_payout';
    const requiredAction =
      input.resolution === 'refund_user'
        ? 'CREATE_CONTROLLED_LEDGER_OR_CUSTODY_CREDIT_TO_USER'
        : 'CREATE_CONTROLLED_POINT_PAYOUT_OR_SETTLEMENT_ADJUSTMENT';

    const payload: PointEconomicActionEntity = {
      id,
      disputeId: input.dispute.id,
      orderId: input.order.id,
      pointId: input.order.pointId ?? input.dispute.pointId,
      userId: input.order.userId ?? input.dispute.userId,
      resolution: input.resolution,
      actionType,
      status: 'pending_review',
      requiredAction,
      reason: input.reason,
      sourceExecutionId: input.sourceExecutionId,
      orderStatus: input.order.status,
      ledgerHoldStatus: input.order.ledgerHoldStatus ?? 'not_required',
      requiresLedgerHold: input.order.requiresLedgerHold ?? false,
      originCurrency: input.order.originCurrency,
      destinationCurrency: input.order.destinationCurrency,
      amountOrigin: input.order.amountOrigin,
      amountDestinationEstimated: input.order.amountDestinationEstimated,
      createdBy: pointOrderActorId(input.actionInput),
      createdByRole: input.actionInput.actorRole || 'admin',
      createdAtIso,
      metadata: {
        orderType: input.order.type,
        disputeReason: input.dispute.reason,
        resolutionReason: input.dispute.resolutionReason,
        executionNote: input.reason,
      },
      auditTrail: [
        {
          action: 'economic_action_created',
          actorId: pointOrderActorId(input.actionInput),
          actorRole: input.actionInput.actorRole || 'admin',
          reason: input.reason,
          at: createdAtIso,
        },
      ],
    };

    try {
      const action = await this.actionModel.create(payload);
      return {
        action,
        idempotent: false,
        source: 'mongo-persistent',
      };
    } catch {
      const action = await this.findAction(id);
      if (action) {
        return {
          action,
          idempotent: true,
          source: 'mongo-persistent',
        };
      }
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required to register Puntos Deco economic actions.',
      );
    }
  }

  async queueForCustody(id: string, input: PointOrderActionInput = {}) {
    const action = await this.requireAction(id);
    this.assertTransition(action.status, ['pending_review'], 'queue for custody');

    return this.transitionAction(
      action,
      'queued_for_custody',
      'economic_action_queued_for_custody',
      {
        reviewedBy: pointOrderActorId(input),
        reviewedByRole: input.actorRole || 'admin',
        reviewedAtIso: new Date().toISOString(),
      },
      input,
      'RUN_CONTROLLED_CUSTODY_OR_LEDGER_EXECUTOR',
    );
  }

  async executeAction(id: string, input: PointOrderActionInput = {}) {
    const action = await this.requireAction(id);
    this.assertTransition(action.status, ['queued_for_custody'], 'execute');
    const custodySettlement =
      await this.custodySettlementService.prepareEconomicAction(action);

    if (custodySettlement.requiresReview) {
      return this.keepQueuedForManualExecution(
        action,
        input,
        custodySettlement,
      );
    }

    const ledgerExecution = await this.ledgerService.applyEconomicAction(action);

    if (ledgerExecution.requiresReview) {
      return this.keepQueuedForManualExecution(
        action,
        input,
        {
          custodySettlement,
          ledgerExecution,
        },
      );
    }

    return this.transitionAction(
      action,
      'executed',
      'economic_action_executed_by_ledger_adapter',
      {
        executedBy: pointOrderActorId(input),
        executedByRole: input.actorRole || 'admin',
        executedAtIso: new Date().toISOString(),
        executionReference:
          this.adapterValue(ledgerExecution, 'txId') ||
          this.adapterValue(ledgerExecution, 'eventId') ||
          input.code ||
          input.evidenceRefs?.[0] ||
          action.sourceExecutionId,
      },
      input,
      'ECONOMIC_ACTION_EXECUTED_RECONCILE_DOWNSTREAM',
      {
        custodySettlement,
        ledgerExecution,
      },
    );
  }

  async rejectAction(id: string, input: PointOrderActionInput = {}) {
    const action = await this.requireAction(id);
    this.assertTransition(action.status, ['pending_review', 'queued_for_custody'], 'reject');

    return this.transitionAction(
      action,
      'rejected',
      'economic_action_rejected',
      {
        rejectedBy: pointOrderActorId(input),
        rejectedByRole: input.actorRole || 'admin',
        rejectedAtIso: new Date().toISOString(),
        rejectionReason:
          input.reason?.trim() || input.note?.trim() || 'Accion economica rechazada.',
      },
      input,
      'NO_ECONOMIC_ACTION_EXECUTION',
    );
  }

  private async findAction(id: string) {
    try {
      return await this.actionModel.findOne({ id }).lean();
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco economic actions.',
      );
    }
  }

  private async requireAction(id: string) {
    const action = await this.findAction(id);
    if (!action) {
      throw new NotFoundException(`Point Deco economic action not found: ${id}`);
    }
    return action;
  }

  private assertTransition(
    status: PointEconomicActionStatus,
    allowed: PointEconomicActionStatus[],
    operation: string,
  ) {
    if (!allowed.includes(status)) {
      throw new BadRequestException({
        message: `Cannot ${operation} economic action from current status`,
        status,
        allowed,
      });
    }
  }

  private async transitionAction(
    current: PointEconomicActionEntity,
    status: PointEconomicActionStatus,
    actionName: string,
    setPatch: Partial<PointEconomicActionEntity>,
    input: PointOrderActionInput,
    nextRequiredAction: string,
    adapterResult?: unknown,
  ) {
    const now = new Date().toISOString();
    const event = {
      action: actionName,
      from: current.status,
      to: status,
      actorId: pointOrderActorId(input),
      actorRole: input.actorRole || 'admin',
      reason: input.reason?.trim() || input.note?.trim() || null,
      evidenceRefs: input.evidenceRefs ?? [],
      at: now,
    };

    try {
      const action = await this.actionModel
        .findOneAndUpdate(
          { id: current.id },
          {
            $set: {
              ...setPatch,
              status,
              requiredAction: nextRequiredAction,
              ...(adapterResult ? { 'metadata.adapterResult': adapterResult } : {}),
            },
            $push: { auditTrail: event },
          },
          { new: true },
        )
        .lean();

      if (!action) {
        throw new NotFoundException(`Point Deco economic action not found: ${current.id}`);
      }

      return {
        action,
        auditEvent: event,
        nextRequiredAction,
        source: 'mongo-persistent',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required to transition Puntos Deco economic actions.',
      );
    }
  }

  private async keepQueuedForManualExecution(
    current: PointEconomicActionEntity,
    input: PointOrderActionInput,
    adapterResult: unknown,
  ) {
    const now = new Date().toISOString();
    const event = {
      action: 'economic_action_adapter_review_required',
      status: current.status,
      actorId: pointOrderActorId(input),
      actorRole: input.actorRole || 'admin',
      reason:
        input.reason?.trim() ||
        input.note?.trim() ||
        'Ledger adapter could not execute this economic action automatically.',
      evidenceRefs: input.evidenceRefs ?? [],
      adapterResult,
      at: now,
    };

    try {
      const action = await this.actionModel
        .findOneAndUpdate(
          { id: current.id },
          {
            $set: {
              requiredAction: 'WAIT_FOR_MANUAL_CUSTODY_OR_LEDGER_EXECUTION',
              'metadata.adapterResult': adapterResult,
            },
            $push: { auditTrail: event },
          },
          { new: true },
        )
        .lean();

      if (!action) {
        throw new NotFoundException(`Point Deco economic action not found: ${current.id}`);
      }

      return {
        action,
        auditEvent: event,
        adapterResult,
        nextRequiredAction: 'WAIT_FOR_MANUAL_CUSTODY_OR_LEDGER_EXECUTION',
        source: 'mongo-persistent',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required to transition Puntos Deco economic actions.',
      );
    }
  }

  private adapterValue(adapterResult: unknown, key: string) {
    if (!adapterResult || typeof adapterResult !== 'object') return undefined;
    const value = (adapterResult as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PointOrderActionInput } from './points-deco.interfaces';
import { pointOrderActorId } from './points-deco-order-audit';
import { PointsDecoEconomicActionService } from './points-deco-economic-action.service';
import { PointsDecoOrderOperationsService } from './points-deco-order-operations.service';
import { PointEconomicActionResolution } from './schemas/point-economic-action.schema';
import { PointDisputeEntity } from './schemas/point-dispute.schema';
import { PointOrderEntity } from './schemas/point-order.schema';

type DisputeStatus = PointDisputeEntity['status'];

@Injectable()
export class PointsDecoDisputeService {
  constructor(
    @InjectModel(PointDisputeEntity.name)
    private readonly disputeModel: Model<PointDisputeEntity>,
    @InjectModel(PointOrderEntity.name)
    private readonly orderModel: Model<PointOrderEntity>,
    private readonly economicActionService: PointsDecoEconomicActionService,
    private readonly orderOperations: PointsDecoOrderOperationsService,
  ) {}

  async listDisputes(query: Record<string, string | undefined> = {}) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.orderId) filter.orderId = query.orderId;
    if (query.pointId) filter.pointId = query.pointId;
    if (query.userId) filter.userId = query.userId;
    if (query.makerCheckerStatus) filter.makerCheckerStatus = query.makerCheckerStatus;

    const limit = Math.min(Number(query.limit ?? 50) || 50, 100);

    try {
      const items = await this.disputeModel
        .find(filter)
        .sort({ createdAt: -1 })
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
        'Persistent MongoDB is required for Puntos Deco disputes.',
      );
    }
  }

  async getDispute(id: string) {
    return {
      dispute: await this.requireDispute(id),
      source: 'mongo-persistent',
    };
  }

  async reviewDispute(id: string, input: PointOrderActionInput = {}) {
    const dispute = await this.requireDispute(id);
    this.assertOpenForReview(dispute.status);

    return this.updateDispute(
      id,
      dispute,
      {
        status: 'reviewing',
        assignedTo: pointOrderActorId(input),
        reviewStartedAt: new Date().toISOString(),
      },
      'dispute_review_started',
      input,
      'CONTINUE_EVIDENCE_REVIEW',
    );
  }

  async resolveDispute(id: string, input: PointOrderActionInput = {}) {
    const dispute = await this.requireDispute(id);
    this.assertOpenForResolution(dispute.status);

    const resolution = input.resolution ?? 'manual_review';
    const preparedBy = pointOrderActorId(input);
    return this.updateDispute(
      id,
      dispute,
      {
        status: 'resolved',
        assignedTo: dispute.assignedTo ?? preparedBy,
        resolution,
        resolutionReason:
          input.reason?.trim() || input.note?.trim() || 'Decision administrativa registrada.',
        adminNote: input.note?.trim(),
        makerCheckerStatus: 'pending_checker',
        preparedBy,
        preparedAt: new Date().toISOString(),
        resolvedAt: new Date().toISOString(),
      },
      'dispute_resolved',
      input,
      'WAITING_CHECKER_APPROVAL',
    );
  }

  async approveResolution(id: string, input: PointOrderActionInput = {}) {
    const dispute = await this.requireDispute(id);
    this.assertPendingChecker(dispute);
    this.assertDifferentChecker(dispute, input);

    return this.updateDispute(
      id,
      dispute,
      {
        makerCheckerStatus: 'approved',
        checkedBy: pointOrderActorId(input),
        checkedAt: new Date().toISOString(),
        checkerNote: input.note?.trim(),
        appliedResolutionAt: new Date().toISOString(),
      },
      'dispute_resolution_approved',
      input,
      'READY_FOR_SETTLEMENT_OR_REVERSAL_EXECUTOR',
    );
  }

  async rejectResolution(id: string, input: PointOrderActionInput = {}) {
    const dispute = await this.requireDispute(id);
    this.assertPendingChecker(dispute);
    this.assertDifferentChecker(dispute, input);

    return this.updateDispute(
      id,
      dispute,
      {
        status: 'reviewing',
        makerCheckerStatus: 'rejected',
        checkedBy: pointOrderActorId(input),
        checkedAt: new Date().toISOString(),
        checkerNote:
          input.reason?.trim() || input.note?.trim() || 'Resolucion devuelta por checker.',
      },
      'dispute_resolution_rejected',
      input,
      'RETURN_TO_MAKER_REVIEW',
    );
  }

  async executeApprovedResolution(id: string, input: PointOrderActionInput = {}) {
    const dispute = await this.requireDispute(id);
    this.assertApprovedForExecution(dispute);

    if (
      [
        'executed_noop',
        'executed_cancelled',
        'executed_refunded',
        'executed_released_to_point',
        'failed_review_required',
        'blocked',
      ].includes(
        dispute.resolutionExecutionStatus ?? 'not_started',
      )
    ) {
      return {
        dispute,
        nextRequiredAction: this.nextActionForExecutionStatus(
          dispute.resolutionExecutionStatus,
        ),
        idempotent: true,
        source: 'mongo-persistent',
      };
    }

    if ((dispute.resolution ?? 'manual_review') === 'cancel_order') {
      return this.executeCancelOrderResolution(id, dispute, input);
    }

    if ((dispute.resolution ?? 'manual_review') === 'refund_user') {
      return this.executeRefundUserResolution(id, dispute, input);
    }

    if ((dispute.resolution ?? 'manual_review') === 'release_to_point') {
      return this.executeReleaseToPointResolution(id, dispute, input);
    }

    const execution = this.buildExecutionPlan(dispute);
    return this.updateDispute(
      id,
      dispute,
      {
        resolutionExecutionStatus: execution.status,
        resolutionExecutionPlan: execution.plan,
        resolutionExecutionId: `pd-dispute-exec-${id}-${Date.now()}`,
        executedBy: pointOrderActorId(input),
        executedAt: new Date().toISOString(),
        executionNote: input.note?.trim() || input.reason?.trim(),
      },
      'dispute_resolution_execution_staged',
      {
        ...input,
        reason: input.reason || execution.plan,
      },
      execution.nextRequiredAction,
    );
  }

  private async executeCancelOrderResolution(
    id: string,
    dispute: PointDisputeEntity,
    input: PointOrderActionInput = {},
  ) {
    const executionId = `pd-dispute-exec-${id}-${Date.now()}`;
    const executionInput = {
      ...input,
      actorRole: input.actorRole || 'admin',
      reason:
        input.reason ||
        `Approved dispute ${id} resolved as cancel_order. Release any ledger hold before cancellation.`,
    };

    try {
      const cancellation = await this.orderOperations.cancelAfterApprovedDispute(
        dispute.orderId,
        executionInput,
      );

      const result = await this.updateDispute(
        id,
        dispute,
        {
          resolutionExecutionStatus: 'executed_cancelled',
          resolutionExecutionPlan:
            'Executed cancellation path through order executor. Ledger hold release is delegated to wallet-ledger when required.',
          resolutionExecutionId: executionId,
          executedBy: pointOrderActorId(input),
          executedAt: new Date().toISOString(),
          executionNote: input.note?.trim() || input.reason?.trim(),
        },
        'dispute_resolution_execution_cancelled',
        {
          ...executionInput,
          reason: executionInput.reason,
        },
        'ORDER_CANCELLED_BY_APPROVED_DISPUTE',
      );

      return {
        ...result,
        cancellation,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown cancellation error';
      return this.updateDispute(
        id,
        dispute,
        {
          resolutionExecutionStatus: 'failed_review_required',
          resolutionExecutionPlan:
            'Cancellation executor could not finish safely. Admin review is required before any economic mutation continues.',
          resolutionExecutionId: executionId,
          executedBy: pointOrderActorId(input),
          executedAt: new Date().toISOString(),
          executionNote: message,
        },
        'dispute_resolution_execution_review_required',
        {
          ...executionInput,
          reason: message,
        },
        'WAIT_FOR_ADMIN_LEDGER_REVIEW',
      );
    }
  }

  private async executeRefundUserResolution(
    id: string,
    dispute: PointDisputeEntity,
    input: PointOrderActionInput = {},
  ) {
    const executionId = `pd-dispute-exec-${id}-${Date.now()}`;
    const executionInput = {
      ...input,
      actorRole: input.actorRole || 'admin',
      reason:
        input.reason ||
        `Approved dispute ${id} resolved as refund_user. Release user ledger hold when available.`,
    };

    try {
      const refund = await this.orderOperations.refundUserAfterApprovedDispute(
        dispute.orderId,
        executionInput,
      );

      const result = await this.updateDispute(
        id,
        dispute,
        {
          resolutionExecutionStatus: 'executed_refunded',
          resolutionExecutionPlan:
            'Executed refund path through order executor. Only confirmed ledger holds are released automatically; non-hold refunds require review.',
          resolutionExecutionId: executionId,
          executedBy: pointOrderActorId(input),
          executedAt: new Date().toISOString(),
          executionNote: input.note?.trim() || input.reason?.trim(),
        },
        'dispute_resolution_execution_refunded_user',
        {
          ...executionInput,
          reason: executionInput.reason,
        },
        'USER_REFUNDED_BY_LEDGER_HOLD_RELEASE',
      );

      return {
        ...result,
        refund,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown refund error';
      const economicAction = await this.queueNoHoldEconomicAction(
        id,
        dispute,
        'refund_user',
        executionId,
        message,
        input,
      );
      const result = await this.updateDispute(
        id,
        dispute,
        {
          resolutionExecutionStatus: 'failed_review_required',
          resolutionExecutionPlan: economicAction
            ? 'Refund executor did not find a confirmed ledger hold. A controlled economic action was registered for custody/ledger review before any balance mutation.'
            : 'Refund executor could not finish safely. Admin review is required before any economic mutation continues.',
          resolutionExecutionId: executionId,
          executedBy: pointOrderActorId(input),
          executedAt: new Date().toISOString(),
          executionNote: message,
        },
        'dispute_resolution_execution_review_required',
        {
          ...executionInput,
          reason: message,
        },
        economicAction
          ? 'ECONOMIC_ACTION_PENDING_CUSTODY_OR_LEDGER_REVIEW'
          : 'WAIT_FOR_ADMIN_LEDGER_REVIEW',
      );

      return economicAction ? { ...result, economicAction } : result;
    }
  }

  private async executeReleaseToPointResolution(
    id: string,
    dispute: PointDisputeEntity,
    input: PointOrderActionInput = {},
  ) {
    const executionId = `pd-dispute-exec-${id}-${Date.now()}`;
    const executionInput = {
      ...input,
      actorRole: input.actorRole || 'admin',
      reason:
        input.reason ||
        `Approved dispute ${id} resolved as release_to_point. Capture user ledger hold when available.`,
    };

    try {
      const pointRelease =
        await this.orderOperations.releaseToPointAfterApprovedDispute(
          dispute.orderId,
          executionInput,
        );

      const result = await this.updateDispute(
        id,
        dispute,
        {
          resolutionExecutionStatus: 'executed_released_to_point',
          resolutionExecutionPlan:
            'Executed point-release path through order executor. Confirmed ledger hold is captured and order moves to settlement reconciliation.',
          resolutionExecutionId: executionId,
          executedBy: pointOrderActorId(input),
          executedAt: new Date().toISOString(),
          executionNote: input.note?.trim() || input.reason?.trim(),
        },
        'dispute_resolution_execution_released_to_point',
        {
          ...executionInput,
          reason: executionInput.reason,
        },
        'POINT_RELEASE_READY_FOR_SETTLEMENT_RECONCILIATION',
      );

      return {
        ...result,
        pointRelease,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown point release error';
      const economicAction = await this.queueNoHoldEconomicAction(
        id,
        dispute,
        'release_to_point',
        executionId,
        message,
        input,
      );
      const result = await this.updateDispute(
        id,
        dispute,
        {
          resolutionExecutionStatus: 'failed_review_required',
          resolutionExecutionPlan: economicAction
            ? 'Point release executor did not find a confirmed ledger hold. A controlled economic action was registered for custody/ledger review before any payout or settlement adjustment.'
            : 'Point release executor could not finish safely. Admin review is required before any economic mutation continues.',
          resolutionExecutionId: executionId,
          executedBy: pointOrderActorId(input),
          executedAt: new Date().toISOString(),
          executionNote: message,
        },
        'dispute_resolution_execution_review_required',
        {
          ...executionInput,
          reason: message,
        },
        economicAction
          ? 'ECONOMIC_ACTION_PENDING_CUSTODY_OR_LEDGER_REVIEW'
          : 'WAIT_FOR_ADMIN_LEDGER_REVIEW',
      );

      return economicAction ? { ...result, economicAction } : result;
    }
  }

  async rejectDispute(id: string, input: PointOrderActionInput = {}) {
    const dispute = await this.requireDispute(id);
    this.assertOpenForResolution(dispute.status);

    return this.updateDispute(
      id,
      dispute,
      {
        status: 'rejected',
        assignedTo: dispute.assignedTo ?? pointOrderActorId(input),
        resolution: 'no_action',
        resolutionReason:
          input.reason?.trim() || input.note?.trim() || 'Disputa rechazada por administracion.',
        adminNote: input.note?.trim(),
        rejectedAt: new Date().toISOString(),
      },
      'dispute_rejected',
      input,
      'ORDER_REMAINS_IN_ADMIN_REVIEW_HISTORY',
    );
  }

  private async requireDispute(id: string) {
    try {
      const dispute = await this.disputeModel.findOne({ id }).lean();
      if (!dispute) {
        throw new NotFoundException(`Point Deco dispute not found: ${id}`);
      }
      return dispute as PointDisputeEntity;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco dispute workflow.',
      );
    }
  }

  private assertOpenForReview(status: DisputeStatus) {
    if (status !== 'open') {
      throw new BadRequestException({
        message: 'Only open disputes can enter review',
        status,
      });
    }
  }

  private assertOpenForResolution(status: DisputeStatus) {
    if (!['open', 'reviewing'].includes(status)) {
      throw new BadRequestException({
        message: 'Only open or reviewing disputes can be resolved',
        status,
      });
    }
  }

  private assertPendingChecker(dispute: PointDisputeEntity) {
    if (
      dispute.status !== 'resolved' ||
      dispute.makerCheckerStatus !== 'pending_checker'
    ) {
      throw new BadRequestException({
        message: 'Only resolved disputes pending checker can be applied',
        status: dispute.status,
        makerCheckerStatus: dispute.makerCheckerStatus,
      });
    }
  }

  private assertApprovedForExecution(dispute: PointDisputeEntity) {
    if (
      dispute.status !== 'resolved' ||
      dispute.makerCheckerStatus !== 'approved'
    ) {
      throw new BadRequestException({
        message: 'Only approved maker-checker dispute resolutions can be executed',
        status: dispute.status,
        makerCheckerStatus: dispute.makerCheckerStatus,
      });
    }
  }

  private assertDifferentChecker(dispute: PointDisputeEntity, input: PointOrderActionInput) {
    const checker = pointOrderActorId(input);
    if (dispute.preparedBy && dispute.preparedBy === checker) {
      throw new BadRequestException({
        message: 'Maker and checker must be different administrators',
        preparedBy: dispute.preparedBy,
        checkedBy: checker,
      });
    }
  }

  private async updateDispute(
    id: string,
    current: PointDisputeEntity,
    setPatch: Partial<PointDisputeEntity>,
    action: string,
    input: PointOrderActionInput,
    nextRequiredAction: string,
  ) {
    const event = this.buildAuditEvent(action, current.status, setPatch.status, input);

    try {
      const dispute = await this.disputeModel
        .findOneAndUpdate(
          { id },
          {
            $set: setPatch,
            $push: { auditTrail: event },
          },
          { new: true },
        )
        .lean();

      if (!dispute) {
        throw new NotFoundException(`Point Deco dispute not found: ${id}`);
      }

      await this.orderModel.updateOne(
        { id: current.orderId },
        {
          $push: {
            auditTrail: {
              ...event,
              disputeId: id,
            },
          },
        },
      );

      return {
        dispute,
        auditEvent: event,
        nextRequiredAction,
        source: 'mongo-persistent',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco dispute workflow.',
      );
    }
  }

  private async queueNoHoldEconomicAction(
    disputeId: string,
    dispute: PointDisputeEntity,
    resolution: PointEconomicActionResolution,
    executionId: string,
    message: string,
    input: PointOrderActionInput,
  ) {
    const order = await this.orderModel.findOne({ id: dispute.orderId }).lean();
    if (!order || !this.needsEconomicActionWithoutConfirmedHold(order, resolution)) {
      return null;
    }

    const result = await this.economicActionService.createNoHoldAction({
      dispute,
      order: order as PointOrderEntity,
      resolution,
      sourceExecutionId: executionId,
      reason: message,
      actionInput: input,
    });

    return result.action;
  }

  private needsEconomicActionWithoutConfirmedHold(
    order: PointOrderEntity,
    resolution: PointEconomicActionResolution,
  ) {
    const status = order.ledgerHoldStatus ?? 'not_required';
    const confirmedStatuses =
      resolution === 'refund_user' ? ['held', 'released'] : ['held', 'captured'];

    return !order.requiresLedgerHold || !confirmedStatuses.includes(status);
  }

  private buildAuditEvent(
    action: string,
    from: DisputeStatus,
    to: DisputeStatus | undefined,
    input: PointOrderActionInput,
  ) {
    return {
      action,
      from,
      to: to ?? from,
      actorId: pointOrderActorId(input),
      actorRole: input.actorRole || 'admin',
      reason: input.reason?.trim() || input.note?.trim() || null,
      evidenceRefs: input.evidenceRefs ?? [],
      at: new Date().toISOString(),
    };
  }

  private buildExecutionPlan(dispute: PointDisputeEntity) {
    const resolution = dispute.resolution ?? 'manual_review';
    const map: Record<
      NonNullable<PointDisputeEntity['resolution']>,
      {
        status: PointDisputeEntity['resolutionExecutionStatus'];
        plan: string;
        nextRequiredAction: string;
      }
    > = {
      refund_user: {
        status: 'queued_for_executor',
        plan:
          'Queue refund path: release/capture ledger hold only through controlled ledger and custody executor.',
        nextRequiredAction: 'RUN_LEDGER_OR_CUSTODY_REFUND_EXECUTOR',
      },
      release_to_point: {
        status: 'queued_for_executor',
        plan:
          'Queue point settlement path: reconcile cash evidence before releasing value to the Punto Deco.',
        nextRequiredAction: 'RUN_POINT_SETTLEMENT_EXECUTOR',
      },
      cancel_order: {
        status: 'queued_for_executor',
        plan:
          'Queue cancellation path: release any ledger hold and mark order cancelled through order executor.',
        nextRequiredAction: 'RUN_CANCEL_AND_RELEASE_EXECUTOR',
      },
      manual_review: {
        status: 'blocked',
        plan:
          'Manual review remains required. No automated economic action is allowed for this resolution.',
        nextRequiredAction: 'KEEP_ADMIN_MANUAL_REVIEW',
      },
      no_action: {
        status: 'executed_noop',
        plan: 'No economic action required. Dispute resolution is closed as operational evidence.',
        nextRequiredAction: 'NO_ECONOMIC_ACTION_REQUIRED',
      },
    };

    return map[resolution];
  }

  private nextActionForExecutionStatus(
    status: PointDisputeEntity['resolutionExecutionStatus'],
  ) {
    const map: Record<
      NonNullable<PointDisputeEntity['resolutionExecutionStatus']>,
      string
    > = {
      not_started: 'RUN_APPROVED_RESOLUTION_EXECUTOR',
      queued_for_executor: 'WAIT_FOR_DOWNSTREAM_EXECUTOR',
      executed_noop: 'NO_ECONOMIC_ACTION_REQUIRED',
      executed_cancelled: 'ORDER_CANCELLED_BY_APPROVED_DISPUTE',
      executed_refunded: 'USER_REFUNDED_BY_LEDGER_HOLD_RELEASE',
      executed_released_to_point: 'POINT_RELEASE_READY_FOR_SETTLEMENT_RECONCILIATION',
      failed_review_required: 'WAIT_FOR_ADMIN_LEDGER_REVIEW',
      blocked: 'KEEP_ADMIN_MANUAL_REVIEW',
    };

    return map[status ?? 'not_started'];
  }
}

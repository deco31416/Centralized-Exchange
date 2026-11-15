import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PointService } from './points-deco.interfaces';
import { amountToMinorUnits } from './points-deco-money';
import { PointOrderEntity } from './schemas/point-order.schema';
import { PointEconomicActionEntity } from './schemas/point-economic-action.schema';

type LedgerHoldAction = 'hold' | 'release' | 'capture';

@Injectable()
export class PointsDecoLedgerService {
  constructor(private readonly configService: ConfigService) {}

  requiresHold(type: PointService) {
    return ['cash_out', 'remittance'].includes(type);
  }

  holdOrder(order: PointOrderEntity) {
    return this.requestHoldMutation('hold', order);
  }

  releaseOrder(order: PointOrderEntity, reason = 'Puntos Deco order cancelled') {
    return this.requestHoldMutation('release', order, reason);
  }

  captureOrder(order: PointOrderEntity, reason = 'Puntos Deco cash delivered') {
    return this.requestHoldMutation('capture', order, reason);
  }

  async applyEconomicAction(action: PointEconomicActionEntity) {
    const ledgerAction = this.buildEconomicActionLedgerShape(action);

    if (ledgerAction.requiresReview) {
      return {
        status: 'manual_review_required',
        requiresReview: true,
        reason: ledgerAction.reason,
      };
    }

    const eventId = this.economicActionEventId(action.id);
    const amountMinorUnits = amountToMinorUnits(ledgerAction.amount, ledgerAction.currency);

    try {
      const response = await fetch(`${this.baseUrl()}/internal/ledger/points-deco/economic-actions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-internal-auth': this.internalAuthToken(),
          'x-correlation-id': action.id,
        },
        body: JSON.stringify({
          eventId,
          correlationId: action.id,
          actionId: action.id,
          actionType: action.actionType,
          userId: ledgerAction.userId,
          pointId: ledgerAction.pointId,
          currency: ledgerAction.currency,
          amountMinorUnits,
          externalRef: {
            domain: 'points-deco',
            actionId: action.id,
            disputeId: action.disputeId,
            orderId: action.orderId,
            pointId: action.pointId,
            resolution: action.resolution,
            sourceExecutionId: action.sourceExecutionId,
            settlementDestination: ledgerAction.settlementDestination,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        return this.economicActionReviewRequired(action.id, eventId, amountMinorUnits, {
          statusCode: response.status,
          payload,
        });
      }

      return {
        status: payload.status === 'duplicate' ? 'duplicate' : 'applied',
        requiresReview: false,
        eventId,
        currency: ledgerAction.currency,
        amountMinorUnits,
        txId: payload.txId,
        accountId: payload.accountId,
        accountNumber: payload.accountNumber,
        response: payload,
      };
    } catch (error) {
      return this.economicActionReviewRequired(action.id, eventId, amountMinorUnits, {
        message: error instanceof Error ? error.message : 'Unknown ledger economic action error',
      });
    }
  }

  buildHoldShape(order: Pick<PointOrderEntity, 'id' | 'type' | 'originCurrency' | 'amountOrigin'>) {
    const requiresLedgerHold = this.requiresHold(order.type);
    const ledgerHoldAmountMinorUnits = requiresLedgerHold
      ? amountToMinorUnits(order.amountOrigin, order.originCurrency)
      : undefined;

    return {
      requiresLedgerHold,
      ledgerHoldStatus: requiresLedgerHold ? 'pending' : 'not_required',
      ledgerHoldCurrency: requiresLedgerHold ? order.originCurrency : undefined,
      ledgerHoldAmountMinorUnits,
      ledgerHoldEventId: requiresLedgerHold ? this.eventId(order.id, 'hold') : undefined,
    };
  }

  private async requestHoldMutation(
    action: LedgerHoldAction,
    order: PointOrderEntity,
    reason?: string,
  ) {
    if (!this.requiresHold(order.type)) {
      return {
        status: 'skipped',
        requiresReview: false,
        reason: 'Ledger hold not required for this Puntos Deco service type.',
      };
    }

    const amountMinorUnits =
      order.ledgerHoldAmountMinorUnits ??
      amountToMinorUnits(order.amountOrigin, order.originCurrency);
    const eventId = this.eventId(order.id, action);
    const path =
      action === 'hold'
        ? '/internal/ledger/holds'
        : action === 'release'
          ? '/internal/ledger/holds/release'
          : '/internal/ledger/holds/capture';

    try {
      const response = await fetch(`${this.baseUrl()}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-internal-auth': this.internalAuthToken(),
          'x-correlation-id': order.id,
        },
        body: JSON.stringify({
          eventId,
          correlationId: order.id,
          userId: order.userId,
          currency: order.originCurrency,
          amountMinorUnits,
          externalRef: {
            domain: 'points-deco',
            orderId: order.id,
            pointId: order.pointId,
            serviceType: order.type,
            reason,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        return this.reviewRequired(action, eventId, amountMinorUnits, {
          statusCode: response.status,
          payload,
        });
      }

      return {
        status: this.statusFor(action),
        requiresReview: false,
        eventId,
        amountMinorUnits,
        txId: payload.txId,
        response: payload,
      };
    } catch (error) {
      return this.reviewRequired(action, eventId, amountMinorUnits, {
        message: error instanceof Error ? error.message : 'Unknown ledger error',
      });
    }
  }

  private reviewRequired(
    action: LedgerHoldAction,
    eventId: string,
    amountMinorUnits: string,
    error: Record<string, unknown>,
  ) {
    const failMode = this.configService.get<string>('POINTS_DECO_LEDGER_FAIL_MODE') ?? 'review';
    return {
      status: failMode === 'closed' ? 'failed' : 'review_required',
      requiresReview: true,
      action,
      eventId,
      amountMinorUnits,
      error,
    };
  }

  private statusFor(action: LedgerHoldAction) {
    const map: Record<LedgerHoldAction, string> = {
      hold: 'held',
      release: 'released',
      capture: 'captured',
    };
    return map[action];
  }

  private eventId(orderId: string, action: LedgerHoldAction) {
    return `points-deco:${orderId}:ledger-${action}:v1`;
  }

  private economicActionEventId(actionId: string) {
    return `points-deco:${actionId}:ledger-economic-action:v1`;
  }

  private buildEconomicActionLedgerShape(action: PointEconomicActionEntity):
    | {
        requiresReview: false;
        actionType: PointEconomicActionEntity['actionType'];
        currency: string;
        amount: number;
        userId?: string;
        pointId?: string;
        settlementDestination: 'user_wallet' | 'point_settlement_account';
      }
    | { requiresReview: true; reason: string } {
    if (action.resolution === 'refund_user' && action.actionType === 'non_hold_refund') {
      if (!action.userId || !action.destinationCurrency || !action.amountDestinationEstimated) {
        return {
          requiresReview: true,
          reason:
            'Missing user, destination currency or destination amount for automatic Puntos Deco user refund.',
        };
      }

      return {
        requiresReview: false,
        actionType: action.actionType,
        currency: action.destinationCurrency,
        amount: action.amountDestinationEstimated,
        userId: action.userId,
        settlementDestination: 'user_wallet',
      };
    }

    if (action.resolution === 'release_to_point' && action.actionType === 'non_hold_point_payout') {
      if (!action.pointId || !action.originCurrency || !action.amountOrigin) {
        return {
          requiresReview: true,
          reason:
            'Missing point, origin currency or origin amount for automatic Puntos Deco point settlement payout.',
        };
      }

      return {
        requiresReview: false,
        actionType: action.actionType,
        currency: action.originCurrency,
        amount: action.amountOrigin,
        pointId: action.pointId,
        settlementDestination: 'point_settlement_account',
      };
    }

    return {
      requiresReview: true,
      reason: 'Unsupported Puntos Deco economic action for automatic ledger adapter.',
    };
  }

  private economicActionReviewRequired(
    actionId: string,
    eventId: string,
    amountMinorUnits: string,
    error: Record<string, unknown>,
  ) {
    const failMode = this.configService.get<string>('POINTS_DECO_LEDGER_FAIL_MODE') ?? 'review';
    return {
      status: failMode === 'closed' ? 'failed' : 'review_required',
      requiresReview: true,
      actionId,
      eventId,
      amountMinorUnits,
      error,
    };
  }

  private baseUrl() {
    const url =
      this.configService.get<string>('WALLET_LEDGER_SERVICE_URL') ??
      'http://localhost:9001/api/v1';
    return url.replace(/\/+$/, '');
  }

  private internalAuthToken() {
    return this.configService.get<string>('INTERNAL_AUTH_TOKEN') ?? 'change-me';
  }
}

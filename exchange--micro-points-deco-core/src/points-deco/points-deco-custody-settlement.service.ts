import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PointEconomicActionEntity } from './schemas/point-economic-action.schema';
import { amountToMinorUnits } from './points-deco-money';

@Injectable()
export class PointsDecoCustodySettlementService {
  constructor(private readonly configService: ConfigService) {}

  async prepareEconomicAction(action: PointEconomicActionEntity) {
    if (
      action.resolution !== 'release_to_point' ||
      action.actionType !== 'non_hold_point_payout'
    ) {
      return {
        status: 'skipped',
        requiresReview: false,
        reason: 'Custody fiat settlement intent is only required for point payouts.',
      };
    }

    const shape = this.buildSettlementIntentShape(action);
    if (shape.requiresReview) {
      return {
        status: 'manual_review_required',
        requiresReview: true,
        reason: shape.reason,
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl()}/internal/points-deco/settlement-intents`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-internal-auth': this.internalAuthToken(),
            'x-correlation-id': action.id,
          },
          body: JSON.stringify(shape.body),
        },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        return this.reviewRequired(action.id, shape.body.eventId, {
          statusCode: response.status,
          payload,
        });
      }

      return {
        status: payload.status === 'duplicate' ? 'duplicate' : 'registered',
        requiresReview: false,
        eventId: shape.body.eventId,
        intentId: payload.intent?.id,
        providerHint: payload.intent?.providerHint,
        providerMode: payload.intent?.providerMode,
        response: payload,
      };
    } catch (error) {
      return this.reviewRequired(action.id, shape.body.eventId, {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown custody fiat settlement intent error',
      });
    }
  }

  private buildSettlementIntentShape(action: PointEconomicActionEntity):
    | {
        requiresReview: false;
        body: {
          eventId: string;
          correlationId: string;
          actionId: string;
          orderId: string;
          pointId: string;
          currency: string;
          amountMinorUnits: string;
          reason: string;
          externalRef: Record<string, unknown>;
        };
      }
    | { requiresReview: true; reason: string } {
    if (!action.pointId || !action.originCurrency || !action.amountOrigin) {
      return {
        requiresReview: true,
        reason:
          'Missing point, origin currency or origin amount for custody fiat settlement intent.',
      };
    }

    return {
      requiresReview: false,
      body: {
        eventId: this.eventId(action.id),
        correlationId: action.id,
        actionId: action.id,
        orderId: action.orderId,
        pointId: action.pointId,
        currency: action.originCurrency,
        amountMinorUnits: amountToMinorUnits(action.amountOrigin, action.originCurrency),
        reason: action.reason,
        externalRef: {
          domain: 'points-deco',
          actionId: action.id,
          disputeId: action.disputeId,
          orderId: action.orderId,
          pointId: action.pointId,
          resolution: action.resolution,
          sourceExecutionId: action.sourceExecutionId,
        },
      },
    };
  }

  private reviewRequired(
    actionId: string,
    eventId: string,
    error: Record<string, unknown>,
  ) {
    const failMode =
      this.configService.get<string>('POINTS_DECO_CUSTODY_FIAT_FAIL_MODE') ??
      'review';
    return {
      status: failMode === 'closed' ? 'failed' : 'review_required',
      requiresReview: true,
      actionId,
      eventId,
      error,
    };
  }

  private eventId(actionId: string) {
    return `points-deco:${actionId}:custody-settlement-intent:v1`;
  }

  private baseUrl() {
    const url =
      this.configService.get<string>('CUSTODY_FIAT_SERVICE_URL') ??
      'http://localhost:9002/api/v1';
    return url.replace(/\/+$/, '');
  }

  private internalAuthToken() {
    return this.configService.get<string>('INTERNAL_AUTH_TOKEN') ?? 'change-me';
  }
}

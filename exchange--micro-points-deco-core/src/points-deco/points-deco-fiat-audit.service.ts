import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PointOrderEntity } from './schemas/point-order.schema';
import { PointSettlementEntity } from './schemas/point-settlement.schema';

type FiatEvidenceType = 'cash_received' | 'cash_delivered';

type CashMovementResult = {
  movement?: {
    orderId?: string;
    pointId?: string;
    currency?: string;
    amountMinorUnits?: string;
    balanceBeforeMinorUnits?: string;
    balanceAfterMinorUnits?: string;
    actorId?: string;
    actorRole?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  };
  status?: string;
  reason?: string;
};

@Injectable()
export class PointsDecoFiatAuditService {
  constructor(private readonly configService: ConfigService) {}

  async recordCashMovement(
    order: PointOrderEntity,
    cashMovement: CashMovementResult,
    type: FiatEvidenceType,
  ) {
    if (cashMovement.status === 'skipped' || !cashMovement.movement) {
      return {
        status: 'skipped',
        reason: cashMovement.reason || 'No cash movement available for fiat audit.',
      };
    }

    const movement = cashMovement.movement;
    const serviceUrl = this.configService.get<string>('AUDIT_FIAT_FLOWS_SERVICE_URL');
    const baseUrl = (serviceUrl || 'http://localhost:9034/api/v1').replace(/\/$/, '');
    const internalToken = this.configService.get<string>('INTERNAL_AUTH_TOKEN') || '';

    try {
      const response = await fetch(`${baseUrl}/audit-fiat-flows/evidence/points-deco`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-internal-auth': internalToken,
          'x-internal-auth-token': internalToken,
          authorization: `Bearer ${internalToken}`,
        },
        body: JSON.stringify({
          orderId: movement.orderId || order.id,
          pointId: movement.pointId || order.pointId,
          type,
          currency: movement.currency,
          amountMinorUnits: movement.amountMinorUnits,
          balanceBeforeMinorUnits: movement.balanceBeforeMinorUnits,
          balanceAfterMinorUnits: movement.balanceAfterMinorUnits,
          actorId: movement.actorId,
          actorRole: movement.actorRole,
          reason: movement.reason,
          metadata: {
            ...(movement.metadata || {}),
            orderStatus: order.status,
            serviceType: order.type,
            userId: order.userId,
            ledgerHoldStatus: order.ledgerHoldStatus,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          status: 'review_required',
          service: 'audit-fiat-flows',
          statusCode: response.status,
          error: data,
        };
      }

      return {
        status: 'recorded',
        service: 'audit-fiat-flows',
        evidence: data,
      };
    } catch (error) {
      return {
        status: 'review_required',
        service: 'audit-fiat-flows',
        error: error instanceof Error ? error.message : 'Unknown fiat audit error',
      };
    }
  }

  async recordSettlement(order: PointOrderEntity, settlement: PointSettlementEntity) {
    const serviceUrl = this.configService.get<string>('AUDIT_FIAT_FLOWS_SERVICE_URL');
    const baseUrl = (serviceUrl || 'http://localhost:9034/api/v1').replace(/\/$/, '');
    const internalToken = this.configService.get<string>('INTERNAL_AUTH_TOKEN') || '';

    try {
      const response = await fetch(`${baseUrl}/audit-fiat-flows/reconciliation/points-deco`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-internal-auth': internalToken,
          'x-internal-auth-token': internalToken,
          authorization: `Bearer ${internalToken}`,
        },
        body: JSON.stringify({
          orderId: settlement.orderId || order.id,
          settlementId: settlement.id,
          pointId: settlement.pointId || order.pointId,
          type: settlement.type || order.type,
          status: settlement.status,
          originCurrency: settlement.originCurrency,
          destinationCurrency: settlement.destinationCurrency,
          expectedOriginMinorUnits: settlement.expectedOriginMinorUnits,
          actualReceivedMinorUnits: settlement.actualReceivedMinorUnits,
          originDifferenceMinorUnits: settlement.originDifferenceMinorUnits,
          expectedDestinationMinorUnits: settlement.expectedDestinationMinorUnits,
          actualDeliveredMinorUnits: settlement.actualDeliveredMinorUnits,
          destinationDifferenceMinorUnits: settlement.destinationDifferenceMinorUnits,
          ledgerStatus: settlement.ledgerStatus,
          approvalStatus: settlement.approvalStatus,
          fiscalReportStatus: settlement.fiscalReportStatus,
          reviewReasons: settlement.reviewReasons,
          generatedBy: settlement.generatedBy,
          generatedByRole: settlement.generatedByRole,
          reconciledAt: settlement.completedAt || settlement.generatedAt,
          metadata: {
            ...(settlement.metadata || {}),
            orderStatus: order.status,
            serviceType: order.type,
            userId: order.userId,
            pricingSource: order.pricingSource,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          status: 'review_required',
          service: 'audit-fiat-flows',
          statusCode: response.status,
          error: data,
        };
      }

      return {
        status: 'recorded',
        service: 'audit-fiat-flows',
        reconciliation: data,
      };
    } catch (error) {
      return {
        status: 'review_required',
        service: 'audit-fiat-flows',
        error: error instanceof Error ? error.message : 'Unknown fiat audit error',
      };
    }
  }
}

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PointCashMovementEntity } from './schemas/point-cash-movement.schema';
import { PointDisputeEntity } from './schemas/point-dispute.schema';
import { PointEconomicActionEntity } from './schemas/point-economic-action.schema';
import { PointOrderEntity } from './schemas/point-order.schema';
import { PointSettlementEntity } from './schemas/point-settlement.schema';

type FiscalReportQuery = Record<string, string | undefined>;

@Injectable()
export class PointsDecoReportService {
  constructor(
    @InjectModel(PointSettlementEntity.name)
    private readonly settlementModel: Model<PointSettlementEntity>,
    @InjectModel(PointOrderEntity.name)
    private readonly orderModel: Model<PointOrderEntity>,
    @InjectModel(PointCashMovementEntity.name)
    private readonly cashMovementModel: Model<PointCashMovementEntity>,
    @InjectModel(PointDisputeEntity.name)
    private readonly disputeModel: Model<PointDisputeEntity>,
    @InjectModel(PointEconomicActionEntity.name)
    private readonly economicActionModel: Model<PointEconomicActionEntity>,
  ) {}

  catalog() {
    return {
      items: [
        {
          id: 'points-deco-fiscal-summary',
          name: 'Resumen fiscal Puntos Deco',
          status: 'connected',
          exports: ['json', 'csv'],
        },
        {
          id: 'point-commission-summary',
          name: 'Resumen mensual por Punto Deco',
          status: 'connected',
          exports: ['json', 'csv'],
        },
        {
          id: 'points-deco-audit-export',
          name: 'Export de auditoria Puntos Deco',
          status: 'connected',
          exports: ['json', 'csv'],
        },
      ],
      compliance:
        'Los reportes finales cruzan liquidaciones, ledger y auditoria fiat antes de exportar evidencia.',
      updatedAt: new Date().toISOString(),
    };
  }

  async fiscalSummary(query: FiscalReportQuery) {
    const settlements = await this.listSettlements(query);
    const readyForExport = settlements.filter(
      (settlement) => settlement.fiscalReportStatus === 'ready_for_export',
    );
    const reviewRequired = settlements.filter(
      (settlement) => settlement.status === 'review_required',
    );

    return {
      summary: {
        settlements: settlements.length,
        readyForExport: readyForExport.length,
        reviewRequired: reviewRequired.length,
        balanced: settlements.filter((settlement) => settlement.status === 'balanced').length,
        originDifferenceMinorUnits: this.sumField(settlements, 'originDifferenceMinorUnits'),
        destinationDifferenceMinorUnits: this.sumField(
          settlements,
          'destinationDifferenceMinorUnits',
        ),
      },
      filters: this.reportFilters(query),
      items: settlements.map((settlement) => this.toFiscalRow(settlement)),
      source: 'mongo-persistent',
      generatedAt: new Date().toISOString(),
    };
  }

  async fiscalCsv(query: FiscalReportQuery) {
    const settlements = await this.listSettlements(query);
    const rows = settlements.map((settlement) => this.toFiscalRow(settlement));
    const headers = [
      'settlementId',
      'orderId',
      'pointId',
      'type',
      'status',
      'originCurrency',
      'expectedOriginMinorUnits',
      'actualReceivedMinorUnits',
      'originDifferenceMinorUnits',
      'destinationCurrency',
      'expectedDestinationMinorUnits',
      'actualDeliveredMinorUnits',
      'destinationDifferenceMinorUnits',
      'ledgerStatus',
      'approvalStatus',
      'fiscalReportStatus',
      'reviewReasons',
      'completedAt',
      'generatedAt',
    ];

    return [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((header) => this.csvCell(row[header as keyof typeof row])).join(','),
      ),
    ].join('\n');
  }

  async monthlyPointSummary(query: FiscalReportQuery) {
    const settlements = await this.listSettlements(query);
    const items = this.toMonthlyRows(settlements, query.month);

    return {
      summary: {
        groups: items.length,
        settlements: items.reduce((total, item) => total + item.settlements, 0),
        readyForExport: items.reduce((total, item) => total + item.readyForExport, 0),
        reviewRequired: items.reduce((total, item) => total + item.reviewRequired, 0),
      },
      filters: this.reportFilters(query),
      items,
      source: 'mongo-persistent',
      generatedAt: new Date().toISOString(),
    };
  }

  async monthlyPointCsv(query: FiscalReportQuery) {
    const report = await this.monthlyPointSummary(query);
    const headers = [
      'month',
      'pointId',
      'originCurrency',
      'destinationCurrency',
      'settlements',
      'balanced',
      'reviewRequired',
      'readyForExport',
      'expectedOriginMinorUnits',
      'actualReceivedMinorUnits',
      'originDifferenceMinorUnits',
      'expectedDestinationMinorUnits',
      'actualDeliveredMinorUnits',
      'destinationDifferenceMinorUnits',
    ];

    return [
      headers.join(','),
      ...report.items.map((row) =>
        headers.map((header) => this.csvCell(row[header as keyof typeof row])).join(','),
      ),
    ].join('\n');
  }

  async auditExport(query: FiscalReportQuery) {
    try {
      const limit = Math.min(Math.max(Number(query.limit ?? 100), 1), 500);
      const orderFilter: Record<string, string> = {};
      if (query.orderId) orderFilter.id = query.orderId;
      if (query.pointId) orderFilter.pointId = query.pointId;
      if (query.status) orderFilter.status = query.status;

      const orders = (await this.orderModel
        .find(orderFilter)
        .sort({ createdAt: -1, statusChangedAt: -1 })
        .limit(limit)
        .lean()) as PointOrderEntity[];
      const orderIds = orders.map((order) => order.id);
      const pointIds = Array.from(
        new Set(orders.map((order) => order.pointId).filter(Boolean) as string[]),
      );

      const [settlements, movements, disputes, economicActions] = await Promise.all([
        this.settlementModel.find({ orderId: { $in: orderIds } }).lean(),
        this.cashMovementModel.find({ orderId: { $in: orderIds } }).lean(),
        this.disputeModel.find({ orderId: { $in: orderIds } }).lean(),
        this.economicActionModel.find({ orderId: { $in: orderIds } }).lean(),
      ]);

      const rows = orders.map((order) =>
        this.toAuditRow(
          order,
          settlements as PointSettlementEntity[],
          movements as PointCashMovementEntity[],
          disputes as PointDisputeEntity[],
          economicActions as PointEconomicActionEntity[],
        ),
      );

      return {
        summary: {
          orders: rows.length,
          points: pointIds.length,
          cashMovements: movements.length,
          settlements: settlements.length,
          disputes: disputes.length,
          economicActions: economicActions.length,
          reviewRequired: rows.filter((row) => row.reviewRequired === 'true').length,
        },
        filters: this.reportFilters(query),
        items: rows,
        source: 'mongo-persistent',
        generatedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco audit exports.',
      );
    }
  }

  async auditExportCsv(query: FiscalReportQuery) {
    const report = await this.auditExport(query);
    const headers = [
      'orderId',
      'pointId',
      'userId',
      'type',
      'orderStatus',
      'originCurrency',
      'amountOrigin',
      'destinationCurrency',
      'amountDestinationEstimated',
      'rate',
      'decoFee',
      'pointFee',
      'ledgerHoldStatus',
      'cashMovements',
      'cashInMinorUnits',
      'cashOutMinorUnits',
      'settlementStatus',
      'fiscalReportStatus',
      'disputeStatus',
      'economicActionStatus',
      'auditTrailEvents',
      'reviewRequired',
      'lastEventAt',
    ];

    return [
      headers.join(','),
      ...report.items.map((row) =>
        headers.map((header) => this.csvCell(row[header as keyof typeof row])).join(','),
      ),
    ].join('\n');
  }

  private async listSettlements(query: FiscalReportQuery) {
    try {
      const limit = Math.min(Math.max(Number(query.limit ?? 100), 1), 500);
      const filter: Record<string, string> = {};
      if (query.pointId) filter.pointId = query.pointId;
      if (query.status) filter.status = query.status;
      if (query.orderId) filter.orderId = query.orderId;
      if (query.fiscalReportStatus) {
        filter.fiscalReportStatus = query.fiscalReportStatus;
      }

      return (await this.settlementModel
        .find(filter)
        .sort({ completedAt: -1, generatedAt: -1, createdAt: -1 })
        .limit(limit)
        .lean()) as PointSettlementEntity[];
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco fiscal reports.',
      );
    }
  }

  private toFiscalRow(settlement: PointSettlementEntity) {
    return {
      settlementId: settlement.id,
      orderId: settlement.orderId,
      pointId: settlement.pointId ?? '',
      type: settlement.type,
      status: settlement.status,
      originCurrency: settlement.originCurrency,
      expectedOriginMinorUnits: settlement.expectedOriginMinorUnits,
      actualReceivedMinorUnits: settlement.actualReceivedMinorUnits,
      originDifferenceMinorUnits: settlement.originDifferenceMinorUnits,
      destinationCurrency: settlement.destinationCurrency,
      expectedDestinationMinorUnits: settlement.expectedDestinationMinorUnits,
      actualDeliveredMinorUnits: settlement.actualDeliveredMinorUnits,
      destinationDifferenceMinorUnits: settlement.destinationDifferenceMinorUnits,
      ledgerStatus: settlement.ledgerStatus,
      approvalStatus: settlement.approvalStatus,
      fiscalReportStatus: settlement.fiscalReportStatus,
      reviewReasons: settlement.reviewReasons.join('|'),
      completedAt: settlement.completedAt ?? '',
      generatedAt: settlement.generatedAt ?? '',
    };
  }

  private toAuditRow(
    order: PointOrderEntity,
    settlements: PointSettlementEntity[],
    movements: PointCashMovementEntity[],
    disputes: PointDisputeEntity[],
    economicActions: PointEconomicActionEntity[],
  ) {
    const orderMovements = movements.filter((movement) => movement.orderId === order.id);
    const settlement = settlements.find((item) => item.orderId === order.id);
    const dispute = disputes.find((item) => item.orderId === order.id);
    const economicAction = economicActions.find((item) => item.orderId === order.id);
    const cashIn = this.sumMovementDirection(orderMovements, 'in');
    const cashOut = this.sumMovementDirection(orderMovements, 'out');
    const reviewRequired =
      order.status === 'disputed' ||
      order.ledgerHoldStatus === 'review_required' ||
      settlement?.status === 'review_required' ||
      Boolean(dispute) ||
      economicAction?.status === 'pending_review' ||
      economicAction?.status === 'queued_for_custody';

    return {
      orderId: order.id,
      pointId: order.pointId ?? '',
      userId: order.userId,
      type: order.type,
      orderStatus: order.status,
      originCurrency: order.originCurrency,
      amountOrigin: String(order.amountOrigin),
      destinationCurrency: order.destinationCurrency,
      amountDestinationEstimated: String(order.amountDestinationEstimated),
      rate: String(order.rate),
      decoFee: String(order.decoFee),
      pointFee: String(order.pointFee),
      ledgerHoldStatus: order.ledgerHoldStatus ?? 'not_required',
      cashMovements: String(orderMovements.length),
      cashInMinorUnits: cashIn,
      cashOutMinorUnits: cashOut,
      settlementStatus: settlement?.status ?? '',
      fiscalReportStatus: settlement?.fiscalReportStatus ?? '',
      disputeStatus: dispute?.status ?? '',
      economicActionStatus: economicAction?.status ?? '',
      auditTrailEvents: String(order.auditTrail?.length ?? 0),
      reviewRequired: String(reviewRequired),
      lastEventAt: this.lastEventAt(order, settlement, dispute, economicAction),
    };
  }

  private sumMovementDirection(
    movements: PointCashMovementEntity[],
    direction: 'in' | 'out',
  ) {
    return movements
      .filter((movement) => movement.direction === direction)
      .reduce((total, movement) => total + BigInt(movement.amountMinorUnits), 0n)
      .toString();
  }

  private lastEventAt(
    order: PointOrderEntity,
    settlement?: PointSettlementEntity,
    dispute?: PointDisputeEntity,
    economicAction?: PointEconomicActionEntity,
  ) {
    const events = [
      order.completedAt,
      order.disputedAt,
      order.cancelledAt,
      order.statusChangedAt,
      settlement?.completedAt,
      settlement?.generatedAt,
      dispute?.resolvedAt,
      dispute?.openedAt,
      economicAction?.executedAtIso,
      economicAction?.createdAtIso,
    ]
      .filter(Boolean)
      .sort();

    return events[events.length - 1] ?? '';
  }

  private toMonthlyRows(settlements: PointSettlementEntity[], monthFilter?: string) {
    const rows = new Map<
      string,
      {
        month: string;
        pointId: string;
        originCurrency: string;
        destinationCurrency: string;
        settlements: number;
        balanced: number;
        reviewRequired: number;
        readyForExport: number;
        expectedOriginMinorUnits: bigint;
        actualReceivedMinorUnits: bigint;
        originDifferenceMinorUnits: bigint;
        expectedDestinationMinorUnits: bigint;
        actualDeliveredMinorUnits: bigint;
        destinationDifferenceMinorUnits: bigint;
      }
    >();

    for (const settlement of settlements) {
      const month = this.settlementMonth(settlement);
      if (monthFilter && month !== monthFilter) continue;

      const pointId = settlement.pointId || 'unassigned';
      const key = [
        month,
        pointId,
        settlement.originCurrency,
        settlement.destinationCurrency,
        settlement.status,
      ].join(':');
      const row =
        rows.get(key) ??
        {
          month,
          pointId,
          originCurrency: settlement.originCurrency,
          destinationCurrency: settlement.destinationCurrency,
          settlements: 0,
          balanced: 0,
          reviewRequired: 0,
          readyForExport: 0,
          expectedOriginMinorUnits: 0n,
          actualReceivedMinorUnits: 0n,
          originDifferenceMinorUnits: 0n,
          expectedDestinationMinorUnits: 0n,
          actualDeliveredMinorUnits: 0n,
          destinationDifferenceMinorUnits: 0n,
        };

      row.settlements += 1;
      if (settlement.status === 'balanced') row.balanced += 1;
      if (settlement.status === 'review_required') row.reviewRequired += 1;
      if (settlement.fiscalReportStatus === 'ready_for_export') row.readyForExport += 1;
      row.expectedOriginMinorUnits += BigInt(settlement.expectedOriginMinorUnits);
      row.actualReceivedMinorUnits += BigInt(settlement.actualReceivedMinorUnits);
      row.originDifferenceMinorUnits += BigInt(settlement.originDifferenceMinorUnits);
      row.expectedDestinationMinorUnits += BigInt(settlement.expectedDestinationMinorUnits);
      row.actualDeliveredMinorUnits += BigInt(settlement.actualDeliveredMinorUnits);
      row.destinationDifferenceMinorUnits += BigInt(
        settlement.destinationDifferenceMinorUnits,
      );
      rows.set(key, row);
    }

    return Array.from(rows.values()).map((row) => ({
      ...row,
      expectedOriginMinorUnits: row.expectedOriginMinorUnits.toString(),
      actualReceivedMinorUnits: row.actualReceivedMinorUnits.toString(),
      originDifferenceMinorUnits: row.originDifferenceMinorUnits.toString(),
      expectedDestinationMinorUnits: row.expectedDestinationMinorUnits.toString(),
      actualDeliveredMinorUnits: row.actualDeliveredMinorUnits.toString(),
      destinationDifferenceMinorUnits: row.destinationDifferenceMinorUnits.toString(),
    }));
  }

  private settlementMonth(settlement: PointSettlementEntity) {
    const value = settlement.completedAt || settlement.generatedAt || '';
    return value.length >= 7 ? value.slice(0, 7) : 'sin-fecha';
  }

  private sumField(
    settlements: PointSettlementEntity[],
    field: 'originDifferenceMinorUnits' | 'destinationDifferenceMinorUnits',
  ) {
    return settlements
      .reduce((total, settlement) => total + BigInt(settlement[field]), 0n)
      .toString();
  }

  private reportFilters(query: FiscalReportQuery) {
    return {
      pointId: query.pointId,
      orderId: query.orderId,
      status: query.status,
      fiscalReportStatus: query.fiscalReportStatus,
      month: query.month,
      limit: query.limit ?? '100',
    };
  }

  private csvCell(value: unknown) {
    const cell = String(value ?? '');
    if (!/[",\n\r]/.test(cell)) return cell;
    return `"${cell.replace(/"/g, '""')}"`;
  }
}

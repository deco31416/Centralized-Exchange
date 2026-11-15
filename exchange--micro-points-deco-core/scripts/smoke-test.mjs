import assert from 'node:assert/strict';

const serviceModule = await import('../dist/points-deco/points-deco.service.js');
const cashModule = await import('../dist/points-deco/points-deco-cash.service.js');
const settlementModule = await import('../dist/points-deco/points-deco-settlement.service.js');
const reportModule = await import('../dist/points-deco/points-deco-report.service.js');
const stateModule = await import('../dist/points-deco/points-deco-order-state.service.js');
const disputeModule = await import('../dist/points-deco/points-deco-dispute.service.js');
const economicActionModule = await import(
  '../dist/points-deco/points-deco-economic-action.service.js'
);
const orderOperationsModule = await import('../dist/points-deco/points-deco-order-operations.service.js');
const { PointsDecoService } = serviceModule;
const { PointsDecoCashService } = cashModule;
const { PointsDecoSettlementService } = settlementModule;
const { PointsDecoReportService } = reportModule;
const { PointsDecoOrderStateService } = stateModule;
const { PointsDecoDisputeService } = disputeModule;
const { PointsDecoEconomicActionService } = economicActionModule;
const { PointsDecoOrderOperationsService } = orderOperationsModule;

function makeFindModel(items = []) {
  return {
    estimatedDocumentCount: async () => items.length,
    insertMany: async () => undefined,
    find: () => ({
      lean: async () => items,
    }),
    findOne: () => ({
      lean: async () => null,
    }),
    create: async (value) => value,
  };
}

function makeCashPositionModel() {
  const items = [];
  return {
    items,
    find: (filter = {}) => ({
      sort: () => ({
        lean: async () =>
          items.filter((item) =>
            Object.entries(filter).every(([key, value]) => item[key] === value),
          ),
      }),
    }),
    findOneAndUpdate: (query, update) => ({
      lean: async () => {
        let item = items.find((entry) => entry.id === query.id);
        if (!item) {
          item = { ...update.$setOnInsert };
          items.push(item);
        }
        return item;
      },
    }),
    updateOne: async (query, update) => {
      const item = items.find((entry) => entry.id === query.id);
      if (!item) return;
      Object.assign(item, update.$set);
      item.version = (item.version ?? 0) + (update.$inc?.version ?? 0);
    },
  };
}

function makeCashMovementModel() {
  const items = [];
  const matches = (item, filter) =>
    Object.entries(filter).every(([key, value]) => {
      if (value && typeof value === 'object' && '$in' in value) {
        return value.$in.includes(item[key]);
      }
      return item[key] === value;
    });

  return {
    items,
    create: async (value) => {
      items.push(value);
      return value;
    },
    find: (filter = {}) => ({
      sort: () => ({
        limit: (limit) => ({
          lean: async () =>
            items
              .filter((item) => matches(item, filter))
              .slice(0, limit),
        }),
        lean: async () => items.filter((item) => matches(item, filter)),
      }),
    }),
  };
}

function makeSettlementModel() {
  const items = [];
  return {
    items,
    find: (filter = {}) => ({
      sort: () => ({
        limit: (limit) => ({
          lean: async () =>
            items
              .filter((item) =>
                Object.entries(filter).every(([key, value]) => item[key] === value),
              )
              .slice(0, limit),
        }),
      }),
    }),
    findOne: (filter = {}) => ({
      lean: async () =>
        items.find((item) =>
          Object.entries(filter).every(([key, value]) => item[key] === value),
        ) ?? null,
    }),
    findOneAndUpdate: (filter, update) => ({
      lean: async () => {
        let item = items.find((entry) =>
          Object.entries(filter).every(([key, value]) => entry[key] === value),
        );
        if (!item) {
          item = { ...update.$set };
          items.push(item);
        } else {
          Object.assign(item, update.$set);
        }
        return item;
      },
    }),
    updateOne: async (filter, update) => {
      const item = items.find((entry) =>
        Object.entries(filter).every(([key, value]) => entry[key] === value),
      );
      if (item) Object.assign(item, update.$set);
    },
  };
}

function makeMutableDocumentModel(initialItems = []) {
  const items = [...initialItems];
  const matches = (item, filter) =>
    Object.entries(filter).every(([key, value]) => item[key] === value);
  const applyUpdate = (item, update) => {
    if (update.$set) {
      for (const [key, value] of Object.entries(update.$set)) {
        if (!key.includes('.')) {
          item[key] = value;
          continue;
        }
        const parts = key.split('.');
        let target = item;
        for (const part of parts.slice(0, -1)) {
          if (!target[part] || typeof target[part] !== 'object') target[part] = {};
          target = target[part];
        }
        target[parts.at(-1)] = value;
      }
    }
    if (update.$push) {
      for (const [key, value] of Object.entries(update.$push)) {
        if (!Array.isArray(item[key])) item[key] = [];
        item[key].push(value);
      }
    }
  };

  return {
    items,
    create: async (value) => {
      items.push(value);
      return value;
    },
    find: (filter = {}) => ({
      sort: () => ({
        limit: (limit) => ({
          lean: async () => items.filter((item) => matches(item, filter)).slice(0, limit),
        }),
        lean: async () => items.filter((item) => matches(item, filter)),
      }),
    }),
    findOne: (filter = {}) => ({
      lean: async () => items.find((item) => matches(item, filter)) ?? null,
    }),
    findOneAndUpdate: (filter, update) => ({
      lean: async () => {
        const item = items.find((entry) => matches(entry, filter));
        if (!item) return null;
        applyUpdate(item, update);
        return item;
      },
    }),
    updateOne: async (filter, update) => {
      const item = items.find((entry) => matches(entry, filter));
      if (item) applyUpdate(item, update);
    },
  };
}

const configService = {
  get(key) {
    if (key === 'POINTS_DECO_SEED_DEFAULTS') return 'false';
    return undefined;
  },
};
const limitsPolicyService = {
  precheck: async () => ({
    decision: 'ALLOW',
    requiresApproval: false,
    policyVersion: 1,
    nextAction: 'EXECUTE_WITH_AUDIT',
  }),
};
const ledgerService = {
  buildHoldShape: () => ({
    requiresLedgerHold: false,
    ledgerHoldStatus: 'not_required',
  }),
  holdOrder: async () => ({
    status: 'skipped',
    requiresReview: false,
  }),
  applyEconomicAction: async (action) => ({
    status: ['refund_user', 'release_to_point'].includes(action.resolution)
      ? 'applied'
      : 'manual_review_required',
    requiresReview: !['refund_user', 'release_to_point'].includes(action.resolution),
    eventId: `points-deco:${action.id}:ledger-economic-action:v1`,
    amountMinorUnits: action.resolution === 'refund_user' ? '24600000' : '1000000000',
    txId:
      action.resolution === 'refund_user'
        ? 'ledger-adjustment-smoke-1'
        : action.resolution === 'release_to_point'
          ? 'ledger-point-payout-smoke-1'
          : undefined,
    accountId:
      action.resolution === 'release_to_point'
        ? `SYSTEM:POINTS_DECO:POINT:${action.pointId}`
        : undefined,
    reason:
      ['refund_user', 'release_to_point'].includes(action.resolution)
        ? undefined
        : 'Point payouts require a configured point settlement account.',
  }),
};
const custodySettlementService = {
  prepareEconomicAction: async (action) =>
    action.resolution === 'release_to_point'
      ? {
          status: 'registered',
          requiresReview: false,
          eventId: `points-deco:${action.id}:custody-settlement-intent:v1`,
          intentId: `points-deco:${action.id}:custody-intent`,
          providerHint: 'wompi-co',
          providerMode: 'not_dispatched',
        }
      : {
          status: 'skipped',
          requiresReview: false,
        },
};
const pricingService = {
  quote: async () => ({
    rate: 4000,
    source: 'local-fallback',
    operation: 'BUY',
    corridor: 'retail',
  }),
};
const orderStateService = new PointsDecoOrderStateService();

const service = new PointsDecoService(
  configService,
  makeFindModel(),
  makeFindModel(),
  makeFindModel(),
  limitsPolicyService,
  ledgerService,
  pricingService,
);

const quote = await service.quote({
  type: 'cash_in',
  originCurrency: 'COP',
  destinationCurrency: 'USDT',
  amountOrigin: 100000,
});

assert.equal(quote.type, 'cash_in');
assert.equal(quote.originCurrency, 'COP');
assert.equal(quote.destinationCurrency, 'USDT');
assert.equal(quote.amountOrigin, 100000);
assert.equal(quote.rate, 4000);
assert.equal(quote.decoFee, 1200);
assert.equal(quote.pointFee, 400);
assert.equal(quote.amountDestinationEstimated, 24.6);
assert.equal(quote.requiresKyc, true);
assert.equal(quote.requiresRiskCheck, true);

const overview = await service.overview();
assert.equal(overview.line, 'Puntos Deco');
assert.ok(overview.totalPoints >= 2);
assert.ok(overview.complements.includes('P2P'));
assert.ok(overview.complements.includes('Caja del Punto'));

const list = await service.listPoints({ country: 'CO', service: 'cash_in' });
assert.ok(list.count >= 1);
assert.match(list.locationPolicy, /aproximada/i);

const nearby = await service.nearby({ country: 'CO' });
assert.ok(nearby.count >= 1);
assert.equal(Object.hasOwn(nearby.items[0], 'address'), false);
assert.match(nearby.privacy, /direccion exacta/i);

assert.doesNotThrow(() => orderStateService.assertTransition('created', 'accepted'));
assert.doesNotThrow(() =>
  orderStateService.assertTransition('accepted', 'location_revealed'),
);
assert.throws(() => orderStateService.assertTransition('created', 'code_verified'));

const cashPositionModel = makeCashPositionModel();
const cashMovementModel = makeCashMovementModel();
const cashService = new PointsDecoCashService(cashPositionModel, cashMovementModel);
const settlementModel = makeSettlementModel();
const settlementService = new PointsDecoSettlementService(
  makeFindModel(),
  cashMovementModel,
  settlementModel,
);

const cashReceived = await cashService.recordCashReceived({
  id: 'pd-smoke-1',
  type: 'cash_in',
  userId: 'user-smoke',
  pointId: 'point-bogota-1',
  originCurrency: 'COP',
  destinationCurrency: 'USDT',
  amountOrigin: 100000,
  amountDestinationEstimated: 24.6,
});
assert.equal(cashReceived.movement.direction, 'in');
assert.equal(cashReceived.movement.amountMinorUnits, '10000000');

const balancedCashInSettlement = await settlementService.reconcileOrder({
  id: 'pd-smoke-1',
  type: 'cash_in',
  userId: 'user-smoke',
  pointId: 'point-bogota-1',
  originCurrency: 'COP',
  destinationCurrency: 'USDT',
  amountOrigin: 100000,
  amountDestinationEstimated: 24.6,
  status: 'cash_received',
  limitsDecision: 'ALLOW',
  limitsRequiresApproval: false,
  requiresLedgerHold: false,
  ledgerHoldStatus: 'not_required',
});
assert.equal(balancedCashInSettlement.status, 'balanced');
assert.equal(balancedCashInSettlement.fiscalReportStatus, 'ready_for_export');

const cashDelivered = await cashService.recordCashDelivered({
  id: 'pd-smoke-2',
  type: 'cash_out',
  userId: 'user-smoke',
  pointId: 'point-bogota-1',
  originCurrency: 'USDT',
  destinationCurrency: 'COP',
  amountOrigin: 24.6,
  amountDestinationEstimated: 50000,
});
assert.equal(cashDelivered.movement.direction, 'out');
assert.equal(cashDelivered.movement.balanceAfterMinorUnits, '5000000');

const balancedCashOutSettlement = await settlementService.reconcileOrder({
  id: 'pd-smoke-2',
  type: 'cash_out',
  userId: 'user-smoke',
  pointId: 'point-bogota-1',
  originCurrency: 'USDT',
  destinationCurrency: 'COP',
  amountOrigin: 24.6,
  amountDestinationEstimated: 50000,
  status: 'cash_delivered',
  limitsDecision: 'ALLOW',
  limitsRequiresApproval: false,
  requiresLedgerHold: true,
  ledgerHoldStatus: 'captured',
});
assert.equal(balancedCashOutSettlement.status, 'balanced');

const reviewSettlement = await settlementService.reconcileOrder({
  id: 'pd-smoke-review',
  type: 'cash_in',
  userId: 'user-smoke',
  pointId: 'point-bogota-1',
  originCurrency: 'COP',
  destinationCurrency: 'USDT',
  amountOrigin: 30000,
  amountDestinationEstimated: 7.38,
  status: 'created',
  limitsDecision: 'ALLOW',
  limitsRequiresApproval: false,
  requiresLedgerHold: false,
  ledgerHoldStatus: 'not_required',
});
assert.equal(reviewSettlement.status, 'review_required');
assert.ok(reviewSettlement.reviewReasons.includes('origin_cash_mismatch'));

const reportService = new PointsDecoReportService(settlementModel);
const fiscalSummary = await reportService.fiscalSummary({ limit: '10' });
assert.equal(fiscalSummary.summary.settlements, 3);
assert.equal(fiscalSummary.summary.readyForExport, 2);
assert.equal(fiscalSummary.summary.reviewRequired, 1);
assert.equal(fiscalSummary.items[0].settlementId.startsWith('pd-settlement-'), true);

const fiscalCsv = await reportService.fiscalCsv({ limit: '10' });
assert.match(fiscalCsv, /settlementId,orderId,pointId/);
assert.match(fiscalCsv, /pd-settlement-pd-smoke-1/);

const disputeModel = makeMutableDocumentModel([
  {
    id: 'pd-dispute-smoke-1',
    orderId: 'pd-smoke-1',
    pointId: 'point-bogota-1',
    userId: 'user-smoke',
    orderType: 'cash_in',
    originCurrency: 'COP',
    destinationCurrency: 'USDT',
    amountOrigin: 100000,
    amountDestinationEstimated: 24.6,
    openedBy: 'user-smoke',
    openedByRole: 'user',
    reason: 'El punto no confirma efectivo recibido.',
    status: 'open',
    evidenceRefs: [],
    auditTrail: [],
    openedAt: new Date().toISOString(),
    slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
]);
const orderModel = makeMutableDocumentModel([
  {
    id: 'pd-smoke-1',
    status: 'disputed',
    requiresLedgerHold: false,
    ledgerHoldStatus: 'not_required',
    auditTrail: [],
  },
]);
const orderOperationsService = new PointsDecoOrderOperationsService(
  orderModel,
  disputeModel,
  orderStateService,
  {
    releaseOrder: async (order) => ({
      status: 'released',
      requiresReview: false,
      eventId: `points-deco:${order.id}:ledger-release:v1`,
    }),
    captureOrder: async (order) => ({
      status: 'captured',
      requiresReview: false,
      eventId: `points-deco:${order.id}:ledger-capture:v1`,
    }),
  },
  {},
  {},
  {},
);
const economicActionModel = makeMutableDocumentModel();
const economicActionService = new PointsDecoEconomicActionService(
  economicActionModel,
  custodySettlementService,
  ledgerService,
);
const disputeService = new PointsDecoDisputeService(
  disputeModel,
  orderModel,
  economicActionService,
  orderOperationsService,
);
const disputeList = await disputeService.listDisputes({ status: 'open' });
assert.equal(disputeList.count, 1);
const disputeReview = await disputeService.reviewDispute('pd-dispute-smoke-1', {
  actorId: 'admin-smoke',
  actorRole: 'admin',
  reason: 'Revision administrativa iniciada.',
});
assert.equal(disputeReview.dispute.status, 'reviewing');
assert.equal(disputeReview.dispute.assignedTo, 'admin-smoke');
const disputeResolution = await disputeService.resolveDispute('pd-dispute-smoke-1', {
  actorId: 'admin-smoke',
  actorRole: 'admin',
  resolution: 'cancel_order',
  reason: 'Queda para conciliacion maker-checker.',
});
assert.equal(disputeResolution.dispute.status, 'resolved');
assert.equal(disputeResolution.dispute.makerCheckerStatus, 'pending_checker');
assert.equal(disputeResolution.nextRequiredAction, 'WAITING_CHECKER_APPROVAL');
await assert.rejects(
  () =>
    disputeService.approveResolution('pd-dispute-smoke-1', {
      actorId: 'admin-smoke',
      actorRole: 'admin',
      reason: 'Intento de aprobacion por el mismo maker.',
    }),
  /Maker and checker must be different administrators/i,
);
const checkerApproval = await disputeService.approveResolution('pd-dispute-smoke-1', {
  actorId: 'checker-smoke',
  actorRole: 'admin',
  reason: 'Checker aprueba la resolucion.',
});
assert.equal(checkerApproval.dispute.makerCheckerStatus, 'approved');
assert.equal(checkerApproval.nextRequiredAction, 'READY_FOR_SETTLEMENT_OR_REVERSAL_EXECUTOR');
const execution = await disputeService.executeApprovedResolution('pd-dispute-smoke-1', {
  actorId: 'executor-smoke',
  actorRole: 'admin',
  reason: 'Ejecutar cancelacion controlada.',
});
assert.equal(execution.dispute.resolutionExecutionStatus, 'executed_cancelled');
assert.equal(execution.nextRequiredAction, 'ORDER_CANCELLED_BY_APPROVED_DISPUTE');
assert.equal(orderModel.items[0].status, 'cancelled');
assert.equal(orderModel.items[0].auditTrail.length, 5);

disputeModel.items.push({
  id: 'pd-dispute-smoke-refund',
  orderId: 'pd-smoke-refund',
  pointId: 'point-bogota-1',
  userId: 'user-smoke',
  orderType: 'cash_out',
  originCurrency: 'USDT',
  destinationCurrency: 'COP',
  amountOrigin: 10,
  amountDestinationEstimated: 40000,
  openedBy: 'user-smoke',
  openedByRole: 'user',
  reason: 'El usuario debe recibir reversa.',
  status: 'resolved',
  resolution: 'refund_user',
  makerCheckerStatus: 'approved',
  preparedBy: 'admin-smoke',
  checkedBy: 'checker-smoke',
  evidenceRefs: [],
  auditTrail: [],
  openedAt: new Date().toISOString(),
  slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});
orderModel.items.push({
  id: 'pd-smoke-refund',
  type: 'cash_out',
  userId: 'user-smoke',
  pointId: 'point-bogota-1',
  status: 'disputed',
  originCurrency: 'USDT',
  destinationCurrency: 'COP',
  amountOrigin: 10,
  amountDestinationEstimated: 40000,
  requiresLedgerHold: true,
  ledgerHoldStatus: 'held',
  ledgerHoldAmountMinorUnits: '10000000',
  auditTrail: [],
});
const refundExecution = await disputeService.executeApprovedResolution(
  'pd-dispute-smoke-refund',
  {
    actorId: 'executor-smoke',
    actorRole: 'admin',
    reason: 'Ejecutar refund controlado.',
  },
);
assert.equal(refundExecution.dispute.resolutionExecutionStatus, 'executed_refunded');
assert.equal(refundExecution.nextRequiredAction, 'USER_REFUNDED_BY_LEDGER_HOLD_RELEASE');
assert.equal(orderModel.items[1].status, 'cancelled');
assert.equal(orderModel.items[1].ledgerHoldStatus, 'released');

disputeModel.items.push({
  id: 'pd-dispute-smoke-point-release',
  orderId: 'pd-smoke-point-release',
  pointId: 'point-bogota-1',
  userId: 'user-smoke',
  orderType: 'cash_out',
  originCurrency: 'USDT',
  destinationCurrency: 'COP',
  amountOrigin: 12,
  amountDestinationEstimated: 48000,
  openedBy: 'point-bogota-1',
  openedByRole: 'point_operator',
  reason: 'El punto debe recibir liquidacion.',
  status: 'resolved',
  resolution: 'release_to_point',
  makerCheckerStatus: 'approved',
  preparedBy: 'admin-smoke',
  checkedBy: 'checker-smoke',
  evidenceRefs: [],
  auditTrail: [],
  openedAt: new Date().toISOString(),
  slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});
orderModel.items.push({
  id: 'pd-smoke-point-release',
  type: 'cash_out',
  userId: 'user-smoke',
  pointId: 'point-bogota-1',
  status: 'disputed',
  originCurrency: 'USDT',
  destinationCurrency: 'COP',
  amountOrigin: 12,
  amountDestinationEstimated: 48000,
  requiresLedgerHold: true,
  ledgerHoldStatus: 'held',
  ledgerHoldAmountMinorUnits: '12000000',
  auditTrail: [],
});
const pointReleaseExecution = await disputeService.executeApprovedResolution(
  'pd-dispute-smoke-point-release',
  {
    actorId: 'executor-smoke',
    actorRole: 'admin',
    reason: 'Ejecutar release to point controlado.',
  },
);
assert.equal(
  pointReleaseExecution.dispute.resolutionExecutionStatus,
  'executed_released_to_point',
);
assert.equal(
  pointReleaseExecution.nextRequiredAction,
  'POINT_RELEASE_READY_FOR_SETTLEMENT_RECONCILIATION',
);
assert.equal(orderModel.items[2].status, 'settlement_pending');
assert.equal(orderModel.items[2].ledgerHoldStatus, 'captured');

disputeModel.items.push({
  id: 'pd-dispute-smoke-no-hold-refund',
  orderId: 'pd-smoke-no-hold-refund',
  pointId: 'point-bogota-1',
  userId: 'user-smoke',
  orderType: 'cash_in',
  originCurrency: 'COP',
  destinationCurrency: 'USDT',
  amountOrigin: 100000,
  amountDestinationEstimated: 24.6,
  openedBy: 'user-smoke',
  openedByRole: 'user',
  reason: 'El usuario requiere ajuste sin hold confirmado.',
  status: 'resolved',
  resolution: 'refund_user',
  makerCheckerStatus: 'approved',
  preparedBy: 'admin-smoke',
  checkedBy: 'checker-smoke',
  evidenceRefs: [],
  auditTrail: [],
  openedAt: new Date().toISOString(),
  slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});
orderModel.items.push({
  id: 'pd-smoke-no-hold-refund',
  type: 'cash_in',
  userId: 'user-smoke',
  pointId: 'point-bogota-1',
  status: 'disputed',
  originCurrency: 'COP',
  destinationCurrency: 'USDT',
  amountOrigin: 100000,
  amountDestinationEstimated: 24.6,
  requiresLedgerHold: false,
  ledgerHoldStatus: 'not_required',
  auditTrail: [],
});
const noHoldRefundExecution = await disputeService.executeApprovedResolution(
  'pd-dispute-smoke-no-hold-refund',
  {
    actorId: 'executor-smoke',
    actorRole: 'admin',
    reason: 'Ejecutar revision economica sin hold.',
  },
);
assert.equal(
  noHoldRefundExecution.dispute.resolutionExecutionStatus,
  'failed_review_required',
);
assert.equal(
  noHoldRefundExecution.nextRequiredAction,
  'ECONOMIC_ACTION_PENDING_CUSTODY_OR_LEDGER_REVIEW',
);
assert.equal(noHoldRefundExecution.economicAction.status, 'pending_review');
assert.equal(noHoldRefundExecution.economicAction.resolution, 'refund_user');
assert.equal(economicActionModel.items.length, 1);
const noHoldActions = await economicActionService.listActions({
  status: 'pending_review',
});
assert.equal(noHoldActions.count, 1);
const queuedEconomicAction = await economicActionService.queueForCustody(
  noHoldRefundExecution.economicAction.id,
  {
    actorId: 'checker-smoke',
    actorRole: 'admin',
    reason: 'Aprobar cola de custodia controlada.',
  },
);
assert.equal(queuedEconomicAction.action.status, 'queued_for_custody');
assert.equal(
  queuedEconomicAction.nextRequiredAction,
  'RUN_CONTROLLED_CUSTODY_OR_LEDGER_EXECUTOR',
);
const executedEconomicAction = await economicActionService.executeAction(
  noHoldRefundExecution.economicAction.id,
  {
    actorId: 'executor-smoke',
    actorRole: 'admin',
    reason: 'Registrar ejecucion con evidencia.',
    evidenceRefs: ['ledger-adjustment-smoke-1'],
  },
);
assert.equal(executedEconomicAction.action.status, 'executed');
assert.equal(
  executedEconomicAction.action.executionReference,
  'ledger-adjustment-smoke-1',
);

const pointPayoutAction = await economicActionService.createNoHoldAction({
  dispute: {
    ...disputeModel.items.at(-1),
    id: 'pd-dispute-smoke-no-hold-point-payout',
  },
  order: {
    ...orderModel.items.at(-1),
    id: 'pd-smoke-no-hold-point-payout',
  },
  resolution: 'release_to_point',
  sourceExecutionId: 'pd-dispute-exec-smoke-point-payout',
  reason: 'Crear accion para liquidacion contable al Punto Deco smoke.',
  actionInput: {
    actorId: 'executor-smoke',
    actorRole: 'admin',
  },
});
const queuedPointPayoutAction = await economicActionService.queueForCustody(
  pointPayoutAction.action.id,
  {
    actorId: 'checker-smoke',
    actorRole: 'admin',
    reason: 'Aprobar cola de liquidacion al Punto Deco.',
  },
);
assert.equal(queuedPointPayoutAction.action.status, 'queued_for_custody');
const executedPointPayoutAction = await economicActionService.executeAction(
  pointPayoutAction.action.id,
  {
    actorId: 'executor-smoke',
    actorRole: 'admin',
    reason: 'Ejecutar liquidacion contable del Punto Deco.',
    evidenceRefs: ['ledger-point-payout-smoke-1'],
  },
);
assert.equal(executedPointPayoutAction.action.status, 'executed');
assert.equal(
  executedPointPayoutAction.action.executionReference,
  'ledger-point-payout-smoke-1',
);

const rejectedAction = await economicActionService.createNoHoldAction({
  dispute: {
    ...disputeModel.items.at(-1),
    id: 'pd-dispute-smoke-no-hold-reject',
  },
  order: {
    ...orderModel.items.at(-1),
    id: 'pd-smoke-no-hold-reject',
  },
  resolution: 'refund_user',
  sourceExecutionId: 'pd-dispute-exec-smoke-reject',
  reason: 'Crear accion para rechazo smoke.',
  actionInput: {
    actorId: 'executor-smoke',
    actorRole: 'admin',
  },
});
const rejectedEconomicAction = await economicActionService.rejectAction(
  rejectedAction.action.id,
  {
    actorId: 'checker-smoke',
    actorRole: 'admin',
    reason: 'Rechazo controlado smoke.',
  },
);
assert.equal(rejectedEconomicAction.action.status, 'rejected');
assert.equal(rejectedEconomicAction.action.rejectionReason, 'Rechazo controlado smoke.');

await assert.rejects(
  () =>
    cashService.recordCashDelivered({
      id: 'pd-smoke-3',
      type: 'cash_out',
      userId: 'user-smoke',
      pointId: 'point-bogota-1',
      originCurrency: 'USDT',
      destinationCurrency: 'COP',
      amountOrigin: 100,
      amountDestinationEstimated: 60000,
    }),
  /insufficient physical balance/i,
);

console.log('Puntos Deco smoke test passed');

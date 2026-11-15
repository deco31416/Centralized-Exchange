"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type {
  DecoPoint,
  PointCashMovement,
  PointCashSummary,
  PointDispute,
  PointEconomicAction,
  PointFiatSettlementIntent,
  PointAuditExport,
  PointFiscalReport,
  PointMonthlyReport,
  PointOrder,
  PointReceipt,
  PointSecureForm,
  PointSettlement,
  PointsDecoOverview,
} from "./types"

type PointsDecoState = {
  loading: boolean
  error: string | null
  overview: PointsDecoOverview | null
  points: DecoPoint[]
  orders: PointOrder[]
  disputes: PointDispute[]
  cashSummary: PointCashSummary | null
  cashMovements: PointCashMovement[]
  receipts: PointReceipt[]
  settlements: PointSettlement[]
  economicActions: PointEconomicAction[]
  fiatSettlementIntents: PointFiatSettlementIntent[]
  fiscalReport: PointFiscalReport | null
  monthlyReport: PointMonthlyReport | null
  auditExport: PointAuditExport | null
  secureForms: PointSecureForm[]
}

function normalizeItems<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") return []
  const items = (payload as { items?: unknown }).items
  return Array.isArray(items) ? (items as T[]) : []
}

function normalizeOverview(payload: unknown): PointsDecoOverview | null {
  if (!payload || typeof payload !== "object") return null
  const value = payload as Partial<PointsDecoOverview>

  return {
    totalPoints: Number(value.totalPoints) || 0,
    activePoints: Number(value.activePoints) || 0,
    commercePoints: Number(value.commercePoints) || 0,
    cashierPoints: Number(value.cashierPoints) || 0,
    openOrders: Number(value.openOrders) || 0,
    disputedOrders: Number(value.disputedOrders) || 0,
    line: value.line || "Puntos Deco",
    complements: Array.isArray(value.complements) ? value.complements : [],
    source: value.source || "gateway-admin",
    updatedAt: value.updatedAt || new Date().toISOString(),
    nextStep: value.nextStep || "Conectar reglas operativas completas.",
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback
  const message = (payload as { message?: unknown }).message
  if (typeof message === "string") return message
  if (Array.isArray(message)) return message.join(", ")
  return fallback
}

export function formatPointsDecoNumber(value: number, digits = 0) {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export async function executePointsDecoDisputeResolution(disputeId: string) {
  const response = await fetch(
    `/api/points-deco/disputes/${encodeURIComponent(disputeId)}/execute-resolution`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: "Ejecución controlada solicitada desde Admin Panel.",
      }),
    },
  )
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload, "No se pudo ejecutar la resolución de Puntos Deco"),
    )
  }

  return payload
}

export async function transitionPointsDecoEconomicAction(
  actionId: string,
  transition: "queue" | "execute" | "reject",
) {
  const response = await fetch(
    `/api/points-deco/economic-actions/${encodeURIComponent(actionId)}/${transition}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: `Transición ${transition} solicitada desde Admin Panel.`,
      }),
    },
  )
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload, "No se pudo cambiar la acción económica de Puntos Deco"),
    )
  }

  return payload
}

export async function dispatchPointDecoFiatSettlementIntent(intentId: string) {
  const response = await fetch(
    `/api/custody-fiat/points-deco-settlement-intents/${encodeURIComponent(intentId)}/dispatch`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "manual",
        reason: "Dispatch controlado solicitado desde Admin Panel.",
      }),
    },
  )
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload,
        "No se pudo registrar el dispatch fiat de Puntos Deco",
      ),
    )
  }

  return payload
}

export async function settlePointDecoFiatSettlementIntent(
  intent: PointFiatSettlementIntent,
) {
  const response = await fetch(
    `/api/custody-fiat/points-deco-settlement-intents/${encodeURIComponent(intent.id)}/settle`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settlementReference:
          intent.dispatchReference || `admin-settlement-${intent.id}`,
        reason:
          "Liquidación real confirmada desde Admin Panel con conciliación bancaria.",
        evidenceRefs: [
          intent.dispatchReference
            ? `dispatch:${intent.dispatchReference}`
            : `intent:${intent.id}`,
        ],
        bankReconciliation: {
          providerReference: intent.dispatchReference || intent.id,
          matchedAmountMinorUnits: intent.amountMinorUnits,
          matchedCurrency: intent.currency,
          notes:
            "Confirmación manual controlada. Adjuntar evidencia documental del proveedor en la siguiente fase.",
        },
      }),
    },
  )
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload,
        "No se pudo confirmar la liquidación fiat de Puntos Deco",
      ),
    )
  }

  return payload
}

export function usePointsDecoOverview() {
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState<PointsDecoState>({
    loading: true,
    error: null,
    overview: null,
    points: [],
    orders: [],
    disputes: [],
    cashSummary: null,
    cashMovements: [],
    receipts: [],
    settlements: [],
    economicActions: [],
    fiatSettlementIntents: [],
    fiscalReport: null,
    monthlyReport: null,
    auditExport: null,
    secureForms: [],
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [
          overviewRes,
          pointsRes,
          ordersRes,
          disputesRes,
          cashSummaryRes,
          cashMovementsRes,
          receiptsRes,
          settlementsRes,
          economicActionsRes,
          fiatSettlementIntentsRes,
          fiscalReportRes,
          monthlyReportRes,
          auditExportRes,
          secureFormsRes,
        ] = await Promise.all([
          fetch("/api/points-deco/overview", { cache: "no-store" }),
          fetch("/api/points-deco/points", { cache: "no-store" }),
          fetch("/api/points-deco/orders?limit=100", { cache: "no-store" }),
          fetch("/api/points-deco/disputes?limit=100", { cache: "no-store" }),
          fetch("/api/points-deco/cash/summary", { cache: "no-store" }),
          fetch("/api/points-deco/cash/movements?limit=10", { cache: "no-store" }),
          fetch("/api/points-deco/receipts?limit=10", { cache: "no-store" }),
          fetch("/api/points-deco/settlements?limit=10", { cache: "no-store" }),
          fetch("/api/points-deco/economic-actions?limit=25", { cache: "no-store" }),
          fetch("/api/custody-fiat/points-deco-settlement-intents?limit=25", {
            cache: "no-store",
          }),
          fetch("/api/points-deco/reports/fiscal?limit=25", { cache: "no-store" }),
          fetch("/api/points-deco/reports/monthly?limit=100", { cache: "no-store" }),
          fetch("/api/points-deco/reports/audit-export?limit=100", { cache: "no-store" }),
          fetch("/api/points-deco/forms?limit=50", { cache: "no-store" }),
        ])

        if (
          !overviewRes.ok ||
          !pointsRes.ok ||
          !ordersRes.ok ||
          !disputesRes.ok ||
          !cashSummaryRes.ok ||
          !cashMovementsRes.ok ||
          !receiptsRes.ok ||
          !settlementsRes.ok ||
          !economicActionsRes.ok ||
          !fiatSettlementIntentsRes.ok ||
          !fiscalReportRes.ok ||
          !monthlyReportRes.ok ||
          !auditExportRes.ok ||
          !secureFormsRes.ok
        ) {
          throw new Error("Puntos Deco no respondió por Gateway Admin")
        }

        const [
          overviewPayload,
          pointsPayload,
          ordersPayload,
          disputesPayload,
          cashSummaryPayload,
          cashMovementsPayload,
          receiptsPayload,
          settlementsPayload,
          economicActionsPayload,
          fiatSettlementIntentsPayload,
          fiscalReportPayload,
          monthlyReportPayload,
          auditExportPayload,
          secureFormsPayload,
        ] = await Promise.all([
          overviewRes.json(),
          pointsRes.json(),
          ordersRes.json(),
          disputesRes.json(),
          cashSummaryRes.json(),
          cashMovementsRes.json(),
          receiptsRes.json(),
          settlementsRes.json(),
          economicActionsRes.json(),
          fiatSettlementIntentsRes.json(),
          fiscalReportRes.json(),
          monthlyReportRes.json(),
          auditExportRes.json(),
          secureFormsRes.json(),
        ])

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            overview: normalizeOverview(overviewPayload),
            points: normalizeItems<DecoPoint>(pointsPayload),
            orders: normalizeItems<PointOrder>(ordersPayload),
            disputes: normalizeItems<PointDispute>(disputesPayload),
            cashSummary: cashSummaryPayload as PointCashSummary,
            cashMovements: normalizeItems<PointCashMovement>(cashMovementsPayload),
            receipts: normalizeItems<PointReceipt>(receiptsPayload),
            settlements: normalizeItems<PointSettlement>(settlementsPayload),
            economicActions: normalizeItems<PointEconomicAction>(economicActionsPayload),
            fiatSettlementIntents: normalizeItems<PointFiatSettlementIntent>(
              fiatSettlementIntentsPayload,
            ),
            fiscalReport: fiscalReportPayload as PointFiscalReport,
            monthlyReport: monthlyReportPayload as PointMonthlyReport,
            auditExport: auditExportPayload as PointAuditExport,
            secureForms: normalizeItems<PointSecureForm>(secureFormsPayload),
          })
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "No se pudo consultar Puntos Deco",
            overview: null,
            points: [],
            orders: [],
            disputes: [],
            cashSummary: null,
            cashMovements: [],
            receipts: [],
            settlements: [],
            economicActions: [],
            fiatSettlementIntents: [],
            fiscalReport: null,
            monthlyReport: null,
            auditExport: null,
            secureForms: [],
          })
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  const metrics = useMemo(() => {
    const activePoints = state.points.filter((point) => point.status === "active").length
    const commercePoints = state.points.filter((point) => point.type === "commerce").length
    const cashierPoints = state.points.filter((point) => point.type === "cashier").length
    const openStatuses = new Set(["created", "accepted", "rate_locked", "location_revealed"])
    const openOrders = state.orders.filter((order) => openStatuses.has(order.status)).length
    const disputedOrders = state.disputes.filter((dispute) => dispute.status !== "resolved").length
    const totalCapacity = state.points.length
    const receiptReviewCount = state.receipts.filter(
      (receipt) => receipt.status === "review_required"
    ).length
    const settlementReviewCount = state.settlements.filter(
      (settlement) => settlement.status === "review_required"
    ).length
    const settlementReadyCount = state.settlements.filter(
      (settlement) => settlement.fiscalReportStatus === "ready_for_export"
    ).length
    const economicReviewCount = state.economicActions.filter(
      (action) => action.status === "pending_review" || action.status === "queued_for_custody"
    ).length
    const fiatSettlementPendingCount = state.fiatSettlementIntents.filter(
      (intent) => intent.status === "provider_pending"
    ).length
    const fiatSettlementDispatchedCount = state.fiatSettlementIntents.filter(
      (intent) => intent.status === "provider_dispatched"
    ).length
    const fiscalReadyCount = state.fiscalReport?.summary.readyForExport ?? settlementReadyCount
    const fiscalReviewCount = state.fiscalReport?.summary.reviewRequired ?? settlementReviewCount
    const secureFormReviewCount = state.secureForms.filter(
      (form) => form.status === "submitted" || form.status === "reviewing"
    ).length

    return {
      totalPoints: state.overview?.totalPoints ?? totalCapacity,
      activePoints: state.overview?.activePoints ?? activePoints,
      commercePoints: state.overview?.commercePoints ?? commercePoints,
      cashierPoints: state.overview?.cashierPoints ?? cashierPoints,
      openOrders: state.overview?.openOrders ?? openOrders,
      disputedOrders: state.overview?.disputedOrders ?? disputedOrders,
      cashCurrencies: state.cashSummary?.currencies.length ?? 0,
      receiptReviewCount,
      settlementReviewCount,
      settlementReadyCount,
      economicReviewCount,
      fiatSettlementPendingCount,
      fiatSettlementDispatchedCount,
      fiscalReadyCount,
      fiscalReviewCount,
      secureFormReviewCount,
      completionPercent: totalCapacity > 0 ? Math.round((activePoints / totalCapacity) * 100) : 40,
    }
  }, [
    state.cashSummary,
    state.disputes,
    state.economicActions,
    state.fiatSettlementIntents,
    state.orders,
    state.overview,
    state.points,
    state.receipts,
    state.settlements,
    state.fiscalReport,
    state.secureForms,
  ])

  return { ...state, ...metrics, reload }
}

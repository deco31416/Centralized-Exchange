"use client"

import { useState } from "react"
import Link from "next/link"
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconCash,
  IconFileExport,
  IconMapPin,
  IconReceipt,
  IconRoute,
  IconScale,
  IconShieldCheck,
} from "@tabler/icons-react"

import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import {
  dispatchPointDecoFiatSettlementIntent,
  executePointsDecoDisputeResolution,
  formatPointsDecoNumber,
  settlePointDecoFiatSettlementIntent,
  transitionPointsDecoEconomicAction,
  usePointsDecoOverview,
} from "@/components/operaciones/points-deco/use-points-deco-overview"
import { DisputeExecutionTimeline } from "@/components/operaciones/points-deco/dispute-execution-timeline"
import { EmailReauthDialog } from "@/components/security/email-reauth-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { canExecutePuntosDecoResolution } from "@/lib/admin-rbac"
import type {
  PointDispute,
  PointEconomicAction,
  PointFiatSettlementIntent,
} from "@/components/operaciones/points-deco/types"

const serviceLabels: Record<string, string> = {
  cash_in: "Recarga",
  cash_out: "Retiro",
  remittance: "Remesas",
  fiat_exchange: "Cambio fiat",
  stablecoin_exchange: "Stablecoin",
}

const receiptStatusLabels: Record<string, string> = {
  draft: "Borrador",
  final: "Final",
  review_required: "Revisión",
}

const settlementStatusLabels: Record<string, string> = {
  balanced: "Balanceada",
  review_required: "Revisión",
}

const secureFormTypeLabels: Record<string, string> = {
  source_of_funds: "Origen de fondos",
  identity_support: "Soporte de identidad",
  fiscal_support: "Soporte fiscal",
  dispute_support: "Soporte de disputa",
  provider_evidence: "Evidencia proveedor",
}

const secureFormStatusLabels: Record<string, string> = {
  submitted: "Recibido",
  reviewing: "En revisión",
  approved: "Aprobado",
  rejected: "Rechazado",
  expired: "Expirado",
}

const disputeStatusLabels: Record<string, string> = {
  open: "Abierta",
  reviewing: "En revisión",
  resolved: "Resuelta",
  rejected: "Rechazada",
}

const makerCheckerStatusLabels: Record<string, string> = {
  not_required: "Sin doble control",
  pending_checker: "Pendiente checker",
  approved: "Aprobada",
  rejected: "Devuelta",
}

const executionStatusLabels: Record<string, string> = {
  not_started: "Sin ejecutar",
  queued_for_executor: "En cola",
  executed_noop: "Sin acción",
  executed_cancelled: "Cancelada",
  executed_refunded: "Reintegrada",
  executed_released_to_point: "A liquidación",
  failed_review_required: "Revisión requerida",
  blocked: "Bloqueada",
}

const economicActionStatusLabels: Record<string, string> = {
  pending_review: "Revisión pendiente",
  queued_for_custody: "En custodia",
  executed: "Ejecutada",
  rejected: "Rechazada",
}

const economicActionLabels: Record<string, string> = {
  non_hold_refund: "Reintegro sin hold",
  non_hold_point_payout: "Liquidación sin hold",
}

const economicTransitionLabels: Record<string, string> = {
  queue: "Aprobar cola",
  execute: "Marcar ejecutada",
  reject: "Rechazar",
}

const fiatSettlementIntentStatusLabels: Record<string, string> = {
  intent_registered: "Registrada",
  provider_pending: "Proveedor pendiente",
  provider_dispatched: "Proveedor despachado",
  provider_settled: "Liquidada",
  provider_failed: "Fallida",
  manual_review_required: "Revisión manual",
}

const terminalExecutionStatuses = new Set([
  "executed_noop",
  "executed_cancelled",
  "executed_refunded",
  "executed_released_to_point",
  "failed_review_required",
  "blocked",
])

function canExecuteDispute(dispute: PointDispute) {
  return (
    dispute.status === "resolved" &&
    dispute.makerCheckerStatus === "approved" &&
    Boolean(dispute.resolution) &&
    !terminalExecutionStatuses.has(dispute.resolutionExecutionStatus || "not_started")
  )
}

function formatMinorUnits(value: string | undefined, currency = "") {
  const amount = Number(value ?? 0)
  const decimals = currency.toUpperCase() === "CLP" ? 0 : 2
  const divisor = decimals === 0 ? 1 : 100

  return `${formatPointsDecoNumber(amount / divisor, decimals)} ${currency}`.trim()
}

function formatAmount(value: number | undefined, currency = "") {
  if (typeof value !== "number") return "-"
  return `${formatPointsDecoNumber(value, 2)} ${currency}`.trim()
}

const modules = [
  {
    title: "Puntos activos",
    description: "Comercios, cajeros y empresas aprobadas para atender efectivo.",
    href: "/operaciones/puntos-deco",
    icon: IconMapPin,
    state: "partial" as const,
    percent: 45,
  },
  {
    title: "Órdenes presenciales",
    description: "Cash-in, cash-out y remesas con QR, PIN y tasa bloqueada.",
    href: "/operaciones/puntos-deco",
    icon: IconReceipt,
    state: "partial" as const,
    percent: 35,
  },
  {
    title: "Motor de rutas",
    description: "Ruta física que puede complementar remesas, P2P, ledger y pricing.",
    href: "/operaciones/puntos-deco",
    icon: IconRoute,
    state: "pending" as const,
    percent: 20,
  },
  {
    title: "Riesgo y cumplimiento",
    description: "GPS aproximado, KYC/KYB, límites, reputación y disputas.",
    href: "/operaciones/puntos-deco",
    icon: IconShieldCheck,
    state: "partial" as const,
    percent: 30,
  },
]

export default function PuntosDecoPage() {
  const overview = usePointsDecoOverview()
  const auth = useAdminAuth()
  const [executingDisputeId, setExecutingDisputeId] = useState<string | null>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [reauthOpen, setReauthOpen] = useState(false)
  const [pendingExecutionDisputeId, setPendingExecutionDisputeId] = useState<string | null>(null)
  const [pendingEconomicAction, setPendingEconomicAction] = useState<{
    id: string
    transition: "queue" | "execute" | "reject"
  } | null>(null)
  const [pendingFiatSettlementIntentId, setPendingFiatSettlementIntentId] =
    useState<string | null>(null)
  const [pendingFiatSettlementAction, setPendingFiatSettlementAction] =
    useState<"dispatch" | "settle">("dispatch")
  const [executingEconomicActionId, setExecutingEconomicActionId] = useState<string | null>(null)
  const [dispatchingFiatSettlementIntentId, setDispatchingFiatSettlementIntentId] =
    useState<string | null>(null)
  const [settlingFiatSettlementIntentId, setSettlingFiatSettlementIntentId] =
    useState<string | null>(null)
  const [checkingReauthDisputeId, setCheckingReauthDisputeId] = useState<string | null>(null)
  const [checkingReauthEconomicActionId, setCheckingReauthEconomicActionId] =
    useState<string | null>(null)
  const [checkingReauthFiatSettlementIntentId, setCheckingReauthFiatSettlementIntentId] =
    useState<string | null>(null)
  const connectionState = overview.error ? "pending" : "partial"
  const percent = overview.error ? 20 : Math.max(40, overview.completionPercent)
  const canExecuteSensitiveResolution = canExecutePuntosDecoResolution(auth.user?.roles)

  async function handleExecuteResolution(disputeId: string) {
    setExecutionError(null)
    setExecutingDisputeId(disputeId)

    try {
      await executePointsDecoDisputeResolution(disputeId)
      overview.reload()
    } catch (error) {
      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudo ejecutar la resolución de Puntos Deco",
      )
    } finally {
      setExecutingDisputeId(null)
    }
  }

  async function handleSensitiveExecutionRequest(disputeId: string) {
    setExecutionError(null)
    setCheckingReauthDisputeId(disputeId)

    try {
      const response = await fetch("/api/auth/reauth/status", { cache: "no-store" })
      const status = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error("No se pudo validar la reautenticación del administrador")
      }

      if (status?.email_verified) {
        await handleExecuteResolution(disputeId)
        return
      }

      setPendingExecutionDisputeId(disputeId)
      setReauthOpen(true)
    } catch (error) {
      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudo validar la reautenticación del administrador",
      )
    } finally {
      setCheckingReauthDisputeId(null)
    }
  }

  async function handleEconomicActionTransition(
    actionId: string,
    transition: "queue" | "execute" | "reject",
  ) {
    setExecutionError(null)
    setExecutingEconomicActionId(actionId)

    try {
      await transitionPointsDecoEconomicAction(actionId, transition)
      overview.reload()
    } catch (error) {
      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la acción económica de Puntos Deco",
      )
    } finally {
      setExecutingEconomicActionId(null)
    }
  }

  async function handleSensitiveEconomicActionRequest(
    action: PointEconomicAction,
    transition: "queue" | "execute" | "reject",
  ) {
    setExecutionError(null)
    setCheckingReauthEconomicActionId(action.id)

    try {
      const response = await fetch("/api/auth/reauth/status", { cache: "no-store" })
      const status = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error("No se pudo validar la reautenticación del administrador")
      }

      if (status?.email_verified) {
        await handleEconomicActionTransition(action.id, transition)
        return
      }

      setPendingEconomicAction({ id: action.id, transition })
      setReauthOpen(true)
    } catch (error) {
      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudo validar la reautenticación del administrador",
      )
    } finally {
      setCheckingReauthEconomicActionId(null)
    }
  }

  async function handleFiatSettlementDispatch(intentId: string) {
    setExecutionError(null)
    setDispatchingFiatSettlementIntentId(intentId)

    try {
      await dispatchPointDecoFiatSettlementIntent(intentId)
      overview.reload()
    } catch (error) {
      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el dispatch fiat de Puntos Deco",
      )
    } finally {
      setDispatchingFiatSettlementIntentId(null)
    }
  }

  async function handleFiatSettlementSettle(intent: PointFiatSettlementIntent) {
    setExecutionError(null)
    setSettlingFiatSettlementIntentId(intent.id)

    try {
      await settlePointDecoFiatSettlementIntent(intent)
      overview.reload()
    } catch (error) {
      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudo confirmar la liquidación fiat de Puntos Deco",
      )
    } finally {
      setSettlingFiatSettlementIntentId(null)
    }
  }

  async function handleSensitiveFiatSettlementRequest(
    intent: PointFiatSettlementIntent,
    action: "dispatch" | "settle",
  ) {
    setExecutionError(null)
    setCheckingReauthFiatSettlementIntentId(intent.id)
    setPendingFiatSettlementAction(action)

    try {
      const response = await fetch("/api/auth/reauth/status", { cache: "no-store" })
      const status = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error("No se pudo validar la reautenticación del administrador")
      }

      if (status?.email_verified) {
        if (action === "settle") {
          await handleFiatSettlementSettle(intent)
        } else {
          await handleFiatSettlementDispatch(intent.id)
        }
        return
      }

      setPendingFiatSettlementIntentId(intent.id)
      setReauthOpen(true)
    } catch (error) {
      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudo validar la reautenticación del administrador",
      )
    } finally {
      setCheckingReauthFiatSettlementIntentId(null)
    }
  }

  function handleReauthVerified() {
    const disputeId = pendingExecutionDisputeId
    const economicAction = pendingEconomicAction
    const fiatSettlementIntentId = pendingFiatSettlementIntentId
    const fiatSettlementAction = pendingFiatSettlementAction
    const fiatSettlementIntent = overview.fiatSettlementIntents.find(
      (intent) => intent.id === fiatSettlementIntentId,
    )
    setPendingExecutionDisputeId(null)
    setPendingEconomicAction(null)
    setPendingFiatSettlementIntentId(null)
    setPendingFiatSettlementAction("dispatch")

    if (disputeId) {
      void handleExecuteResolution(disputeId)
    }

    if (economicAction) {
      void handleEconomicActionTransition(economicAction.id, economicAction.transition)
    }

    if (fiatSettlementIntentId && fiatSettlementAction === "dispatch") {
      void handleFiatSettlementDispatch(fiatSettlementIntentId)
    }

    if (fiatSettlementIntent && fiatSettlementAction === "settle") {
      void handleFiatSettlementSettle(fiatSettlementIntent)
    }
  }

  const stats = [
    {
      title: "Puntos registrados",
      value: overview.loading ? "-" : overview.totalPoints,
      icon: <IconBuildingStore className="size-5" />,
      change: { value: 0, label: "Gateway admin", isPositive: !overview.error },
    },
    {
      title: "Puntos activos",
      value: overview.loading ? "-" : overview.activePoints,
      icon: <IconMapPin className="size-5" />,
      change: { value: 0, label: "GPS protegido", isPositive: true },
    },
    {
      title: "Órdenes abiertas",
      value: overview.loading ? "-" : overview.openOrders,
      icon: <IconCash className="size-5" />,
      change: { value: 0, label: "escrow futuro", isPositive: true },
    },
    {
      title: "Disputas",
      value: overview.loading ? "-" : overview.disputedOrders,
      icon: <IconAlertTriangle className="size-5" />,
      change: { value: 0, label: "riesgo", isPositive: overview.disputedOrders === 0 },
    },
    {
      title: "Monedas en caja",
      value: overview.loading ? "-" : overview.cashCurrencies,
      icon: <IconCash className="size-5" />,
      change: { value: 0, label: "conciliación", isPositive: !overview.error },
    },
    {
      title: "Comprobantes",
      value: overview.loading ? "-" : overview.receipts.length,
      icon: <IconReceipt className="size-5" />,
      change: { value: 0, label: "evidencia", isPositive: !overview.error },
    },
    {
      title: "En revisión",
      value: overview.loading
        ? "-"
        : overview.receiptReviewCount +
          overview.settlementReviewCount +
          overview.secureFormReviewCount,
      icon: <IconShieldCheck className="size-5" />,
      change: {
        value: 0,
        label: "control",
        isPositive:
          overview.receiptReviewCount +
            overview.settlementReviewCount +
            overview.secureFormReviewCount ===
          0,
      },
    },
    {
      title: "Liquidaciones",
      value: overview.loading ? "-" : overview.settlements.length,
      icon: <IconScale className="size-5" />,
      change: {
        value: 0,
        label: `${overview.settlementReadyCount} exportables`,
        isPositive: !overview.error,
      },
    },
    {
      title: "Ajustes económicos",
      value: overview.loading ? "-" : overview.economicReviewCount,
      icon: <IconScale className="size-5" />,
      change: {
        value: 0,
        label: "sin hold",
        isPositive: overview.economicReviewCount === 0,
      },
    },
    {
      title: "Dispatch fiat",
      value: overview.loading ? "-" : overview.fiatSettlementPendingCount,
      icon: <IconScale className="size-5" />,
      change: {
        value: 0,
        label: `${overview.fiatSettlementDispatchedCount} despachadas`,
        isPositive: overview.fiatSettlementPendingCount === 0,
      },
    },
    {
      title: "Reporte fiscal",
      value: overview.loading ? "-" : overview.fiscalReadyCount,
      icon: <IconFileExport className="size-5" />,
      change: {
        value: 0,
        label: `${overview.fiscalReviewCount} en revisión`,
        isPositive: overview.fiscalReviewCount === 0,
      },
    },
    {
      title: "Formularios seguros",
      value: overview.loading ? "-" : overview.secureFormReviewCount,
      icon: <IconShieldCheck className="size-5" />,
      change: {
        value: 0,
        label: "soportes",
        isPositive: overview.secureFormReviewCount === 0,
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Puntos Deco"
        description="Red física verificada para recargas, retiros, remesas y operaciones asistidas de efectivo."
        state={connectionState}
        percent={percent}
        note="Línea operativa independiente. Puede consumir P2P, Remesas, Bolsillito, Custodia, Ledger y Pricing, pero no reemplaza esos dominios."
      />

      {overview.error ? (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-300">
            {overview.error}. Revisa que Gateway Admin y points-deco-core estén activos.
          </CardContent>
        </Card>
      ) : null}

      {executionError ? (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="py-4 text-sm text-red-700 dark:text-red-300">
            {executionError}
          </CardContent>
        </Card>
      ) : null}

      <StatsCards stats={stats} />

      <Card className="rounded-[1.5rem]">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold">Disputas operativas</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Casos abiertos desde órdenes presenciales. La resolución queda auditada y no mueve
              saldos hasta pasar por conciliación y control administrativo.
            </p>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {overview.loading ? "Consultando" : `${overview.disputes.length} casos`}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {overview.disputes.length > 0 ? (
              overview.disputes.slice(0, 6).map((dispute) => (
                <div
                  key={dispute.id}
                  className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_12px_36px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_12px_36px_rgb(148_163_184/0.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold">{dispute.orderId}</p>
                      <p className="text-sm text-muted-foreground">
                        {serviceLabels[dispute.orderType || ""] || dispute.orderType || "Orden"} ·{" "}
                        {dispute.pointId || "Punto sin asignar"}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {disputeStatusLabels[dispute.status] || dispute.status}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {dispute.reason || "Sin motivo registrado."}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <span>
                      Origen: {formatAmount(dispute.amountOrigin, dispute.originCurrency)}
                    </span>
                    <span>
                      Destino:{" "}
                      {formatAmount(
                        dispute.amountDestinationEstimated,
                        dispute.destinationCurrency,
                      )}
                    </span>
                    <span>Abierta por: {dispute.openedByRole || "usuario"}</span>
                    <span>SLA: {dispute.slaDueAt ? new Date(dispute.slaDueAt).toLocaleString("es-CO") : "-"}</span>
                  </div>
                  <div className="mt-4 rounded-[1rem] border bg-background/65 p-3 text-sm text-muted-foreground dark:bg-black/30">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-foreground">Control maker-checker</span>
                      <Badge variant="outline" className="rounded-full">
                        {makerCheckerStatusLabels[
                          dispute.makerCheckerStatus || "not_required"
                        ] || dispute.makerCheckerStatus}
                      </Badge>
                    </div>
                    <div className="mt-2 grid gap-1 md:grid-cols-2">
                      <span>Maker: {dispute.preparedBy || "-"}</span>
                      <span>Checker: {dispute.checkedBy || "-"}</span>
                      <span>
                        Ejecución:{" "}
                        {executionStatusLabels[
                          dispute.resolutionExecutionStatus || "not_started"
                        ] || dispute.resolutionExecutionStatus}
                      </span>
                      <span>Ejecutor: {dispute.executedBy || "-"}</span>
                    </div>
                    {dispute.resolution ? (
                      <p className="mt-2">
                        Resolución: {dispute.resolution} ·{" "}
                        {dispute.resolutionReason || "sin nota"}
                      </p>
                    ) : null}
                    {dispute.resolutionExecutionPlan ? (
                      <p className="mt-2">{dispute.resolutionExecutionPlan}</p>
                    ) : null}
                    <DisputeExecutionTimeline dispute={dispute} />
                    {canExecuteDispute(dispute) && canExecuteSensitiveResolution ? (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-3 rounded-full"
                        disabled={
                          executingDisputeId === dispute.id ||
                          checkingReauthDisputeId === dispute.id
                        }
                        onClick={() => void handleSensitiveExecutionRequest(dispute.id)}
                      >
                        {executingDisputeId === dispute.id
                          ? "Ejecutando..."
                          : checkingReauthDisputeId === dispute.id
                            ? "Validando..."
                            : "Ejecutar resolución"}
                      </Button>
                    ) : null}
                    {canExecuteDispute(dispute) &&
                    !auth.loading &&
                    !canExecuteSensitiveResolution ? (
                      <p className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-300">
                        Requiere rol admin o super_admin para ejecutar resolución.
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border bg-background/55 p-5 text-sm text-muted-foreground md:col-span-2">
                Sin disputas activas. Cuando una orden entre a revisión, aparecerá aquí con SLA,
                monto, punto y motivo para seguimiento administrativo.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem]">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold">
              Acciones económicas sin hold
            </CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Ajustes creados cuando una disputa aprobada no tiene hold confirmado para liberar
              o capturar. No mueven dinero automáticamente; quedan para custodia, ledger o
              conciliación controlada.
            </p>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {overview.loading ? "Consultando" : `${overview.economicActions.length} acciones`}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {overview.economicActions.length > 0 ? (
              overview.economicActions.slice(0, 6).map((action) => (
                <div
                  key={action.id}
                  className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_12px_36px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_12px_36px_rgb(148_163_184/0.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold">{action.orderId}</p>
                      <p className="text-sm text-muted-foreground">
                        {economicActionLabels[action.actionType] || action.actionType} ·{" "}
                        {action.pointId || "Punto sin asignar"}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {economicActionStatusLabels[action.status] || action.status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <span>Disputa: {action.disputeId}</span>
                    <span>Hold: {action.ledgerHoldStatus || "sin estado"}</span>
                    <span>Usuario: {action.userId || "-"}</span>
                    <span>Creada por: {action.createdBy || "-"}</span>
                    <span>
                      Origen: {formatAmount(action.amountOrigin, action.originCurrency)}
                    </span>
                    <span>
                      Destino:{" "}
                      {formatAmount(
                        action.amountDestinationEstimated,
                        action.destinationCurrency,
                      )}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {action.requiredAction}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {action.reason}
                  </p>
                  {action.reviewedBy || action.executedBy || action.rejectedBy ? (
                    <div className="mt-3 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
                      <span>Revisión: {action.reviewedBy || "-"}</span>
                      <span>Ejecución: {action.executedBy || "-"}</span>
                      <span>Rechazo: {action.rejectedBy || "-"}</span>
                      <span>Referencia: {action.executionReference || "-"}</span>
                    </div>
                  ) : null}
                  {["pending_review", "queued_for_custody"].includes(action.status) &&
                  canExecuteSensitiveResolution ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {action.status === "pending_review" ? (
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full"
                          disabled={
                            executingEconomicActionId === action.id ||
                            checkingReauthEconomicActionId === action.id
                          }
                          onClick={() =>
                            void handleSensitiveEconomicActionRequest(action, "queue")
                          }
                        >
                          {checkingReauthEconomicActionId === action.id ||
                          executingEconomicActionId === action.id
                            ? "Validando..."
                            : economicTransitionLabels.queue}
                        </Button>
                      ) : null}
                      {action.status === "queued_for_custody" ? (
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full"
                          disabled={
                            executingEconomicActionId === action.id ||
                            checkingReauthEconomicActionId === action.id
                          }
                          onClick={() =>
                            void handleSensitiveEconomicActionRequest(action, "execute")
                          }
                        >
                          {checkingReauthEconomicActionId === action.id ||
                          executingEconomicActionId === action.id
                            ? "Validando..."
                            : economicTransitionLabels.execute}
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={
                          executingEconomicActionId === action.id ||
                          checkingReauthEconomicActionId === action.id
                        }
                        onClick={() =>
                          void handleSensitiveEconomicActionRequest(action, "reject")
                        }
                      >
                        {economicTransitionLabels.reject}
                      </Button>
                    </div>
                  ) : null}
                  {["pending_review", "queued_for_custody"].includes(action.status) &&
                  !auth.loading &&
                  !canExecuteSensitiveResolution ? (
                    <p className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-300">
                      Requiere rol admin o super_admin para cambiar esta acción.
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border bg-background/55 p-5 text-sm text-muted-foreground md:col-span-2">
                Sin ajustes económicos pendientes. Si una resolución aprobada no puede usar un
                hold seguro, aparecerá aquí antes de cualquier movimiento de saldo.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem]">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold">
              Intenciones custody-fiat
            </CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Registros previos al payout contable. Registrar dispatch solo deja proveedor,
              referencia y auditoría; la liquidación real se confirma después por conciliación.
            </p>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {overview.loading
              ? "Consultando"
              : `${overview.fiatSettlementIntents.length} intenciones`}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {overview.fiatSettlementIntents.length > 0 ? (
              overview.fiatSettlementIntents.slice(0, 6).map((intent) => (
                <div
                  key={intent.id}
                  className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_12px_36px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_12px_36px_rgb(148_163_184/0.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold">{intent.orderId}</p>
                      <p className="text-sm text-muted-foreground">
                        {intent.pointId || "Punto sin asignar"} · {intent.providerHint}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {fiatSettlementIntentStatusLabels[intent.status] || intent.status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <span>Acción: {intent.actionId}</span>
                    <span>Monto: {formatMinorUnits(intent.amountMinorUnits, intent.currency)}</span>
                    <span>Modo: {intent.providerMode}</span>
                    <span>Referencia: {intent.dispatchReference || "-"}</span>
                    <span>Despachó: {intent.dispatchedBy || "-"}</span>
                    <span>Liquidación: {intent.settlementReference || "-"}</span>
                    <span>Confirmó: {intent.settledBy || "-"}</span>
                    <span>
                      Dispatch:{" "}
                      {intent.dispatchedAtIso
                        ? new Date(intent.dispatchedAtIso).toLocaleString("es-CO")
                        : "-"}
                    </span>
                    <span>
                      Liquidada:{" "}
                      {intent.settledAtIso
                        ? new Date(intent.settledAtIso).toLocaleString("es-CO")
                        : "-"}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {intent.reason || "Sin motivo registrado."}
                  </p>
                  {intent.status === "provider_pending" && canExecuteSensitiveResolution ? (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-4 rounded-full"
                      disabled={
                        dispatchingFiatSettlementIntentId === intent.id ||
                        checkingReauthFiatSettlementIntentId === intent.id
                      }
                      onClick={() => void handleSensitiveFiatSettlementRequest(intent, "dispatch")}
                    >
                      {dispatchingFiatSettlementIntentId === intent.id
                        ? "Registrando..."
                        : checkingReauthFiatSettlementIntentId === intent.id
                          ? "Validando..."
                          : "Registrar dispatch"}
                    </Button>
                  ) : null}
                  {intent.status === "provider_pending" &&
                  !auth.loading &&
                  !canExecuteSensitiveResolution ? (
                    <p className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-300">
                      Requiere rol admin o super_admin para registrar dispatch.
                    </p>
                  ) : null}
                  {intent.status === "provider_dispatched" && canExecuteSensitiveResolution ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-4 rounded-full"
                      disabled={
                        settlingFiatSettlementIntentId === intent.id ||
                        checkingReauthFiatSettlementIntentId === intent.id
                      }
                      onClick={() => void handleSensitiveFiatSettlementRequest(intent, "settle")}
                    >
                      {settlingFiatSettlementIntentId === intent.id
                        ? "Confirmando..."
                        : checkingReauthFiatSettlementIntentId === intent.id
                          ? "Validando..."
                          : "Confirmar liquidación"}
                    </Button>
                  ) : null}
                  {intent.status === "provider_dispatched" &&
                  !auth.loading &&
                  !canExecuteSensitiveResolution ? (
                    <p className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-300">
                      Requiere rol admin o super_admin para confirmar liquidación.
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border bg-background/55 p-5 text-sm text-muted-foreground md:col-span-2">
                Sin intenciones fiat pendientes. Cuando una acción release_to_point requiera
                custody-fiat, aparecerá aquí antes de cualquier conciliación de proveedor.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 @5xl/main:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[1.5rem]">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-2xl font-extrabold">Caja y conciliación</CardTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Saldos físicos internos por punto y moneda. El usuario final solo ve rangos
                seguros; el saldo exacto queda para operación y auditoría.
              </p>
            </div>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
              {overview.cashSummary?.positions ?? 0} posiciones
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {(overview.cashSummary?.currencies ?? []).length > 0 ? (
                overview.cashSummary?.currencies.map((item) => (
                  <div
                    key={item.currency}
                    className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_12px_36px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_12px_36px_rgb(148_163_184/0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-extrabold">{item.currency}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.positions} posiciones activas
                        </p>
                      </div>
                      <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        Caja
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                      <span>Saldo: {formatMinorUnits(item.balanceMinorUnits, item.currency)}</span>
                      <span>Entradas: {formatMinorUnits(item.cashInMinorUnits, item.currency)}</span>
                      <span>Salidas: {formatMinorUnits(item.cashOutMinorUnits, item.currency)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border bg-background/55 p-5 text-sm text-muted-foreground md:col-span-2">
                  Sin movimientos de caja todavía. Cuando existan confirmaciones de efectivo,
                  esta sección mostrará conciliación por moneda.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem]">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold">Comprobantes</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Evidencia operativa por orden para revisión administrativa y exportación futura.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {overview.receipts.length > 0 ? (
                overview.receipts.slice(0, 5).map((receipt) => (
                  <div
                    key={receipt.id}
                    className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_12px_36px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_12px_36px_rgb(148_163_184/0.06)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold">{receipt.orderId}</p>
                        <p className="text-sm text-muted-foreground">
                          {serviceLabels[receipt.type] || receipt.type} · {receipt.orderStatus}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full">
                          {receiptStatusLabels[receipt.status] || receipt.status}
                        </Badge>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-full font-bold"
                        >
                          <Link
                            href={`/api/points-deco/orders/${encodeURIComponent(receipt.orderId)}/receipt.pdf`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Descargar PDF
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {receipt.evidence.cashMovements} movimientos ·{" "}
                      {receipt.evidence.auditTrailEvents} eventos auditados
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border bg-background/55 p-5 text-sm text-muted-foreground">
                  Aún no hay comprobantes operativos generados por órdenes reales.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.5rem]">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold">Liquidación y cierre fiscal</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Cruza efectivo recibido, efectivo entregado, estado de ledger, límites y
              comprobantes antes de permitir cierre final o exportación fiscal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
              {overview.fiscalReadyCount} listas para exportar
            </Badge>
            <a
              href="/api/points-deco/reports/fiscal.csv?limit=100"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-[0_14px_36px_rgb(15_23_42/0.12)] transition hover:opacity-90 dark:shadow-[0_14px_36px_rgb(255_108_2/0.16)]"
            >
              <IconFileExport className="size-4" />
              CSV fiscal
            </a>
            <a
              href="/api/points-deco/reports/monthly.csv?limit=500"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border bg-background px-4 text-sm font-extrabold shadow-[0_14px_36px_rgb(15_23_42/0.08)] transition hover:bg-accent dark:bg-black/35 dark:shadow-[0_14px_36px_rgb(148_163_184/0.06)]"
            >
              <IconFileExport className="size-4" />
              CSV mensual
            </a>
            <a
              href="/api/points-deco/reports/audit-export.csv?limit=500"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border bg-background px-4 text-sm font-extrabold shadow-[0_14px_36px_rgb(15_23_42/0.08)] transition hover:bg-accent dark:bg-black/35 dark:shadow-[0_14px_36px_rgb(148_163_184/0.06)]"
            >
              <IconFileExport className="size-4" />
              CSV auditoría
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-6">
            {[
              {
                label: "Liquidaciones",
                value: overview.fiscalReport?.summary.settlements ?? overview.settlements.length,
              },
              {
                label: "Balanceadas",
                value: overview.fiscalReport?.summary.balanced ?? overview.settlementReadyCount,
              },
              {
                label: "CSV listas",
                value: overview.fiscalReadyCount,
              },
              {
                label: "Revisión",
                value: overview.fiscalReviewCount,
              },
              {
                label: "Grupos mensuales",
                value: overview.monthlyReport?.summary.groups ?? 0,
              },
              {
                label: "Órdenes auditables",
                value: overview.auditExport?.summary.orders ?? 0,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_12px_36px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_12px_36px_rgb(148_163_184/0.06)]"
              >
                <p className="text-2xl font-extrabold">{overview.loading ? "-" : item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {overview.settlements.length > 0 ? (
              overview.settlements.slice(0, 6).map((settlement) => (
                <div
                  key={settlement.id}
                  className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_12px_36px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_12px_36px_rgb(148_163_184/0.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold">{settlement.orderId}</p>
                      <p className="text-sm text-muted-foreground">
                        {serviceLabels[settlement.type] || settlement.type} ·{" "}
                        {settlement.ledgerStatus}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {settlementStatusLabels[settlement.status] || settlement.status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <span>
                      Origen:{" "}
                      {formatMinorUnits(
                        settlement.originDifferenceMinorUnits,
                        settlement.originCurrency,
                      )}
                    </span>
                    <span>
                      Destino:{" "}
                      {formatMinorUnits(
                        settlement.destinationDifferenceMinorUnits,
                        settlement.destinationCurrency,
                      )}
                    </span>
                  </div>
                  {settlement.reviewReasons.length > 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Revisión: {settlement.reviewReasons.join(", ")}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">
                      Conciliación balanceada y lista para exportación.
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border bg-background/55 p-5 text-sm text-muted-foreground md:col-span-2">
                Aún no hay liquidaciones. Cuando una orden cierre conciliación, aparecerá aquí
                con diferencias, revisión y estado fiscal.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem]">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold">Formularios seguros</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Soportes estructurados por operación, punto o usuario. Se guardan campos
              controlados, consentimiento, referencias de evidencia y auditoría; no documentos
              sensibles sueltos por chat.
            </p>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {overview.loading ? "Consultando" : `${overview.secureForms.length} soportes`}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {overview.secureForms.length > 0 ? (
              overview.secureForms.slice(0, 6).map((form) => (
                <div
                  key={form.id}
                  className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_12px_36px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_12px_36px_rgb(148_163_184/0.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold">
                        {secureFormTypeLabels[form.type] || form.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {form.orderId || form.pointId || form.userId || "Sin referencia"} ·{" "}
                        {form.submittedByRole || "solicitante"}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {secureFormStatusLabels[form.status] || form.status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <span>Orden: {form.orderId || "-"}</span>
                    <span>Punto: {form.pointId || "-"}</span>
                    <span>Usuario: {form.userId || "-"}</span>
                    <span>Evidencias: {form.evidenceRefs?.length ?? 0}</span>
                    <span>Consentimiento: {form.consentAccepted ? "Sí" : "No"}</span>
                    <span>
                      Expira:{" "}
                      {form.expiresAt ? new Date(form.expiresAt).toLocaleString("es-CO") : "-"}
                    </span>
                  </div>
                  {form.reviewedBy || form.reviewNote ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      Revisión: {form.reviewedBy || "-"} · {form.reviewNote || "sin nota"}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border bg-background/55 p-5 text-sm text-muted-foreground md:col-span-2">
                Sin formularios seguros pendientes. Cuando una operación requiera origen de
                fondos, soporte fiscal, identidad o evidencia de proveedor, aparecerá aquí para
                revisión por Gateway Admin.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon

          return (
            <Link key={module.title} href={module.href}>
              <Card className="h-full cursor-pointer rounded-[1.5rem] bg-card/90 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgb(15_23_42/0.12)] dark:bg-black/45 dark:hover:shadow-[0_18px_55px_rgb(148_163_184/0.08)]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full border bg-background/75">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <ConnectionStatusBadge state={module.state} percent={module.percent} />
                  </div>
                  <CardTitle className="mt-5 text-xl font-extrabold tracking-tight">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{module.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="rounded-[1.5rem]">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold">Red operativa</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              La dirección exacta del punto no se expone públicamente. Solo se revela cuando
              la operación queda aceptada y protegida por flujo de confirmación.
            </p>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {overview.loading
              ? "Consultando"
              : `${formatPointsDecoNumber(overview.points.length)} puntos`}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {overview.points.length > 0 ? (
              overview.points.map((point) => (
                <div
                  key={point.id}
                  className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_12px_36px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_12px_36px_rgb(148_163_184/0.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-extrabold">{point.tradeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {point.city} · {point.zone} · {point.country}
                      </p>
                    </div>
                    <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      {point.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {point.allowedServices.map((service) => (
                      <Badge key={service} variant="outline" className="rounded-full">
                        {serviceLabels[service] || service}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                    <span>{point.liquidityRangeLabel}</span>
                    <span>{point.scheduleLabel}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border bg-background/55 p-5 text-sm text-muted-foreground md:col-span-2">
                No hay puntos para mostrar todavía. Cuando el micro responda, esta vista leerá
                la red por Gateway Admin.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EmailReauthDialog
        open={reauthOpen}
        onOpenChange={setReauthOpen}
        onVerified={handleReauthVerified}
        title={
          pendingFiatSettlementIntentId
            ? pendingFiatSettlementAction === "settle"
              ? "Autorizar liquidación fiat"
              : "Autorizar dispatch fiat"
            : pendingEconomicAction
              ? "Autorizar acción económica"
              : "Autorizar resolución"
        }
        description={
          pendingFiatSettlementIntentId
            ? pendingFiatSettlementAction === "settle"
              ? "Esta acción confirma liquidación real con evidencia y conciliación bancaria para una intención custody-fiat. Confirma con el código enviado al correo del administrador."
              : "Esta acción registra un dispatch de proveedor para una intención custody-fiat. Confirma con el código enviado al correo del administrador."
            : pendingEconomicAction
            ? "Esta acción cambia el estado de un ajuste económico Puntos Deco sin hold confirmado. Confirma con el código enviado al correo del administrador."
            : "Esta acción mueve el estado económico de una disputa Puntos Deco. Confirma con el código enviado al correo del administrador."
        }
      />
    </div>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export type CryptoFlowStatus = "matched" | "review" | "blocked"

export type CryptoFlowAuditItem = {
  id: string
  userId?: string
  asset: string
  network: string
  type: "deposit" | "withdrawal" | "sweep"
  txHash: string
  expectedAmount: number
  onChainAmount: number
  difference: number
  confirmations: number
  status: CryptoFlowStatus
  walletClass: string
  evidence?: {
    evidenceId?: string
    checksum?: string
  }
  lastCheckedAt: string
  note: string
}

export type CryptoFlowAuditActionType = "block-withdrawal" | "release-balance" | "open-investigation"

export type CryptoFlowAuditAction = {
  actionId: string
  type: "block_withdrawal" | "release_balance" | "open_investigation"
  status: string
  actorId: string
  actorEmail: string
  userId: string
  asset: string
  network: string
  txHash: string
  flowId: string
  evidenceId: string
  evidenceChecksum: string
  reason: string
  notes: string
  approvedById?: string
  approvedByEmail?: string
  approvedAt?: string
  approvalReason?: string
  rejectedById?: string
  rejectedByEmail?: string
  rejectedAt?: string
  rejectionReason?: string
  executedById?: string
  executedByEmail?: string
  executedAt?: string
  executionStatus?: string
  executionMessage?: string
  transitionHistory?: Array<{
    operation: string
    fromStatus: string
    toStatus: string
    actorId: string
    actorEmail: string
    reason: string
    notes: string
    createdAt: string
  }>
  createdAt: string
  updatedAt?: string
}

export type CreateCryptoFlowAuditActionInput = {
  actionType: CryptoFlowAuditActionType
  flow: CryptoFlowAuditItem
  reason: string
  notes?: string
}

export type CryptoFlowAuditActionOperation = "approve" | "reject" | "execute"

export type TransitionCryptoFlowAuditActionInput = {
  actionId: string
  operation: CryptoFlowAuditActionOperation
  reason: string
  notes?: string
}

type CryptoFlowAlert = {
  id: string
  severity: "low" | "medium" | "high"
  title: string
  description: string
  createdAt: string
}

type CryptoFlowControl = {
  id: string
  name: string
  status: CryptoFlowStatus
  description: string
}

type CryptoFlowOverview = {
  summary?: {
    status?: CryptoFlowStatus
    flows?: number
    matched?: number
    review?: number
    blocked?: number
    totalDifference?: number
    networks?: number
    lastCheckedAt?: string
    ledgerDb?: string
  }
  alerts?: CryptoFlowAlert[]
  reconciliation?: {
    data?: CryptoFlowAuditItem[]
  }
  controls?: CryptoFlowControl[]
}

type CryptoFlowActionsResponse = {
  data?: CryptoFlowAuditAction[]
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

async function writeJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message ?? `${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export function useCryptoFlowsAudit() {
  const [overview, setOverview] = useState<CryptoFlowOverview | null>(null)
  const [actions, setActions] = useState<CryptoFlowAuditAction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setActionError(null)

    try {
      const data = await readJson<CryptoFlowOverview>("/api/audit-crypto-flows/overview")
      setOverview(data)

      const actionData = await readJson<CryptoFlowActionsResponse>("/api/audit-crypto-flows/actions").catch(() => ({
        data: [],
      }))
      setActions(actionData.data ?? [])
    } catch {
      setOverview(null)
      setError("No se pudo consultar flujos crypto por Gateway Admin.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createAction = useCallback(async (input: CreateCryptoFlowAuditActionInput) => {
    setActionLoading(true)
    setActionError(null)

    try {
      const record = await writeJson<CryptoFlowAuditAction>(`/api/audit-crypto-flows/actions/${input.actionType}`, {
        actorId: "admin-panel",
        actorEmail: "admin@deco31416.com",
        userId: input.flow.userId ?? "",
        asset: input.flow.asset,
        network: input.flow.network,
        txHash: input.flow.txHash,
        flowId: input.flow.id,
        evidenceId: input.flow.evidence?.evidenceId ?? input.flow.id,
        evidenceChecksum: input.flow.evidence?.checksum ?? "",
        reason: input.reason,
        notes: input.notes,
        metadata: {
          source: "admin-panel",
          status: input.flow.status,
          walletClass: input.flow.walletClass,
        },
      })
      setActions((current) => [record, ...current])
      return record
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar la acción auditada."
      setActionError(message)
      throw error
    } finally {
      setActionLoading(false)
    }
  }, [])

  const transitionAction = useCallback(async (input: TransitionCryptoFlowAuditActionInput) => {
    setActionLoading(true)
    setActionError(null)

    try {
      const record = await writeJson<CryptoFlowAuditAction>(
        `/api/audit-crypto-flows/actions/${input.actionId}/${input.operation}`,
        {
          actorId: "admin-panel",
          actorEmail: "admin@deco31416.com",
          reason: input.reason,
          notes: input.notes,
          metadata: {
            source: "admin-panel",
            operation: input.operation,
          },
        }
      )
      setActions((current) => current.map((action) => (action.actionId === record.actionId ? record : action)))
      return record
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la acción auditada."
      setActionError(message)
      throw error
    } finally {
      setActionLoading(false)
    }
  }, [])

  const reconciliation = overview?.reconciliation?.data ?? []

  const summary = useMemo(() => {
    const review = reconciliation.filter((item) => item.status === "review").length
    const blocked = reconciliation.filter((item) => item.status === "blocked").length
    const matched = reconciliation.filter((item) => item.status === "matched").length

    return {
      status: overview?.summary?.status ?? (blocked ? "blocked" : review ? "review" : "matched"),
      flows: overview?.summary?.flows ?? reconciliation.length,
      matched: overview?.summary?.matched ?? matched,
      review: overview?.summary?.review ?? review,
      blocked: overview?.summary?.blocked ?? blocked,
      networks: overview?.summary?.networks ?? 0,
      totalDifference:
        overview?.summary?.totalDifference ??
        reconciliation.reduce((sum, item) => sum + Math.abs(item.difference), 0),
      lastCheckedAt: overview?.summary?.lastCheckedAt,
      ledgerDb: overview?.summary?.ledgerDb,
    }
  }, [overview, reconciliation])

  return {
    overview,
    summary,
    alerts: overview?.alerts ?? [],
    controls: overview?.controls ?? [],
    reconciliation,
    actions,
    actionLoading,
    actionError,
    createAction,
    transitionAction,
    refresh: load,
    loading,
    error,
  }
}

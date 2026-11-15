"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type {
  LimitEvaluation,
  LimitPolicyChange,
  LimitPolicyChangeRequest,
  LimitPolicyRule,
  LimitsOverview,
} from "./types"

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) return null as T
  return JSON.parse(text) as T
}

function normalizeRules(payload: unknown): LimitPolicyRule[] {
  const value =
    payload && typeof payload === "object"
      ? ((payload as { items?: unknown; data?: unknown }).items ??
        (payload as { items?: unknown; data?: unknown }).data)
      : []

  return Array.isArray(value) ? (value as LimitPolicyRule[]) : []
}

function normalizeChanges(payload: unknown): LimitPolicyChange[] {
  const value =
    payload && typeof payload === "object"
      ? ((payload as { items?: unknown; data?: unknown }).items ??
        (payload as { items?: unknown; data?: unknown }).data)
      : []

  return Array.isArray(value) ? (value as LimitPolicyChange[]) : []
}

function normalizeRequests(payload: unknown): LimitPolicyChangeRequest[] {
  const value =
    payload && typeof payload === "object"
      ? ((payload as { items?: unknown; data?: unknown }).items ??
        (payload as { items?: unknown; data?: unknown }).data)
      : []

  return Array.isArray(value) ? (value as LimitPolicyChangeRequest[]) : []
}

export function useLimitPolicies() {
  const [overview, setOverview] = useState<LimitsOverview | null>(null)
  const [rules, setRules] = useState<LimitPolicyRule[]>([])
  const [changes, setChanges] = useState<LimitPolicyChange[]>([])
  const [requests, setRequests] = useState<LimitPolicyChangeRequest[]>([])
  const [evaluation, setEvaluation] = useState<LimitEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [
        overviewResponse,
        rulesResponse,
        evaluationResponse,
        changesResponse,
        requestsResponse,
      ] = await Promise.all([
        fetch("/api/limits-policy/overview", { cache: "no-store" }),
        fetch("/api/limits-policy/rules", { cache: "no-store" }),
        fetch(
          "/api/limits-policy/evaluate?operation=WITHDRAW&assetType=FIAT&currency=COP&country=CO&amount=1500000&kycLevel=LEVEL_2&riskLevel=GREEN&product=WITHDRAWALS",
          { cache: "no-store" },
        ),
        fetch("/api/limits-policy/changes?limit=6", { cache: "no-store" }),
        fetch("/api/limits-policy/requests?status=PENDING&limit=10", { cache: "no-store" }),
      ])

      if (
        !overviewResponse.ok ||
        !rulesResponse.ok ||
        !evaluationResponse.ok ||
        !changesResponse.ok ||
        !requestsResponse.ok
      ) {
        throw new Error("No se pudo leer el motor de límites por Gateway Admin.")
      }

      const [
        overviewPayload,
        rulesPayload,
        evaluationPayload,
        changesPayload,
        requestsPayload,
      ] = await Promise.all([
        readJson<LimitsOverview>(overviewResponse),
        readJson<unknown>(rulesResponse),
        readJson<LimitEvaluation>(evaluationResponse),
        readJson<unknown>(changesResponse),
        readJson<unknown>(requestsResponse),
      ])

      setOverview(overviewPayload)
      setRules(normalizeRules(rulesPayload))
      setEvaluation(evaluationPayload)
      setChanges(normalizeChanges(changesPayload))
      setRequests(normalizeRequests(requestsPayload))
    } catch (cause) {
      setOverview(null)
      setRules([])
      setChanges([])
      setRequests([])
      setEvaluation(null)
      setError(cause instanceof Error ? cause.message : "Error desconocido.")
    } finally {
      setLoading(false)
    }
  }, [])

  const requestRuleChange = useCallback(
    async (ruleId: string, payload: { enabled?: boolean; requiresApproval?: boolean; reason: string }) => {
      const response = await fetch(`/api/limits-policy/rules/${ruleId}/requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await readJson<{ message?: string; error?: string }>(response)
        throw new Error(error?.message || error?.error || "No se pudo actualizar la regla.")
      }

      await load()
    },
    [load],
  )

  const reviewRequest = useCallback(
    async (requestId: string, action: "approve" | "reject", reason: string) => {
      const response = await fetch(`/api/limits-policy/requests/${requestId}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        const error = await readJson<{ message?: string; error?: string }>(response)
        throw new Error(error?.message || error?.error || "No se pudo revisar la solicitud.")
      }

      await load()
    },
    [load],
  )

  useEffect(() => {
    void load()
  }, [load])

  const summary = useMemo(() => {
    const enabled = rules.filter((rule) => rule.enabled).length
    const approval = rules.filter((rule) => rule.requiresApproval).length
    const fiat = rules.filter((rule) => rule.assetType === "FIAT").length
    const risk = rules.filter((rule) => rule.scope === "RISK_LEVEL").length

    return {
      total: overview?.totalRules ?? rules.length,
      enabled: overview?.enabledRules ?? enabled,
      approval: overview?.approvalRules ?? approval,
      fiat: overview?.fiatRules ?? fiat,
      risk: overview?.riskRules ?? risk,
      pending: overview?.pendingRequests ?? requests.length,
    }
  }, [overview, requests.length, rules])

  return {
    overview,
    rules,
    changes,
    requests,
    evaluation,
    loading,
    error,
    summary,
    reload: load,
    requestRuleChange,
    reviewRequest,
  }
}

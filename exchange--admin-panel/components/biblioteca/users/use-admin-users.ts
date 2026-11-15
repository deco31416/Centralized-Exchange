"use client"

import { useEffect, useMemo, useState } from "react"

export type NormalizedAdminUser = {
  id: string
  userName: string
  email: string
  status: string
  statusLabel: string
  kycStatus: string
  tier: string
  country: string
  createdAt: string
  lastLogin: string
}

type UseAdminUsersOptions = {
  status?: string
  role?: string
}

function pickString(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim().length > 0)
  return typeof value === "string" ? value : ""
}

function normalizeStatus(status: string) {
  const normalized = status.toLowerCase()
  if (["active", "activo", "enabled"].includes(normalized)) return "Activo"
  if (["pending", "pending_verification", "pendiente", "unverified"].includes(normalized)) return "Pendiente"
  if (["locked", "blocked", "bloqueado", "suspended", "suspendido"].includes(normalized)) return "Bloqueado"
  if (["inactive", "inactivo", "disabled"].includes(normalized)) return "Inactivo"
  return status || "Sin estado"
}

function normalizeUsersPayload(payload: any): NormalizedAdminUser[] {
  const rawUsers = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.users)
      ? payload.users
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.results)
          ? payload.results
          : []

  return rawUsers.map((user: any, index: number) => {
    const id = pickString(user.id, user._id, user.userId, user.uid) || `user-${index + 1}`
    const email = pickString(user.email, user.primaryEmail, user.email_address)
    const firstName = pickString(user.firstName, user.first_name)
    const lastName = pickString(user.lastName, user.last_name)
    const userName =
      pickString(user.username, user.name, `${firstName} ${lastName}`.trim()) ||
      email.split("@")[0] ||
      id
    const status = pickString(user.status, user.accountStatus)

    return {
      id,
      userName,
      email: email || "Sin email",
      status,
      statusLabel: normalizeStatus(status),
      kycStatus: pickString(user.kycStatus, user.kyc_status, user.kycLevel, user.kyc_level) || "No disponible",
      tier: pickString(user.tier, user.level, user.vipTier, user.vip_tier) || "General",
      country: pickString(user.country, user.countryCode, user.country_code) || "—",
      createdAt: pickString(user.createdAt, user.created_at) || "—",
      lastLogin: pickString(user.lastLogin, user.last_login, user.lastActivity) || "—",
    }
  })
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const [users, setUsers] = useState<NormalizedAdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [source, setSource] = useState<"list" | "count-only">("list")
  const [note, setNote] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchUsers() {
      setLoading(true)
      setError(null)
      setNote(null)

      try {
        const params = new URLSearchParams({ limit: "100" })
        if (options.status) params.set("status", options.status)
        if (options.role) params.set("role", options.role)

        const response = await fetch(`/api/users?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(payload?.error || "No se pudo consultar usuarios")
        }

        const normalized = normalizeUsersPayload(payload)
        setUsers(normalized)
        setTotal(Number(payload?.total ?? payload?.count ?? normalized.length))
        setSource(payload?.source === "count-only" ? "count-only" : "list")
        setNote(payload?.note || null)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Error desconocido")
          setUsers([])
          setTotal(0)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchUsers()
    return () => controller.abort()
  }, [options.role, options.status])

  const summary = useMemo(() => {
    const active = users.filter((user) => user.statusLabel === "Activo").length
    const pending = users.filter((user) => user.statusLabel === "Pendiente").length
    const blocked = users.filter((user) => user.statusLabel === "Bloqueado").length
    const vip = users.filter((user) => /vip|premium|diamond|platinum|gold/i.test(user.tier)).length

    return {
      total: source === "count-only" ? total : users.length,
      active,
      pending,
      blocked,
      vip,
    }
  }, [source, total, users])

  return { users, total, source, note, loading, error, summary }
}

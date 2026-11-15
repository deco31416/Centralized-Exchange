"use client"

import { useEffect, useMemo, useState } from "react"

export type P2POrder = {
  orderId: string
  adId?: string
  buyerId: string
  sellerId: string
  assetCode: string
  fiatCode: string
  cryptoAmount: number
  fiatAmount: number
  price: number
  paymentMethodId?: string
  paymentStatus?: string
  status: string
  paymentRail?: string
  createdAt?: string
  updatedAt?: string
}

export type P2PDispute = {
  disputeId: string
  orderId: string
  openedByUserId: string
  reason: string
  status: string
  resolvedByAdminId?: string
  resolution?: string
  resolvedAt?: string
  createdAt?: string
  updatedAt?: string
}

type P2PState = {
  loading: boolean
  error: string | null
  orders: P2POrder[]
  disputes: P2PDispute[]
}

function normalizeOrders(payload: unknown): P2POrder[] {
  if (!payload || typeof payload !== "object") return []
  const orders = (payload as { orders?: unknown }).orders
  return Array.isArray(orders) ? (orders as P2POrder[]) : []
}

function normalizeDisputes(payload: unknown): P2PDispute[] {
  if (!payload || typeof payload !== "object") return []
  const disputes = (payload as { disputes?: unknown }).disputes
  return Array.isArray(disputes) ? (disputes as P2PDispute[]) : []
}

export function formatP2PNumber(value: number, digits = 2) {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function useP2PAdminOverview(): P2PState & {
  activeOrders: number
  completedOrders: number
  cancelledOrders: number
  openDisputes: number
  totalFiatVolume: number
  uniqueUsers: number
  successRate: number
} {
  const [state, setState] = useState<P2PState>({
    loading: true,
    error: null,
    orders: [],
    disputes: [],
  })

  useEffect(() => {
    let cancelled = false

    async function loadP2P() {
      try {
        const [ordersRes, disputesRes] = await Promise.all([
          fetch("/api/admin-p2p/orders?limit=100", { cache: "no-store" }),
          fetch("/api/admin-p2p/disputes?limit=100", { cache: "no-store" }),
        ])

        if (!ordersRes.ok || !disputesRes.ok) {
          throw new Error("P2P core no respondió por Gateway Admin")
        }

        const [ordersPayload, disputesPayload] = await Promise.all([
          ordersRes.json(),
          disputesRes.json(),
        ])

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            orders: normalizeOrders(ordersPayload),
            disputes: normalizeDisputes(disputesPayload),
          })
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            error: error instanceof Error ? error.message : "No se pudo consultar P2P core",
            orders: [],
            disputes: [],
          })
        }
      }
    }

    loadP2P()

    return () => {
      cancelled = true
    }
  }, [])

  const metrics = useMemo(() => {
    const activeStatuses = new Set(["CREATED", "PAYMENT_PENDING", "PAYMENT_MARKED", "RELEASE_PENDING", "DISPUTED"])
    const completedStatuses = new Set(["RELEASED", "COMPLETED"])
    const cancelledStatuses = new Set(["CANCELLED", "EXPIRED"])
    const openDisputeStatuses = new Set(["OPEN", "UNDER_REVIEW"])
    const users = new Set<string>()

    for (const order of state.orders) {
      if (order.buyerId) users.add(order.buyerId)
      if (order.sellerId) users.add(order.sellerId)
    }

    const completedOrders = state.orders.filter((order) => completedStatuses.has(order.status)).length
    const cancelledOrders = state.orders.filter((order) => cancelledStatuses.has(order.status)).length
    const resolvedBase = completedOrders + cancelledOrders

    return {
      activeOrders: state.orders.filter((order) => activeStatuses.has(order.status)).length,
      completedOrders,
      cancelledOrders,
      openDisputes: state.disputes.filter((dispute) => openDisputeStatuses.has(dispute.status)).length,
      totalFiatVolume: state.orders.reduce((sum, order) => sum + (Number(order.fiatAmount) || 0), 0),
      uniqueUsers: users.size,
      successRate: resolvedBase > 0 ? (completedOrders / resolvedBase) * 100 : 0,
    }
  }, [state.orders, state.disputes])

  return { ...state, ...metrics }
}

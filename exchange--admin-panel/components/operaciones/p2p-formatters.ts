import type { TransactionStatus } from "./status-badge"

export function mapP2POrderStatus(status: string): TransactionStatus {
  const map: Record<string, TransactionStatus> = {
    CREATED: "pending",
    PAYMENT_PENDING: "pending",
    PAYMENT_MARKED: "processing",
    RELEASE_PENDING: "processing",
    DISPUTED: "processing",
    RELEASED: "completed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    EXPIRED: "cancelled",
    ESCROW_NOT_AVAILABLE: "failed",
  }

  return map[status] ?? "pending"
}

export function mapP2PDisputeStatus(status: string): TransactionStatus {
  const map: Record<string, TransactionStatus> = {
    OPEN: "pending",
    UNDER_REVIEW: "processing",
    RESOLVED: "completed",
    REJECTED: "rejected",
    CLOSED: "completed",
  }

  return map[status] ?? "pending"
}

export function formatP2PStatus(status: string) {
  const map: Record<string, string> = {
    CREATED: "Creada",
    PAYMENT_PENDING: "Pago pendiente",
    PAYMENT_MARKED: "Pago marcado",
    RELEASE_PENDING: "Liberación pendiente",
    DISPUTED: "En disputa",
    RELEASED: "Liberada",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    EXPIRED: "Expirada",
    ESCROW_NOT_AVAILABLE: "Sin escrow",
    OPEN: "Abierta",
    UNDER_REVIEW: "En revisión",
    RESOLVED: "Resuelta",
    REJECTED: "Rechazada",
    CLOSED: "Cerrada",
  }

  return map[status] ?? status
}

export function shortId(value?: string) {
  if (!value) return "-"
  return value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value
}

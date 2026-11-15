// types/orders.ts

export type OrderStatus = "completed" | "processing" | "cancelled" | "disputed"

export type OrderType = "buy" | "sell"

export interface Counterparty {
  id: string
  name: string
  avatar: string
  verified: boolean
  online: boolean
}

export interface Order {
  id: string
  type: OrderType
  crypto: string
  amount: number
  price: number
  total: number
  status: OrderStatus
  counterparty: Counterparty
  paymentMethod: string
  createdAt: string
  completedAt: string | null
  timeLeft?: number
  disputeReason?: string
}

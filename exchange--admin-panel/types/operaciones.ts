export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "rejected"

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "payment"
  | "exchange"
  | "trade"
  | "p2p"

export type Currency =
  | "USD"
  | "EUR"
  | "ARS"
  | "BTC"
  | "ETH"
  | "USDT"
  | string

export type PaymentMethod =
  | "bank_transfer"
  | "card"
  | "crypto"
  | "cash"
  | "wallet"
  | string

export interface BaseTransaction {
  id: string
  userId: string
  userName: string
  amount: number
  currency: Currency
  status: TransactionStatus
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface Deposit extends BaseTransaction {
  type: "deposit"
  method: PaymentMethod
  reference?: string
  bankName?: string
  accountNumber?: string
}

export interface Withdrawal extends BaseTransaction {
  type: "withdrawal"
  method: PaymentMethod
  destination: string
  fee: number
  networkFee?: number
}

export interface Transfer extends BaseTransaction {
  type: "transfer"
  recipientId: string
  recipientName: string
  concept?: string
}

export interface Payment extends BaseTransaction {
  type: "payment"
  merchantId: string
  merchantName: string
  invoiceId?: string
  productDescription?: string
}

export interface Exchange {
  id: string
  userId: string
  userName: string
  fromAmount: number
  fromCurrency: Currency
  toAmount: number
  toCurrency: Currency
  exchangeRate: number
  fee: number
  status: TransactionStatus
  createdAt: string
  updatedAt: string
}

export interface Trade {
  id: string
  userId: string
  userName: string
  pair: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop"
  amount: number
  price: number
  filled: number
  status: TransactionStatus
  createdAt: string
  updatedAt: string
}

export interface P2PTransaction extends BaseTransaction {
  type: "p2p"
  counterpartyId: string
  counterpartyName: string
  paymentMethod: PaymentMethod
  disputeId?: string
  rating?: number
}

export interface StatsData {
  totalAmount: number
  totalCount: number
  pendingCount: number
  completedCount: number
  failedCount: number
  growthRate: number
}

export interface FundsStats extends StatsData {
  deposits: number
  withdrawals: number
  fees: number
}

export interface TransferStats extends StatsData {
  uniqueUsers: number
  averageAmount: number
}

export interface TradingStats extends StatsData {
  volume24h: number
  totalTrades: number
  averagePrice: number
}

export interface P2PStats extends StatsData {
  activeOffers: number
  completionRate: number
  averageRating: number
}

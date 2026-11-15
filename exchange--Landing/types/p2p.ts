// types/p2p.ts
// Modelos canónicos del módulo P2P de deco-exchange.
// Se reexportan tipos de orders.ts para mantener una sola fuente.

export type {
  Order,
  OrderStatus,
  OrderType,
  Counterparty,
} from "./orders";

// ============================================================================
// MARKETPLACE / OFERTAS
// ============================================================================

export interface SellerOffer {
  id: string;
  name: string;
  avatar?: string;
  verified: boolean;
  online: boolean;
  rating: number; // 0-5
  orders: number; // total de órdenes completadas
  completion: number; // % de completitud (0-100)
  price: number; // precio por unidad de cripto
  available: number; // cantidad disponible
  min: number; // monto mínimo de operación
  max: number; // monto máximo de operación
  methods: string[]; // métodos de pago aceptados (ids o labels)
  time: number; // tiempo límite de pago en minutos
  currency: string; // moneda de cotización (ej. "USD")
  crypto: string; // cripto en venta (ej. "USDT")
}

export interface OfferFilters {
  side: "buy" | "sell";
  crypto: string;
  fiat: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  verifiedOnly?: boolean;
  onlineOnly?: boolean;
  sortBy?: "price" | "completion" | "orders" | "rating";
  sortDir?: "asc" | "desc";
}

// ============================================================================
// ANUNCIOS PROPIOS (MyAds)
// ============================================================================

export type AdStatus = "active" | "paused" | "expired" | "deleted";

export interface UserAd {
  id: string;
  type: "buy" | "sell";
  crypto: string;
  fiat: string;
  price: number;
  available: number;
  min: number;
  max: number;
  methods: string[];
  status: AdStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdFilters {
  type?: "buy" | "sell";
  status?: AdStatus;
  crypto?: string;
}

export interface NewAdInput {
  type: "buy" | "sell";
  crypto: string;
  fiat: string;
  price: number;
  available: number;
  min: number;
  max: number;
  methods: string[];
  paymentTimeMinutes?: number;
  terms?: string;
}

// ============================================================================
// MÉTODOS DE PAGO
// ============================================================================

export interface PaymentMethod {
  id: string;        // mapeado desde _id del backend
  name: string;      // label del usuario (o methodType si no hay label)
  logo?: string;
  type: string;      // BANK_TRANSFER | EWALLET | CASH | CRYPTO_WALLET | BANK | ...
  country?: string;
  currency?: string;
  details?: Record<string, unknown>;
  countries?: string[];
}

// ============================================================================
// EXCHANGE (FIAT/CRYPTO conversions)
// ============================================================================

export interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h?: number;
  logo?: string;
}

export interface FiatCurrency {
  id: string;
  name: string;
  symbol: string;
  logo?: string;
}

export type ExchangeType = "fiat-to-crypto" | "crypto-to-crypto" | "fiat-to-fiat";

export interface ExchangeQuote {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  fee: number;
  total: number;
}

export interface ExchangeDetails extends ExchangeQuote {
  type: ExchangeType;
  paymentMethodId?: string;
}

// ============================================================================
// CHAT
// ============================================================================

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
  verified?: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  sender: string; // user id
  timestamp: string;
  read?: boolean;
  attachments?: string[];
}

export interface Chat {
  id: string;
  user: ChatUser;
  orderId?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

// ============================================================================
// USUARIOS DE LA RED P2P (vista users)
// ============================================================================

export type UserStatus = "active" | "suspended" | "pending";
export type UserRole = "user" | "merchant" | "admin";

export interface P2PUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  verified: boolean;
  orders: number;
  completion: number; // %
  rating: number;
  status: UserStatus;
  role: UserRole;
  joinDate: string;
  lastActive: string;
}

// ============================================================================
// ÓRDENES — Tipos del backend (raw, backend-compatible)
// ============================================================================

export type P2POrderStatus =
  | 'CREATED'
  | 'ESCROW_PENDING'
  | 'ESCROW_LOCKED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_MARKED'
  | 'RELEASE_PENDING'
  | 'RELEASED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'EXPIRED'
  | 'ESCROW_NOT_AVAILABLE';

export type P2PPaymentStatus =
  | 'NOT_PAID'
  | 'MARKED_PAID'
  | 'CONFIRMED_RECEIVED'
  | 'REJECTED';

export interface P2POrderRaw {
  orderId: string;
  adId: string;
  buyerId: string;
  sellerId: string;
  assetCode: string;
  fiatCode: string;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  feeAmount: number;
  feeRate: number;
  paymentMethodId: string;
  paymentStatus: P2PPaymentStatus;
  status: P2POrderStatus;
  expiresAt: string;
  escrowId?: string;
  buyerNote?: string;
  sellerNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface P2PChatMessageRaw {
  messageId: string;
  orderId: string;
  senderId: string;
  text: string;
  seenBySeller?: boolean;
  seenByBuyer?: boolean;
  createdAt: string;
}

export interface P2PTraderStats {
  userId: string;
  totalOrders?: number;
  completedOrders?: number;
  completionRate?: number;
  avgRating?: number;
  totalVolume?: number;
}

export interface P2PAssetCatalogItem {
  assetCode: string;
  name: string;
  symbol: string;
  iconUrl?: string;
  minAmount?: number;
  maxAmount?: number;
  fiatCodes?: string[];
}

export interface CreateOrderInput {
  adId: string;
  cryptoAmount: number;
  paymentMethodId: string;
  buyerNote?: string;
  /** Rail de pago. Por defecto EXTERNAL_FIAT_PAYMENT. INTERNAL_FIAT_WALLET no disponible aún. */
  paymentRail?: "EXTERNAL_FIAT_PAYMENT" | "INTERNAL_FIAT_WALLET";
}

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  verifiedOnly?: boolean;
}

// ============================================================================
// SETTINGS
// ============================================================================

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  newOrder: boolean;
  orderUpdate: boolean;
  newMessage: boolean;
  promotions: boolean;
}

export interface AccountSettings {
  language: string;
  timezone: string;
  currency: string;
  twoFactorEnabled: boolean;
}

/**
 * EasyCryptoBuyService
 *
 * Capa de servicio para el flujo de compra de cripto en deco-exchange Landing.
 * Todos los calls van a /api/easy-crypto/buy/* (BFF Next.js server-side).
 *
 * Mapeo de métodos de pago:
 *   Código API  → Valor DTO funding-core
 *   card        → CARD
 *   spei        → SPEI
 *   cash_deposit → DEPOSIT
 *   authorized_store → STORE
 */

export interface FundingMethod {
  code: string
  methodCode?: string
  name: string
  description: string
  fiatCode?: string
  currency: string
  country?: string
  type?: string
  minAmount: number
  maxAmount: number
  requiresSavedCard: boolean
  requiresKyc?: boolean
  settlementTime?: string
  instructions?: string
  iconUrl?: string
  isInternal?: boolean
  isManualDeposit?: boolean
  adminEditable?: boolean
  displayOrder?: number
  enabled: boolean
  disabledReason?: string
  metadata?: Record<string, unknown>
}

export interface BlcDepositMethod {
  methodId: string
  methodCode: string
  country: string
  fiatCode: string
  name: string
  type: string
  instructions: string
  accountLabel: string
  accountReferenceMasked: string
  enabled: boolean
  minAmount: number
  maxAmount: number
  iconUrl: string
  displayOrder: number
  isInternal: boolean
  isManualDeposit: boolean
  adminEditable: boolean
}

export interface BlcDepositRequest {
  requestId: string
  userId: string
  amount: number
  currency: 'BLC'
  selectedPaymentMethodId: string
  reference: string
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_MORE_INFO'
  userNote?: string
  adminNote?: string
  approvedBy?: string
  rejectedBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBuyIntentInput {
  /** Código del método de pago (card | spei | cash_deposit | authorized_store) */
  method: string
  /** Monto en moneda fiat (ej: 500) */
  amount: number
  /** Moneda fiat del usuario (ej: MXN) */
  currency: string
  /** quoteId de pricing-aggregator (opcional pero recomendado) */
  quoteId?: string
  /** Origen del pago — ID de tarjeta guardada si aplica */
  sourceId?: string
  metadata?: Record<string, unknown>
}

export interface BuyIntentResult {
  intentId: string
  reference: string
  userId: string
  walletId: string
  method: string
  amount: number
  currency: string
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'FAILED'
  createdAt: string
  expiresAt: string
  metadata?: Record<string, unknown>
}

export interface ConfirmBuyIntentInput {
  intentId: string
  /** Código del método de pago (card | spei | cash_deposit | authorized_store) */
  method: string
  amount: number
  currency: string
  quoteId?: string
  confirmationCode?: string
  sourceId?: string
  metadata?: Record<string, unknown>
}

export interface BuyConfirmationResult {
  fundingId: string
  intentId: string
  paymentId: string
  ledgerEntryId: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  creditedAmount: number
  currency: string
  processedAt: string
  message: string
}

/**
 * Mapea el código de método del API (lowercase) al valor que espera el DTO
 * de funding-core (uppercase enum).
 */
function normalizeFundingMethod(code: string): string {
  const map: Record<string, string> = {
    card: 'CARD',
    spei: 'SPEI',
    pse: 'SPEI',
    bank_transfer: 'DEPOSIT',
    ach: 'SPEI',
    wire: 'DEPOSIT',
    zelle: 'STORE',
    pix: 'SPEI',
    sepa: 'SPEI',
    faster_payments: 'SPEI',
    mercadopago: 'STORE',
    uala: 'STORE',
    yape: 'STORE',
    plin: 'STORE',
    nequi: 'STORE',
    daviplata: 'STORE',
    bancolombia: 'DEPOSIT',
    pago_movil: 'STORE',
    banesco: 'DEPOSIT',
    banco_venezuela: 'DEPOSIT',
    mercantil: 'DEPOSIT',
    provincial: 'DEPOSIT',
    bcp: 'DEPOSIT',
    interbank: 'DEPOSIT',
    nubank: 'DEPOSIT',
    bancoestado: 'DEPOSIT',
    cuenta_rut: 'DEPOSIT',
    wise: 'DEPOSIT',
    revolut: 'DEPOSIT',
    chivo_wallet: 'STORE',
    mobile_wallet: 'STORE',
    cash_deposit: 'DEPOSIT',
    authorized_store: 'STORE',
    // Pasar uppercase tal cual si ya viene correcto
    CARD: 'CARD',
    SPEI: 'SPEI',
    DEPOSIT: 'DEPOSIT',
    STORE: 'STORE',
  }
  return map[code] ?? code.toUpperCase()
}

const BUY_BFF_BASE = '/api/easy-crypto/buy'

export const EasyCryptoBuyService = {
  /**
   * Obtiene los métodos de pago disponibles desde funding-core.
   * GET /api/easy-crypto/buy/methods
   */
  async getPaymentMethods(filters?: {
    fiat?: string
    country?: string
  }): Promise<FundingMethod[]> {
    const query = new URLSearchParams()
    if (filters?.fiat) query.set('fiat', filters.fiat.toUpperCase())
    if (filters?.country) query.set('country', filters.country.toUpperCase())
    const url = `${BUY_BFF_BASE}/methods${query.size > 0 ? `?${query.toString()}` : ''}`

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(
        (err as { message?: string }).message ?? `Error ${res.status} al obtener métodos de pago`,
      )
    }

    const data = await res.json()
    // La respuesta de funding-core es { success: true, data: FundingMethod[] }
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * Crea una intención de compra en funding-core.
   * POST /api/easy-crypto/buy/intent
   *
   * El BFF inyecta automáticamente userId (sesión) y walletId (wallet-ledger).
   */
  async createBuyIntent(input: CreateBuyIntentInput): Promise<BuyIntentResult> {
    const payload = {
      method: normalizeFundingMethod(input.method),
      amount: input.amount,
      currency: input.currency,
      ...(input.quoteId ? { quoteId: input.quoteId } : {}),
      ...(input.sourceId ? { sourceId: input.sourceId } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
    }

    const res = await fetch(`${BUY_BFF_BASE}/intent`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(
        (data as { message?: string }).message ?? `Error ${res.status} al crear intención de compra`,
      )
    }

    // funding-core devuelve { success: true, data: FundingIntentEntity }
    return (data?.data ?? data) as BuyIntentResult
  },

  /**
   * Confirma una intención de compra existente.
   * POST /api/easy-crypto/buy/confirm
   */
  async confirmBuyIntent(input: ConfirmBuyIntentInput): Promise<BuyConfirmationResult> {
    const payload = {
      intentId: input.intentId,
      method: normalizeFundingMethod(input.method),
      amount: input.amount,
      currency: input.currency,
      ...(input.quoteId ? { quoteId: input.quoteId } : {}),
      ...(input.confirmationCode ? { confirmationCode: input.confirmationCode } : {}),
      ...(input.sourceId ? { sourceId: input.sourceId } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
    }

    const res = await fetch(`${BUY_BFF_BASE}/confirm`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(
        (data as { message?: string }).message ?? `Error ${res.status} al confirmar compra`,
      )
    }

    // funding-core devuelve { success: true, data: FundingConfirmationEntity }
    return (data?.data ?? data) as BuyConfirmationResult
  },

  async getBlcDepositMethods(filters?: {
    country?: string
    fiat?: string
  }): Promise<BlcDepositMethod[]> {
    const query = new URLSearchParams()
    if (filters?.fiat) query.set('fiat', filters.fiat.toUpperCase())
    if (filters?.country) query.set('country', filters.country.toUpperCase())

    const res = await fetch(`/api/easy-crypto/blc/deposit-methods${query.size ? `?${query.toString()}` : ''}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { message?: string }).message ?? `Error ${res.status} al consultar métodos BLC`)
    }

    const data = await res.json()
    return Array.isArray(data?.data) ? data.data : []
  },

  async createBlcDevTopup(input: {
    amount: number
    currency: 'BLC'
    reason?: string
  }): Promise<Record<string, unknown>> {
    const res = await fetch('/api/easy-crypto/blc/dev-topup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error((data as { message?: string }).message ?? `Error ${res.status} en BLC dev topup`)
    }
    return (data as { data?: Record<string, unknown> }).data ?? {}
  },

  async createBlcDepositRequest(input: {
    amount: number
    currency: 'BLC'
    selectedPaymentMethodId: string
    userNote?: string
    reference?: string
  }): Promise<BlcDepositRequest> {
    const res = await fetch('/api/easy-crypto/blc/deposit-requests', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error((data as { message?: string }).message ?? `Error ${res.status} creando solicitud BLC`)
    }

    return ((data as { data?: BlcDepositRequest }).data ?? data) as BlcDepositRequest
  },
}

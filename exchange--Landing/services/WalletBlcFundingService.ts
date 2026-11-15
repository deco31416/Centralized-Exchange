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
  currency: "BLC"
  selectedPaymentMethodId: string
  reference: string
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "NEEDS_MORE_INFO"
  userNote?: string
  adminNote?: string
  approvedBy?: string
  rejectedBy?: string
  createdAt: string
  updatedAt: string
}

export const WalletBlcFundingService = {
  async getBlcDepositMethods(filters?: {
    country?: string
    fiat?: string
  }): Promise<BlcDepositMethod[]> {
    const query = new URLSearchParams()
    if (filters?.fiat) query.set("fiat", filters.fiat.toUpperCase())
    if (filters?.country) query.set("country", filters.country.toUpperCase())

    const res = await fetch(`/api/wallet/blc/deposit-methods${query.size ? `?${query.toString()}` : ""}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { message?: string }).message ?? `Error ${res.status} al consultar metodos BLC`)
    }

    const data = await res.json()
    return Array.isArray(data?.data) ? data.data : []
  },

  async createBlcDevTopup(input: {
    amount: number
    currency: "BLC"
    reason?: string
  }): Promise<Record<string, unknown>> {
    const res = await fetch("/api/wallet/blc/dev-topup", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error((data as { message?: string }).message ?? `Error ${res.status} en BLC dev topup`)
    }
    return (data as { data?: Record<string, unknown> }).data ?? {}
  },

  async createBlcDepositRequest(input: {
    amount: number
    currency: "BLC"
    selectedPaymentMethodId: string
    userNote?: string
    reference?: string
  }): Promise<BlcDepositRequest> {
    const res = await fetch("/api/wallet/blc/deposit-requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error((data as { message?: string }).message ?? `Error ${res.status} creando solicitud BLC`)
    }

    return ((data as { data?: BlcDepositRequest }).data ?? data) as BlcDepositRequest
  },
}

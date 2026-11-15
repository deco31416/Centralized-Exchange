// services/P2PService.ts
// Cliente HTTP para el módulo P2P.
//
// Dos helpers de fetch:
//  - p2pFetch      → BFF /api/p2p/...   → gateway p2p/** → internal-transfers (túnel QR)
//  - p2pMarketFetch → BFF /api/p2p-market/... → gateway p2p-market/** → micro-p2p-core :3021
//
// NUNCA llamar directo al gateway ni a p2p-core desde el browser.
// NUNCA inventar mocks: empty state se muestra en la UI.

import type {
  AdFilters,
  Chat,
  ChatMessage,
  CreateOrderInput,
  ExchangeDetails,
  ExchangeQuote,
  ExchangeType,
  NewAdInput,
  Order,
  OfferFilters,
  P2PChatMessageRaw,
  P2POrderRaw,
  P2POrderStatus,
  P2PUser,
  PaymentMethod,
  SellerOffer,
  UserAd,
  UserFilters,
} from "@/types/p2p";

// ============================================================================
// HELPERS GENÉRICOS
// ============================================================================

async function p2pFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`/api/p2p${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`P2P API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function p2pMarketFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`/api/p2p-market${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`P2P Market API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Mapea un anuncio del backend (P2PAd) al tipo SellerOffer que usa la UI.
// Los campos no disponibles en el esquema de anuncio (rating, orders, completion)
// se representan como cero — valores reales, no inventados.
function mapAdToSellerOffer(ad: Record<string, unknown>): SellerOffer {
  return {
    id: (ad.adId as string) ?? (ad._id as string) ?? "",
    name: typeof ad.userId === "string" ? ad.userId.slice(-8) : "—",
    verified: false,
    online: true,
    rating: 0,
    orders: 0,
    completion: 0,
    price: typeof ad.fixedPrice === "number" ? ad.fixedPrice : 0,
    available: typeof ad.availableCryptoAmount === "number" ? ad.availableCryptoAmount : 0,
    min: typeof ad.minFiatAmount === "number" ? ad.minFiatAmount : 0,
    max: typeof ad.maxFiatAmount === "number" ? ad.maxFiatAmount : 0,
    methods: Array.isArray(ad.paymentMethodIds) ? (ad.paymentMethodIds as string[]) : [],
    time: 15,
    currency: typeof ad.fiatCode === "string" ? ad.fiatCode : "",
    crypto: typeof ad.assetCode === "string" ? ad.assetCode : "",
  };
}

// Mapea un anuncio del backend al tipo UserAd para la vista "Mis Anuncios".
function mapAdToUserAd(ad: Record<string, unknown>): UserAd {
  const rawStatus = (ad.status as string | undefined) ?? "";
  const status = (["active", "paused", "expired", "deleted"].includes(rawStatus.toLowerCase())
    ? rawStatus.toLowerCase()
    : "paused") as UserAd["status"];

  return {
    id: (ad.adId as string) ?? (ad._id as string) ?? "",
    type: (ad.side as string)?.toLowerCase() === "buy" ? "buy" : "sell",
    crypto: typeof ad.assetCode === "string" ? ad.assetCode : "",
    fiat: typeof ad.fiatCode === "string" ? ad.fiatCode : "",
    price: typeof ad.fixedPrice === "number" ? ad.fixedPrice : 0,
    available: typeof ad.availableCryptoAmount === "number" ? ad.availableCryptoAmount : 0,
    min: typeof ad.minFiatAmount === "number" ? ad.minFiatAmount : 0,
    max: typeof ad.maxFiatAmount === "number" ? ad.maxFiatAmount : 0,
    methods: Array.isArray(ad.paymentMethodIds) ? (ad.paymentMethodIds as string[]) : [],
    status,
    createdAt: typeof ad.createdAt === "string" ? ad.createdAt : new Date().toISOString(),
    updatedAt: typeof ad.updatedAt === "string" ? ad.updatedAt : new Date().toISOString(),
  };
}

// Mapea una orden raw del backend al tipo P2POrderRaw (typed).
function mapToP2POrderRaw(raw: Record<string, unknown>): P2POrderRaw {
  return {
    orderId: (raw.orderId as string) ?? "",
    adId: (raw.adId as string) ?? "",
    buyerId: (raw.buyerId as string) ?? "",
    sellerId: (raw.sellerId as string) ?? "",
    assetCode: (raw.assetCode as string) ?? "",
    fiatCode: (raw.fiatCode as string) ?? "",
    cryptoAmount: typeof raw.cryptoAmount === "number" ? raw.cryptoAmount : 0,
    fiatAmount: typeof raw.fiatAmount === "number" ? raw.fiatAmount : 0,
    price: typeof raw.price === "number" ? raw.price : 0,
    feeAmount: typeof raw.feeAmount === "number" ? raw.feeAmount : 0,
    feeRate: typeof raw.feeRate === "number" ? raw.feeRate : 0,
    paymentMethodId: (raw.paymentMethodId as string) ?? "",
    paymentStatus: (raw.paymentStatus as P2POrderRaw["paymentStatus"]) ?? "NOT_PAID",
    status: (raw.status as P2POrderStatus) ?? "PAYMENT_PENDING",
    expiresAt: (raw.expiresAt as string) ?? "",
    escrowId: raw.escrowId as string | undefined,
    buyerNote: raw.buyerNote as string | undefined,
    sellerNote: raw.sellerNote as string | undefined,
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
  };
}

// Mapea orden raw a un Order legado (compatible con hooks y vistas existentes).
// Evita romper componentes que usen el tipo Order de orders.ts.
function mapRawToLegacyOrder(raw: P2POrderRaw): Order {
  const statusMap: Record<P2POrderStatus, Order["status"]> = {
    CREATED: "processing",
    ESCROW_PENDING: "processing",
    ESCROW_LOCKED: "processing",
    PAYMENT_PENDING: "processing",
    PAYMENT_MARKED: "processing",
    RELEASE_PENDING: "processing",
    RELEASED: "completed",
    CANCELLED: "cancelled",
    DISPUTED: "disputed",
    EXPIRED: "cancelled",
    ESCROW_NOT_AVAILABLE: "cancelled",
  };
  return {
    id: raw.orderId,
    type: "buy",
    crypto: raw.assetCode,
    amount: raw.cryptoAmount,
    price: raw.price,
    total: raw.fiatAmount,
    status: statusMap[raw.status] ?? "processing",
    counterparty: {
      id: raw.sellerId,
      name: raw.sellerId.slice(-8),
      avatar: "",
      verified: false,
      online: false,
    },
    paymentMethod: raw.paymentMethodId,
    createdAt: raw.createdAt,
    completedAt: raw.status === "RELEASED" ? raw.updatedAt : null,
    // Guardamos el raw completo en un campo extendido para uso en exchange-view
    ...(raw as unknown as Record<string, unknown>),
  } as Order;
}



export const P2POffersService = {
  /**
   * Lista anuncios públicos del marketplace.
   * filters.side === 'buy' → muestra anuncios SELL (vendedores ofreciendo cripto)
   * filters.side === 'sell' → muestra anuncios BUY (compradores buscando cripto)
   */
  async listOffers(filters: OfferFilters): Promise<SellerOffer[]> {
    const adSide = filters.side === "buy" ? "SELL" : "BUY";
    const params = new URLSearchParams({ side: adSide, status: "ACTIVE" });
    if (filters.crypto) params.set("assetCode", filters.crypto.toUpperCase());
    if (filters.fiat) params.set("fiatCode", filters.fiat.toUpperCase());
    params.set("limit", "50");

    const data = await p2pMarketFetch<unknown>(`/ads?${params.toString()}`);
    const raw = data as Record<string, unknown>;
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(raw?.items)
        ? (raw.items as unknown[])
        : Array.isArray(raw?.data)
          ? (raw.data as unknown[])
          : [];
    return items.map((ad) => mapAdToSellerOffer(ad as Record<string, unknown>));
  },

  async getOffer(id: string): Promise<SellerOffer | null> {
    try {
      const ad = await p2pMarketFetch<Record<string, unknown>>(`/ads/${id}`);
      return mapAdToSellerOffer(ad);
    } catch {
      return null;
    }
  },
};

// ============================================================================
// ÓRDENES
// ============================================================================

export const P2POrdersService = {
  async listOrders(): Promise<Order[]> {
    const data = await p2pMarketFetch<unknown>("/orders");
    const raw = data as Record<string, unknown>;
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(raw?.items)
        ? (raw.items as unknown[])
        : Array.isArray(raw?.data)
          ? (raw.data as unknown[])
          : [];
    return items.map((item) => mapRawToLegacyOrder(mapToP2POrderRaw(item as Record<string, unknown>)));
  },

  async listOrdersRaw(): Promise<P2POrderRaw[]> {
    const data = await p2pMarketFetch<unknown>("/orders");
    const raw = data as Record<string, unknown>;
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(raw?.items)
        ? (raw.items as unknown[])
        : Array.isArray(raw?.data)
          ? (raw.data as unknown[])
          : [];
    return items.map((item) => mapToP2POrderRaw(item as Record<string, unknown>));
  },

  async getOrderRaw(orderId: string): Promise<P2POrderRaw> {
    const data = await p2pMarketFetch<Record<string, unknown>>(`/orders/${orderId}`);
    return mapToP2POrderRaw(data);
  },

  async createOrder(input: CreateOrderInput): Promise<P2POrderRaw> {
    const data = await p2pMarketFetch<Record<string, unknown>>("/orders", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return mapToP2POrderRaw(data);
  },

  async markPaid(orderId: string): Promise<P2POrderRaw> {
    const data = await p2pMarketFetch<Record<string, unknown>>(`/orders/${orderId}/mark-paid`, {
      method: "POST",
    });
    return mapToP2POrderRaw(data);
  },

  async confirmReceived(orderId: string): Promise<P2POrderRaw> {
    const data = await p2pMarketFetch<Record<string, unknown>>(`/orders/${orderId}/confirm-received`, {
      method: "POST",
    });
    return mapToP2POrderRaw(data);
  },

  async release(orderId: string): Promise<P2POrderRaw> {
    const data = await p2pMarketFetch<Record<string, unknown>>(`/orders/${orderId}/release`, {
      method: "POST",
    });
    return mapToP2POrderRaw(data);
  },

  async cancel(orderId: string): Promise<P2POrderRaw> {
    const data = await p2pMarketFetch<Record<string, unknown>>(`/orders/${orderId}/cancel`, {
      method: "POST",
    });
    return mapToP2POrderRaw(data);
  },

  async dispute(orderId: string, reason: string): Promise<P2POrderRaw> {
    const data = await p2pMarketFetch<Record<string, unknown>>(`/orders/${orderId}/dispute`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return mapToP2POrderRaw(data);
  },
};

// ============================================================================
// MIS ANUNCIOS
// ============================================================================

export const P2PAdsService = {
  /** Mis anuncios. Requiere sesión activa (x-user-id inyectado por BFF). */
  async listMyAds(filters?: AdFilters): Promise<UserAd[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set("side", filters.type.toUpperCase());
    if (filters?.status) params.set("status", filters.status.toUpperCase());
    if (filters?.crypto) params.set("assetCode", filters.crypto.toUpperCase());
    const qs = params.toString();

    const data = await p2pMarketFetch<unknown>(`/ads/mine${qs ? `?${qs}` : ""}`);
    const raw = data as Record<string, unknown>;
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(raw?.items)
        ? (raw.items as unknown[])
        : Array.isArray(raw?.data)
          ? (raw.data as unknown[])
          : [];
    return items.map((ad) => mapAdToUserAd(ad as Record<string, unknown>));
  },

  /** Crea un anuncio. El backend lo crea en estado PAUSED si escrow no está listo. */
  async createAd(input: NewAdInput): Promise<UserAd> {
    const body = {
      side: input.type.toUpperCase(),
      assetCode: input.crypto.toUpperCase(),
      fiatCode: input.fiat.toUpperCase(),
      priceType: "FIXED",
      fixedPrice: input.price,
      minFiatAmount: input.min,
      maxFiatAmount: input.max,
      availableCryptoAmount: input.available,
      paymentMethodIds: input.methods,
      ...(input.terms ? { terms: input.terms } : {}),
    };
    const ad = await p2pMarketFetch<Record<string, unknown>>("/ads", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapAdToUserAd(ad);
  },

  async updateAd(id: string, input: Partial<NewAdInput>): Promise<UserAd> {
    const body: Record<string, unknown> = {};
    if (input.price !== undefined) { body.priceType = "FIXED"; body.fixedPrice = input.price; }
    if (input.min !== undefined) body.minFiatAmount = input.min;
    if (input.max !== undefined) body.maxFiatAmount = input.max;
    if (input.available !== undefined) body.availableCryptoAmount = input.available;
    if (input.methods !== undefined) body.paymentMethodIds = input.methods;
    if (input.terms !== undefined) body.terms = input.terms;

    const ad = await p2pMarketFetch<Record<string, unknown>>(`/ads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return mapAdToUserAd(ad);
  },

  async toggleStatus(id: string, active: boolean): Promise<UserAd> {
    const action = active ? "resume" : "pause";
    const ad = await p2pMarketFetch<Record<string, unknown>>(`/ads/${id}/${action}`, {
      method: "POST",
    });
    return mapAdToUserAd(ad);
  },

  async deleteAd(_id: string): Promise<void> {
    // p2p-core no expone DELETE en MVP. Usar pause como alternativa.
    throw new Error("Eliminar anuncio no disponible — usa 'Pausar' para desactivarlo");
  },
};

// ============================================================================
// CHAT
// ============================================================================

export const P2PChatService = {
  async listChats(): Promise<Chat[]> {
    // Chats derivan de órdenes activas — no hay endpoint independiente
    return [];
  },

  async getMessages(orderId: string): Promise<P2PChatMessageRaw[]> {
    const data = await p2pMarketFetch<unknown>(`/orders/${orderId}/messages`);
    const raw = data as Record<string, unknown>;
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(raw?.items)
        ? (raw.items as unknown[])
        : Array.isArray(raw?.data)
          ? (raw.data as unknown[])
          : [];
    return items.map((m) => {
      const msg = m as Record<string, unknown>;
      return {
        messageId: (msg.messageId as string) ?? "",
        orderId: (msg.orderId as string) ?? orderId,
        senderId: (msg.senderId as string) ?? "",
        text: (msg.text as string) ?? "",
        seenBySeller: (msg.seenBySeller as boolean) ?? false,
        seenByBuyer: (msg.seenByBuyer as boolean) ?? false,
        createdAt: (msg.createdAt as string) ?? new Date().toISOString(),
      } satisfies P2PChatMessageRaw;
    });
  },

  async getMessagesAsChat(orderId: string): Promise<ChatMessage[]> {
    const raw = await P2PChatService.getMessages(orderId);
    return raw.map((m) => ({
      id: m.messageId,
      chatId: m.orderId,
      text: m.text,
      sender: m.senderId,
      timestamp: m.createdAt,
      read: false,
    }));
  },

  async sendMessage(orderId: string, text: string): Promise<P2PChatMessageRaw> {
    const data = await p2pMarketFetch<Record<string, unknown>>(`/orders/${orderId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    return {
      messageId: (data.messageId as string) ?? "",
      orderId: (data.orderId as string) ?? orderId,
      senderId: (data.senderId as string) ?? "",
      text: (data.text as string) ?? "",
      seenBySeller: (data.seenBySeller as boolean) ?? false,
      seenByBuyer: (data.seenByBuyer as boolean) ?? false,
      createdAt: (data.createdAt as string) ?? new Date().toISOString(),
    };
  },
};

// ============================================================================
// USUARIOS DE LA RED P2P
// ============================================================================

export const P2PUsersService = {
  async listUsers(_filters?: UserFilters): Promise<P2PUser[]> {
    return [];
  },

  async getUser(_id: string): Promise<P2PUser | null> {
    // Trader stats están en GET /api/p2p-market/traders/:userId/stats
    // pero la vista users no tiene un listado de traders públicos
    return null;
  },
};

// ============================================================================
// ASSET CATALOG (activos disponibles para P2P)
// ============================================================================

export const P2PAssetsService = {
  async listAssetCatalog(fiatCode?: string): Promise<{ assetCode: string; name: string; symbol: string }[]> {
    const params = fiatCode ? `?fiatCode=${fiatCode.toUpperCase()}` : "";
    try {
      const data = await p2pMarketFetch<unknown>(`/asset-catalog${params}`);
      const raw = data as Record<string, unknown>;
      const items: unknown[] = Array.isArray(data)
        ? data
        : Array.isArray(raw?.items)
          ? (raw.items as unknown[])
          : Array.isArray(raw?.data)
            ? (raw.data as unknown[])
            : [];
      return items.map((item) => {
        const a = item as Record<string, unknown>;
        return {
          assetCode: (a.assetCode as string) ?? "",
          name: (a.name as string) ?? (a.assetCode as string) ?? "",
          symbol: (a.symbol as string) ?? (a.assetCode as string) ?? "",
        };
      });
    } catch {
      return [];
    }
  },
};

// ============================================================================
// MÉTODOS DE PAGO
// ============================================================================

export interface CreatePaymentMethodInput {
  type: string;   // PaymentMethodType enum del backend
  country: string;
  currency: string;
  label: string;
  details?: string;
}

export interface PaymentMethodCatalogEntry {
  id: string;
  name: string;
  type: string;
  countries?: string[];
  currencies?: string[];
}

export const PaymentMethodsService = {
  /** Mis métodos de pago registrados. Requiere sesión. */
  async list(): Promise<PaymentMethod[]> {
    const data = await p2pMarketFetch<unknown>("/payment-methods");
    const raw = data as Record<string, unknown>;
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(raw?.items)
        ? (raw.items as unknown[])
        : Array.isArray(raw?.data)
          ? (raw.data as unknown[])
          : [];
    return items.map((m) => {
      const item = m as Record<string, unknown>;
      return {
        id: (item.paymentMethodId as string) ?? (item._id as string) ?? "",
        name: (item.label as string) ?? (item.name as string) ?? "",
        type: (item.type as PaymentMethod["type"]) ?? "other",
        countries: Array.isArray(item.countries)
          ? (item.countries as string[])
          : typeof item.country === "string"
            ? [item.country]
            : [],
      } satisfies PaymentMethod;
    });
  },

  /** Registra un nuevo método de pago. Requiere sesión. */
  async create(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
    const pm = await p2pMarketFetch<Record<string, unknown>>("/payment-methods", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return {
      id: (pm.paymentMethodId as string) ?? (pm._id as string) ?? "",
      name: (pm.label as string) ?? (pm.name as string) ?? "",
      type: (pm.type as PaymentMethod["type"]) ?? "other",
      countries: typeof pm.country === "string" ? [pm.country] : [],
    };
  },

  /** Elimina un método de pago propio. Requiere sesión. */
  async remove(paymentMethodId: string): Promise<void> {
    await p2pMarketFetch(`/payment-methods/${paymentMethodId}`, {
      method: "DELETE",
    });
  },

  /** Catálogo global de métodos de pago (público, solo InternalAuthGuard). */
  async listCatalog(country?: string, currency?: string): Promise<PaymentMethodCatalogEntry[]> {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (currency) params.set("currency", currency);
    const qs = params.toString();
    const data = await p2pMarketFetch<unknown>(`/payment-method-catalog${qs ? `?${qs}` : ""}`);
    const raw = data as Record<string, unknown>;
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(raw?.items)
        ? (raw.items as unknown[])
        : Array.isArray(raw?.data)
          ? (raw.data as unknown[])
          : [];
    return items as PaymentMethodCatalogEntry[];
  },
};

// ============================================================================
// EXCHANGE (cotizaciones FIAT/CRYPTO)
// ============================================================================

export const ExchangeService = {
  // Cotizaciones: consultar pricing-aggregator (:3013) vía BFF /api/prices
  // NUNCA hardcodear tasas — siempre consultar al aggregator.
  async getQuote(
    _type: ExchangeType,
    _fromCurrency: string,
    _toCurrency: string,
    _amount: number
  ): Promise<ExchangeQuote> {
    throw new Error(
      "Cotización pendiente: integrar con micro-pricing-fee-aggregator"
    );
  },

  async confirm(_details: ExchangeDetails): Promise<{ id: string }> {
    throw new Error("Backend de exchange pendiente de implementación");
  },
};

export const SUPPORTED_CURRENCIES: Array<{ currency: string; type: "fiat" | "crypto"; label: string }> = [
  { currency: "MXN", type: "fiat", label: "Peso Mexicano" },
  { currency: "USD", type: "fiat", label: "Dólar Americano" },
  { currency: "COP", type: "fiat", label: "Peso Colombiano" },
  { currency: "EUR", type: "fiat", label: "Euro" },
  { currency: "BLC", type: "fiat", label: "deco-exchange Credit" },
  { currency: "BTC", type: "crypto", label: "Bitcoin" },
  { currency: "ETH", type: "crypto", label: "Ethereum" },
  { currency: "USDT", type: "crypto", label: "Tether" },
  { currency: "USDC", type: "crypto", label: "USD Coin" },
  { currency: "DECOX", type: "crypto", label: "Deco Token" },
]

// Emoji fallback only for non-supported currencies (no CurrencyIcon handler)
// Supported currencies use CurrencyIcon component (real SVG flags + crypto SVGs)
export const CURRENCY_ICONS: Record<string, string> = {
  BNB: "🔶",
  DECO: "🔷",
}

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  wallet: "Wallet",
  p2p: "P2P",
  payment: "Pago",
  remittance: "Remesa",
  saving: "Ahorro",
}

export const MOVEMENT_STATUS_CLASSES: Record<string, string> = {
  completed: "text-green-400 bg-green-400/10 border-green-400/20",
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  failed: "text-red-400 bg-red-400/10 border-red-400/20",
  cancelled: "text-muted-foreground bg-muted border-border",
}

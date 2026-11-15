export type AddMoneyLimit = {
  min: number
  label: string
}

const limitsByCurrency: Record<string, AddMoneyLimit> = {
  COP: { min: 10000, label: "10,000 COP" },
  USD: { min: 5, label: "5 USD" },
  EUR: { min: 5, label: "5 EUR" },
  MXN: { min: 100, label: "100 MXN" },
  PEN: { min: 20, label: "20 PEN" },
  BRL: { min: 20, label: "20 BRL" },
}

export function getAddMoneyLimit(currency: string): AddMoneyLimit {
  return limitsByCurrency[currency.toUpperCase()] ?? { min: 1, label: `1 ${currency.toUpperCase()}` }
}

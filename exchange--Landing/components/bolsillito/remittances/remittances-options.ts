export type RemittanceRoute = {
  id: string
  country: string
  region: string
  currency: string
  rateLabel: string
  time: string
  fee: string
}

export const remittanceRoutes: RemittanceRoute[] = [
  {
    id: "co-us",
    country: "Estados Unidos",
    region: "US",
    currency: "USD",
    rateLabel: "COP → USD",
    time: "1-2 h",
    fee: "Desde 1.2%",
  },
  {
    id: "co-mx",
    country: "México",
    region: "MX",
    currency: "MXN",
    rateLabel: "COP → MXN",
    time: "1-3 h",
    fee: "Desde 1.5%",
  },
  {
    id: "co-pe",
    country: "Perú",
    region: "PE",
    currency: "PEN",
    rateLabel: "COP → PEN",
    time: "30-90 min",
    fee: "Desde 1.4%",
  },
  {
    id: "co-ve",
    country: "Venezuela",
    region: "VE",
    currency: "VES",
    rateLabel: "COP → VES",
    time: "30-90 min",
    fee: "Variable",
  },
  {
    id: "co-pa",
    country: "Panamá",
    region: "PA",
    currency: "USD",
    rateLabel: "COP → USD",
    time: "1-2 h",
    fee: "Desde 1.6%",
  },
]

const quickAmountsByCurrency: Record<string, number[]> = {
  COP: [50000, 100000, 250000, 500000],
  USD: [25, 50, 100, 250],
  MXN: [500, 1000, 2500, 5000],
}

const mockRates: Record<string, number> = {
  USD: 0.00025,
  MXN: 0.0045,
  PEN: 0.00092,
  VES: 0.023,
}

export function getRemittanceQuickAmounts(currency: string) {
  return quickAmountsByCurrency[currency.toUpperCase()] ?? [25, 50, 100, 250]
}

export function estimateRemittanceReceive(amount: number, destinationCurrency: string) {
  const rate = mockRates[destinationCurrency.toUpperCase()] ?? 1
  return amount * rate
}

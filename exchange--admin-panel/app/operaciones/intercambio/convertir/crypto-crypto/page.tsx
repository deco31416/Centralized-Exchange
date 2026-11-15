import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function ConvertirCryptoCryptoPage() {
  return <ExchangePairPricingPage operation="convertir" fromKind="crypto" toKind="crypto" />
}

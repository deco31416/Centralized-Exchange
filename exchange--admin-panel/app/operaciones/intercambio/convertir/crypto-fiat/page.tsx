import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function ConvertirCryptoFiatPage() {
  return <ExchangePairPricingPage operation="convertir" fromKind="crypto" toKind="fiat" />
}

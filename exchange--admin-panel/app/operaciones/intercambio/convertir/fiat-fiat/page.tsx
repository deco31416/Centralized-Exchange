import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function ConvertirFiatFiatPage() {
  return <ExchangePairPricingPage operation="convertir" fromKind="fiat" toKind="fiat" />
}

import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function ComprasFiatFiatPage() {
  return <ExchangePairPricingPage operation="compras" fromKind="fiat" toKind="fiat" />
}

import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function VentasFiatFiatPage() {
  return <ExchangePairPricingPage operation="ventas" fromKind="fiat" toKind="fiat" />
}

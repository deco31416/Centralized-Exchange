import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function VentasCryptoFiatPage() {
  return <ExchangePairPricingPage operation="ventas" fromKind="crypto" toKind="fiat" />
}

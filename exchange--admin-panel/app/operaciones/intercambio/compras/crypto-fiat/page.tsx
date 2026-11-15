import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function ComprasCryptoFiatPage() {
  return <ExchangePairPricingPage operation="compras" fromKind="crypto" toKind="fiat" />
}

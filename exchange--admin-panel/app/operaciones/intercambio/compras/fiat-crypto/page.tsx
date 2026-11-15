import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function ComprasFiatCryptoPage() {
  return <ExchangePairPricingPage operation="compras" fromKind="fiat" toKind="crypto" />
}

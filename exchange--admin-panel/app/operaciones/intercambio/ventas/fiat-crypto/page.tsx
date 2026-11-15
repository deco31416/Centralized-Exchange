import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function VentasFiatCryptoPage() {
  return <ExchangePairPricingPage operation="ventas" fromKind="fiat" toKind="crypto" />
}

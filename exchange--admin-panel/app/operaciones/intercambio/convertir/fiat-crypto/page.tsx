import { ExchangePairPricingPage } from "@/components/operaciones/exchange-pair-pricing-page"

export default function ConvertirFiatCryptoPage() {
  return <ExchangePairPricingPage operation="convertir" fromKind="fiat" toKind="crypto" />
}

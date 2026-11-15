import { AuthProvider } from "@/components/p2p/auth-provider"
import SellCryptoPage from "@/components/trading-actions/SellCryptoPage"

export const metadata = {
  title: "Vende cripto | deco-exchange",
  description: "Vende tus criptomonedas y recibe dinero en tu moneda local.",
}

export default function SellPage() {
  return (
    <AuthProvider>
      <SellCryptoPage />
    </AuthProvider>
  )
}

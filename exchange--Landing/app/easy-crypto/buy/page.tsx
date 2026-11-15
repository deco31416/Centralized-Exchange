import { AuthProvider } from "@/components/p2p/auth-provider"
import BuyCryptoPage from "@/components/trading-actions/BuyCryptoPage"

export const metadata = {
  title: "Compra cripto | deco-exchange",
  description: "Compra criptomonedas con tu moneda local. Empieza con solo $1.",
}

export default function BuyPage() {
  return (
    <AuthProvider>
      <BuyCryptoPage />
    </AuthProvider>
  )
}

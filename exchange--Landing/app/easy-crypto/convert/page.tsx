import { AuthProvider } from "@/components/p2p/auth-provider"
import ConvertCryptoPage from "@/components/trading-actions/ConvertCryptoPage"

export const metadata = {
  title: "Convertidor | deco-exchange",
  description: "Convierte entre cualquier par de activos. Rápido, seguro y sin sorpresas.",
}

export default function ConvertPage() {
  return (
    <AuthProvider>
      <ConvertCryptoPage />
    </AuthProvider>
  )
}

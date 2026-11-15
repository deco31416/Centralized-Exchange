import { AuthProvider } from "@/components/p2p/auth-provider"
import SendUserPage from "@/components/trading-actions/SendUserPage"

export const metadata = {
  title: "Envía cripto | deco-exchange",
  description: "Envía saldo a otro usuario de deco-exchange con cero comisiones.",
}

export default function WalletSendUserPage() {
  return (
    <AuthProvider>
      <SendUserPage />
    </AuthProvider>
  )
}

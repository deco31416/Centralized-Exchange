import { AuthProvider } from "@/components/p2p/auth-provider"
import SendMoneyPage from "@/components/bolsillito/send-money/send-money-page"

export const metadata = {
  title: "Envia saldo | Bolsillito | deco-exchange",
  description: "Transfiere saldo a otros usuarios de deco-exchange.",
}

export default function BolsillitoSendMoneyRoute() {
  return (
    <AuthProvider>
      <SendMoneyPage />
    </AuthProvider>
  )
}

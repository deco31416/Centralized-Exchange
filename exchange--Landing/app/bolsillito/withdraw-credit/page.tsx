import { AuthProvider } from "@/components/p2p/auth-provider"
import WithdrawCreditPage from "@/components/bolsillito/withdraw-credit/withdraw-credit-page"

export const metadata = {
  title: "Retira saldo | Bolsillito | deco-exchange",
  description: "Retira saldo de tu Bolsillito a medios disponibles.",
}

export default function BolsillitoWithdrawCreditRoute() {
  return (
    <AuthProvider>
      <WithdrawCreditPage />
    </AuthProvider>
  )
}

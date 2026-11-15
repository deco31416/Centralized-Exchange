import { AuthProvider } from "@/components/p2p/auth-provider"
import AddMoneyPage from "@/components/bolsillito/add-money/add-money-page"

export const metadata = {
  title: "Recarga saldo | Bolsillito | deco-exchange",
  description: "Agrega saldo a tu Bolsillito para operar dentro de deco-exchange.",
}

export default function BolsillitoAddMoneyRoute() {
  return (
    <AuthProvider>
      <AddMoneyPage />
    </AuthProvider>
  )
}

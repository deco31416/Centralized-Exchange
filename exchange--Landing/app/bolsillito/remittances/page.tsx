import { AuthProvider } from "@/components/p2p/auth-provider"
import RemittancesPage from "@/components/bolsillito/remittances/remittances-page"

export const metadata = {
  title: "Remesas | Bolsillito | deco-exchange",
  description: "Envia dinero entre paises desde tu Bolsillito.",
}

export default function BolsillitoRemittancesRoute() {
  return (
    <AuthProvider>
      <RemittancesPage />
    </AuthProvider>
  )
}

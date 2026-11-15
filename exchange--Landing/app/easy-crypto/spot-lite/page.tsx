import { AuthProvider } from "@/components/p2p/auth-provider"
import SpotLitePage from "@/components/trading-actions/SpotLitePage"

export const metadata = {
  title: "Spot Lite | deco-exchange",
  description: "Sigue la tendencia y opera con información clara en tiempo real.",
}

export default function SpotLiteRoute() {
  return (
    <AuthProvider>
      <SpotLitePage />
    </AuthProvider>
  )
}

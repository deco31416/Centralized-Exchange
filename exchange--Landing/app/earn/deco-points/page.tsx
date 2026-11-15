import { EarnDecoPoints } from "@/components/earn/earn-deco-points"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Puntos Deco | deco-exchange",
  description: "Acumula, revisa y canjea puntos del ecosistema Deco Exchange.",
}

export default function EarnDecoPointsPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <EarnDecoPoints />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

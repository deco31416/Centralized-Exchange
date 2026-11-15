import { EarnLearnAndEarn } from "@/components/earn/earn-learn-and-earn"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Aprende y Gana | deco-exchange",
  description: "Completa rutas educativas y reclama recompensas elegibles dentro de Deco Exchange.",
}

export default function EarnLearnAndEarnPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <EarnLearnAndEarn />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

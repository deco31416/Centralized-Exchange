import { EarnTopEarners } from "@/components/earn/earn-top-earners"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Ranking de Ganadores | deco-exchange",
  description: "Ranking mensual de usuarios destacados, premios, alias publico y reglas antiabuso de Deco Exchange.",
}

export default function EarnTopEarnersPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <EarnTopEarners />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

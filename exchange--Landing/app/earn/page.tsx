import { EarnOverview } from "@/components/earn/earn-overview"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Ganar | deco-exchange",
  description: "Programas de referidos, cashback, launchpad, ranking y participacion comercial en Deco Exchange.",
}

export default function EarnPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <EarnOverview />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

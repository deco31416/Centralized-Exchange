import { EarnMissions } from "@/components/earn/earn-missions"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Misiones | deco-exchange",
  description: "Completa retos diarios, semanales y juego online para reclamar recompensas elegibles.",
}

export default function EarnMissionsPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <EarnMissions />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

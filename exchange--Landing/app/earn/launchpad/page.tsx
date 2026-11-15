import { EarnLaunchpad } from "@/components/earn/earn-launchpad"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Launchpad | deco-exchange",
  description: "Explora proyectos nuevos con cupos, riesgo, vesting y participacion temprana dentro de Deco Exchange.",
}

export default function EarnLaunchpadPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <EarnLaunchpad />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

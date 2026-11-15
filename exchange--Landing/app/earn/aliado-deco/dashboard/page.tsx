import { AliadoDecoDashboardPage } from "@/components/red-deco/aliado-deco-dashboard-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Dashboard Aliado Deco | deco-exchange",
  description: "Consola mock para operar como Aliado Deco: ordenes, caja, ganancias y disputas.",
}

export default function AliadoDecoDashboardRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <AliadoDecoDashboardPage />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

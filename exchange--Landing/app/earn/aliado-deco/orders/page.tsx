import { AliadoDecoDashboardPage } from "@/components/red-deco/aliado-deco-dashboard-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Ordenes Aliado Deco | deco-exchange",
  description: "Ordenes pendientes y en curso para Aliado Deco.",
}

export default function AliadoDecoOrdersRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <AliadoDecoDashboardPage view="orders" />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

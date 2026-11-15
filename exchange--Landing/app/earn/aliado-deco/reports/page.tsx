import { AliadoDecoReportsPage } from "@/components/red-deco/aliado-deco-reports-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Reportes Aliado Deco | deco-exchange",
  description: "Reportes mock para operaciones, comisiones, contrapartes y exportables fiscales de Aliado Deco.",
}

export default function AliadoDecoReportsRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <AliadoDecoReportsPage />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

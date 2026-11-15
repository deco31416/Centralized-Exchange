import { AliadoDecoCompliancePage } from "@/components/red-deco/aliado-deco-compliance-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Cumplimiento Aliado Deco | deco-exchange",
  description: "Reglas mock de cumplimiento, datos sensibles, formularios seguros y permisos para Aliado Deco.",
}

export default function AliadoDecoComplianceRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <AliadoDecoCompliancePage />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

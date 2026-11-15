import { AliadoDecoPartnerPage } from "@/components/red-deco/aliado-deco-partner-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Solicitar Aliado Deco | deco-exchange",
  description: "Solicitud inicial para convertirse en Aliado Deco.",
}

export default function AliadoDecoApplyRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <AliadoDecoPartnerPage />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

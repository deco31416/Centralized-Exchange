import { AliadoDecoPartnerPage } from "@/components/red-deco/aliado-deco-partner-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Aliado Deco | Ganar | deco-exchange",
  description: "Conviertete en Aliado Deco y gana comisiones atendiendo depositos, retiros y remesas.",
}

export default function EarnAliadoDecoRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <AliadoDecoPartnerPage />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

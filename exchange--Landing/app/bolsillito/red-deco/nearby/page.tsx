import { RedDecoFlowPage } from "@/components/red-deco/red-deco-flow-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Aliados cercanos | Red Deco | deco-exchange",
  description: "Encuentra aliados Red Deco disponibles para efectivo y remesas.",
}

export default function RedDecoNearbyRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <RedDecoFlowPage type="nearby" />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

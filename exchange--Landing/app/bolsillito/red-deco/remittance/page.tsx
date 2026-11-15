import { RedDecoFlowPage } from "@/components/red-deco/red-deco-flow-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Remesa Red Deco | deco-exchange",
  description: "Envia remesas con aliados, P2P, bancos, wallets y rutas inteligentes.",
}

export default function RedDecoRemittanceRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <RedDecoFlowPage type="remittance" />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

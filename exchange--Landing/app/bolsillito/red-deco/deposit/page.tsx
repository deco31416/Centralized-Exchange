import { RedDecoFlowPage } from "@/components/red-deco/red-deco-flow-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Depositar efectivo | Red Deco | deco-exchange",
  description: "Deposita efectivo con un aliado de Red Deco y recibe saldo dentro de Deco Exchange.",
}

export default function RedDecoDepositRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <RedDecoFlowPage type="deposit" />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

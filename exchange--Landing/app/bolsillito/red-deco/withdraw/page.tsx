import { RedDecoFlowPage } from "@/components/red-deco/red-deco-flow-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Retirar efectivo | Red Deco | deco-exchange",
  description: "Retira efectivo desde tu saldo Deco usando un aliado verificado.",
}

export default function RedDecoWithdrawRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <RedDecoFlowPage type="withdraw" />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

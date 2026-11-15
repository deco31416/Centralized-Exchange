import { EarnCashback } from "@/components/earn/earn-cashback"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Cashback | deco-exchange",
  description: "Activa categorias, revisa devoluciones elegibles y controla cashback dentro de Deco Exchange.",
}

export default function EarnCashbackPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <EarnCashback />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

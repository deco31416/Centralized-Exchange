import { EarnReferrals } from "@/components/earn/earn-referrals"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Referidos | deco-exchange",
  description: "Invita usuarios, mide activacion y revisa comisiones elegibles dentro de Deco Exchange.",
}

export default function EarnReferralsPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <EarnReferrals />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

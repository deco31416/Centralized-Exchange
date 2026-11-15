import { EarnSponsorAds } from "@/components/earn/earn-sponsor-ads"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Sponsor Ads | deco-exchange",
  description: "Toma campanas aprobadas, envia evidencia y gana recompensas elegibles como embajador Deco.",
}

export default function EarnSponsorAdsPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <EarnSponsorAds />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

import { RedDecoUserPage } from "@/components/red-deco/red-deco-user-page"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

export const metadata = {
  title: "Red Deco | Bolsillito | deco-exchange",
  description: "Deposita, retira y envia remesas con aliados verificados de Deco Exchange.",
}

export default function BolsillitoRedDecoRoute() {
  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        <RedDecoUserPage />
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

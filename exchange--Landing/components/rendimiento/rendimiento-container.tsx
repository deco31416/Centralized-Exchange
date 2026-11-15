"use client"

import { useRouter } from "next/navigation"

import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import ScrollToTop from "@/components/ui/scroll-to-top"

import { rendimientoRoutes, type RendimientoView } from "./rendimiento-data"
import { ActivityView } from "./views/activity-view"
import { CalculatorView } from "./views/calculator-view"
import { OverviewView } from "./views/overview-view"
import { ReservesView } from "./views/reserves-view"
import { StakingView } from "./views/staking-view"
import { VaultView } from "./views/vault-view"

type RendimientoContainerProps = {
  initialView?: RendimientoView
}

export default function RendimientoContainer({ initialView = "overview" }: RendimientoContainerProps) {
  const router = useRouter()
  const navigateToView = (view: RendimientoView) => {
    router.push(rendimientoRoutes[view])
  }

  return (
    <ActionPageShell>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10">
        {initialView === "overview" && <OverviewView onNavigate={navigateToView} />}
        {initialView === "staking" && <StakingView />}
        {initialView === "vault" && <VaultView />}
        {initialView === "reserves" && <ReservesView />}
        {initialView === "activity" && <ActivityView onNavigate={navigateToView} />}
        {initialView === "calculator" && <CalculatorView onNavigate={navigateToView} />}
      </main>
      <ScrollToTop />
    </ActionPageShell>
  )
}

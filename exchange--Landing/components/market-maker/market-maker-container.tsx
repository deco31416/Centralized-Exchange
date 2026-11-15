"use client"

import * as React from "react"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { cn } from "@/lib/utils"
import { marketMakerNav, type MarketMakerView } from "./market-maker-data"
import { DashboardView } from "./views/dashboard-view"
import { OtcMarketView } from "./views/otc-market-view"
import { OffersView } from "./views/offers-view"
import { DecoLiquidityView } from "./views/deco-liquidity-view"
import { AgreementsView } from "./views/agreements-view"
import { ChatView } from "./views/chat-view"
import { SettingsView } from "./views/settings-view"

export default function MarketMakerContainer() {
  const [activeView, setActiveView] = React.useState<MarketMakerView>("dashboard")

  return (
    <>
      <Navbar />
      <div className="pt-[88px] sm:pt-24">
        <div className="h-14" />

        <section className="container pt-6">
          <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mercados · Market Maker</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Market Maker OTC</h1>
            <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Publica liquidez mayorista, abastece directamente a Deco Exchange y gana comisiones por volumen operado.
            </p>
          </div>
        </section>

        <nav className="sticky top-[88px] z-30 mt-6 bg-background pb-2 sm:top-24">
          <div className="container">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1 dark:bg-white/[0.035]">
              {marketMakerNav.map((item) => (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={cn(
                    "flex min-w-0 shrink-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold whitespace-nowrap text-muted-foreground transition-all",
                    activeView === item.view && "bg-background text-foreground shadow-sm dark:bg-white/[0.075] dark:shadow-none"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className="container space-y-6 pt-6 pb-10">
          {activeView === "dashboard" && <DashboardView onNavigate={setActiveView} />}
          {activeView === "otc-market" && <OtcMarketView />}
          {activeView === "offers" && <OffersView />}
          {activeView === "deco-liquidity" && <DecoLiquidityView />}
          {activeView === "agreements" && <AgreementsView />}
          {activeView === "chat" && <ChatView />}
          {activeView === "settings" && <SettingsView />}
        </main>

        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}

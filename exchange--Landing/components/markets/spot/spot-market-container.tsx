"use client"

import * as React from "react"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { spotNav, type SpotMarketView } from "./spot-market-data"
import { SummaryView } from "./views/summary-view"
import { TerminalView } from "./views/terminal-view"
import { PairsView } from "./views/pairs-view"
import { OrdersView } from "./views/orders-view"
import { HistoryView } from "./views/history-view"
import { FavoritesView } from "./views/favorites-view"
import { useSpotMarketData } from "./use-spot-market-data"

export default function SpotMarketContainer() {
  const [activeView, setActiveView] = React.useState<SpotMarketView>("summary")
  const marketData = useSpotMarketData()

  return (
    <>
      <Navbar />
      <div className="pt-[88px] sm:pt-24">
        <div className="h-14" />

        <section className="container pt-6">
          <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mercados · Spot</p>
                <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground md:text-5xl">Mercado Spot</h1>
                <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Compra y vende cripto con libro de órdenes, gráfica de mercado y ejecución inmediata desde una experiencia clara.
                </p>
              </div>

              <div className="w-full rounded-[var(--radius)] border border-border bg-background p-4 lg:max-w-[360px]">
                    <p className="text-xs font-bold text-muted-foreground">Par destacado</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                    <p className="text-2xl font-black text-foreground">{marketData.activePair.pair}</p>
                    <p className={cn("text-sm", marketData.activePair.change.startsWith("+") ? "text-emerald-500" : "text-red-500")}>
                      {marketData.activePair.price} · {marketData.activePair.change}
                    </p>
                  </div>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
                    {marketData.isLoading ? "Sync" : "24h"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="rounded-full" onClick={() => setActiveView("terminal")}>Abrir terminal</Button>
                  <Button variant="outline" className="rounded-full" onClick={() => setActiveView("pairs")}>Ver pares</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-[88px] z-30 mt-6 bg-background pb-2 sm:top-24">
          <div className="container">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1 dark:bg-white/[0.035]">
              {spotNav.map((item) => (
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
          {activeView === "summary" && (
            <SummaryView
              onNavigate={setActiveView}
              pairs={marketData.pairs}
              stats={marketData.stats}
              trades={marketData.recentTrades}
              activePair={marketData.activePair}
              dataSource={marketData.source}
            />
          )}
          {activeView === "terminal" && (
            <TerminalView
              pairs={marketData.pairs}
              activePair={marketData.activePair}
              stats={marketData.stats}
              orderBook={marketData.orderBook}
              trades={marketData.recentTrades}
            />
          )}
          {activeView === "pairs" && <PairsView pairs={marketData.pairs} />}
          {activeView === "orders" && <OrdersView />}
          {activeView === "history" && <HistoryView />}
          {activeView === "favorites" && <FavoritesView pairs={marketData.pairs} activePair={marketData.activePair} />}
        </main>

        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}

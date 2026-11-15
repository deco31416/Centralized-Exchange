"use client"

import * as React from "react"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { marketAnalysisNav, type MarketAnalysisView } from "./market-analysis-data"
import { AnalysisSummaryView } from "./views/analysis-summary-view"
import { AnalysisMoversView } from "./views/analysis-movers-view"
import { AnalysisVolumeView } from "./views/analysis-volume-view"
import { AnalysisOpportunitiesView } from "./views/analysis-opportunities-view"
import { AnalysisWatchlistView } from "./views/analysis-watchlist-view"
import { useMarketAnalysisData } from "./use-market-analysis-data"

export default function MarketAnalysisContainer() {
  const [activeView, setActiveView] = React.useState<MarketAnalysisView>("summary")
  const analysisData = useMarketAnalysisData()
  const marketTone = analysisData.stats[0]?.value ?? "Mercado"
  const leadMover = analysisData.movers[0]

  return (
    <>
      <Navbar />
      <div className="pt-[88px] sm:pt-24">
        <div className="h-14" />

        <section className="container pt-6">
          <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mercados · Análisis</p>
                <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground md:text-5xl">Análisis de Mercado</h1>
                <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Lee tendencia, volumen, movers y oportunidades antes de ejecutar en Spot, Futuros o Trading Pro.
                </p>
              </div>

              <div className="w-full rounded-[var(--radius)] border border-border bg-background p-4 lg:max-w-[380px]">
                    <p className="text-xs font-bold text-muted-foreground">Lectura destacada</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                    <p className="text-2xl font-black text-foreground">Mercado {marketTone.toLowerCase()}</p>
                    <p className={cn("text-sm", leadMover?.change?.startsWith("+") ? "text-emerald-500" : "text-red-500")}>
                      {leadMover ? `${leadMover.pair} ${leadMover.change} · 24h` : "Volumen +18% · 24h"}
                    </p>
                  </div>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
                    {analysisData.isLoading ? "Sync" : "72/100"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="rounded-full" onClick={() => setActiveView("opportunities")}>Ver señales</Button>
                  <Button variant="outline" className="rounded-full" onClick={() => setActiveView("movers")}>Movers</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-[88px] z-30 mt-6 bg-background pb-2 sm:top-24">
          <div className="container">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1 dark:bg-white/[0.035]">
              {marketAnalysisNav.map((item) => (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={cn(
                    "flex min-w-0 shrink-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition-all",
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
            <AnalysisSummaryView
              onNavigate={setActiveView}
              chartPair={analysisData.chartPair}
              stats={analysisData.stats}
              movers={analysisData.movers}
              opportunities={analysisData.opportunities}
              volumeTrends={analysisData.volumeTrends}
              dataSource={analysisData.source}
            />
          )}
          {activeView === "movers" && <AnalysisMoversView movers={analysisData.movers} />}
          {activeView === "volume" && <AnalysisVolumeView chartPair={analysisData.chartPair} volumeTrends={analysisData.volumeTrends} />}
          {activeView === "opportunities" && <AnalysisOpportunitiesView opportunities={analysisData.opportunities} />}
          {activeView === "watchlist" && <AnalysisWatchlistView rows={analysisData.watchlistRows} />}
        </main>

        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}

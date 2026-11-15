"use client"

import * as React from "react"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { priceAlertsNav, type PriceAlertsView } from "./price-alerts-data"
import { PriceAlertsSummaryView } from "./views/price-alerts-summary-view"
import { PriceAlertsCreateView } from "./views/price-alerts-create-view"
import { PriceAlertsListView } from "./views/price-alerts-list-view"
import { PriceAlertsChannelsView } from "./views/price-alerts-channels-view"
import { usePriceAlertsData } from "./use-price-alerts-data"

export default function PriceAlertsContainer() {
  const [activeView, setActiveView] = React.useState<PriceAlertsView>("summary")
  const alertsData = usePriceAlertsData()
  const featuredAlert = alertsData.activeAlerts[0]

  return (
    <>
      <Navbar />
      <div className="pt-[88px] sm:pt-24">
        <div className="h-14" />

        <section className="container pt-6">
          <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mercados · Alertas</p>
                <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground md:text-5xl">Alertas de Precio</h1>
                <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Crea condiciones de precio, volumen y funding para regresar al mercado cuando una señal se active.
                </p>
              </div>

              <div className="w-full rounded-[var(--radius)] border border-border bg-background p-4 lg:max-w-[380px]">
                    <p className="text-xs font-bold text-muted-foreground">Alerta destacada</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                    <p className="text-2xl font-black text-foreground">{featuredAlert?.pair ?? "BTC/USDT"}</p>
                    <p className="text-sm text-muted-foreground">{featuredAlert?.condition ?? "Mayor que 68,000 USDT"}</p>
                  </div>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
                    {alertsData.isLoading ? "Sync" : featuredAlert?.priority ?? "Alta"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="rounded-full" onClick={() => setActiveView("create")}>Crear alerta</Button>
                  <Button variant="outline" className="rounded-full" onClick={() => setActiveView("active")}>Ver activas</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-[88px] z-30 mt-6 bg-background pb-2 sm:top-24">
          <div className="container">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1 dark:bg-white/[0.035]">
              {priceAlertsNav.map((item) => (
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
            <PriceAlertsSummaryView
              onNavigate={setActiveView}
              stats={alertsData.stats}
              activeAlerts={alertsData.activeAlerts}
              triggeredAlerts={alertsData.triggeredAlerts}
              alertBuilder={alertsData.alertBuilder}
              dataSource={alertsData.source}
            />
          )}
          {activeView === "create" && (
            <PriceAlertsCreateView
              alertBuilder={alertsData.alertBuilder}
              alertTemplates={alertsData.alertTemplates}
            />
          )}
          {activeView === "active" && <PriceAlertsListView activeAlerts={alertsData.activeAlerts} />}
          {activeView === "channels" && <PriceAlertsChannelsView />}
          {activeView === "triggered" && <PriceAlertsListView triggered triggeredAlerts={alertsData.triggeredAlerts} />}
        </main>

        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}

"use client"

import * as React from "react"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { orderHistoryNav, type OrderHistoryView } from "./order-history-data"
import { OrderHistoryOverviewView } from "./views/order-history-overview-view"
import { OrderHistoryMarketView } from "./views/order-history-market-view"
import { OrderHistoryDetailView } from "./views/order-history-detail-view"
import { OrderHistoryExportView } from "./views/order-history-export-view"

export default function OrderHistoryContainer() {
  const [activeView, setActiveView] = React.useState<OrderHistoryView>("overview")

  return (
    <>
      <Navbar />
      <div className="pt-[88px] sm:pt-24">
        <div className="h-14" />

        <section className="container pt-6">
          <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mercados · Historial</p>
                <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground md:text-5xl">Historial de Órdenes</h1>
                <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Consulta órdenes, fills, comisiones, liquidaciones y acuerdos de mercado desde una vista unificada.
                </p>
              </div>

              <div className="w-full rounded-[var(--radius)] border border-border bg-background p-4 lg:max-w-[380px]">
                <p className="text-xs font-bold text-muted-foreground">Última ejecución</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-foreground">ORD-92044</p>
                    <p className="text-sm text-emerald-500">BTC/USDT · Ejecutada</p>
                  </div>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">Spot</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="rounded-full" onClick={() => setActiveView("detail")}>Ver detalle</Button>
                  <Button variant="outline" className="rounded-full" onClick={() => setActiveView("export")}>Exportar</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-[88px] z-30 mt-6 bg-background pb-2 sm:top-24">
          <div className="container">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1 dark:bg-white/[0.035]">
              {orderHistoryNav.map((item) => (
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
          {activeView === "overview" && <OrderHistoryOverviewView onNavigate={setActiveView} />}
          {activeView === "spot" && <OrderHistoryMarketView market="Spot" title="Historial Spot" description="Órdenes spot, fills, fees y actividad sobre pares públicos o tokens propios." />}
          {activeView === "futures" && <OrderHistoryMarketView market="Futuros" title="Historial Futuros" description="Contratos, posiciones, fees, fills y actividad de derivados." />}
          {activeView === "p2p" && <OrderHistoryMarketView market="P2P" title="Historial P2P / OTC" description="Operaciones P2P, liquidaciones locales y acuerdos comerciales relacionados." />}
          {activeView === "detail" && <OrderHistoryDetailView />}
          {activeView === "export" && <OrderHistoryExportView />}
        </main>

        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}

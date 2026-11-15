"use client"

import * as React from "react"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tradingProNav, type TradingProView } from "./trading-pro-data"
import { TradingProSummaryView } from "./views/trading-pro-summary-view"
import { TradingProOrderView } from "./views/trading-pro-order-view"
import { TradingProActivityView } from "./views/trading-pro-activity-view"
import { useTradingProMarketData } from "./use-trading-pro-market-data"

export default function TradingProContainer() {
  const [activeView, setActiveView] = React.useState<TradingProView>("summary")
  const marketData = useTradingProMarketData()

  return (
    <>
      <Navbar />
      <div className="pt-[88px] sm:pt-24">
        <div className="h-14" />

        <section className="container pt-6">
          <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mercados · Trading Pro</p>
                <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground md:text-5xl">Trading Pro</h1>
                <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Configura órdenes avanzadas para Spot y Futuros con entradas, salidas, triggers y protección de riesgo.
                </p>
              </div>

              <div className="w-full rounded-[var(--radius)] border border-border bg-background p-4 lg:max-w-[380px]">
                    <p className="text-xs font-bold text-muted-foreground">Estrategia destacada</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                    <p className="text-2xl font-black text-foreground">OCO {marketData.activePair.pair}</p>
                    <p className="text-sm text-muted-foreground">
                      {marketData.activePair.price} · {marketData.activePair.change}
                    </p>
                  </div>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
                    {marketData.isLoading ? "Sync" : "Pro"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="rounded-full" onClick={() => setActiveView("standard")}>Crear orden</Button>
                  <Button variant="outline" className="rounded-full" onClick={() => setActiveView("activity")}>Ver actividad</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-[88px] z-30 mt-6 bg-background pb-2 sm:top-24">
          <div className="container">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1 dark:bg-white/[0.035]">
              {tradingProNav.map((item) => (
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
            <TradingProSummaryView
              onNavigate={setActiveView}
              activePair={marketData.activePair}
              stats={marketData.stats}
              dataSource={marketData.source}
            />
          )}
          {activeView === "standard" && (
            <TradingProOrderView
              mode="standard"
              eyebrow="Orden directa"
              title="Limit / Market"
              description="Define una orden con precio límite o ejecución inmediata, usando el mismo flujo para compra y venta."
              activePair={marketData.activePair}
            />
          )}
          {activeView === "stop" && (
            <TradingProOrderView
              mode="stop"
              eyebrow="Orden condicional"
              title="Stop-limit"
              description="Activa una orden límite cuando el mercado toca el precio trigger definido por el usuario."
              activePair={marketData.activePair}
            />
          )}
          {activeView === "oco" && (
            <TradingProOrderView
              mode="oco"
              eyebrow="Orden compuesta"
              title="OCO"
              description="Combina take profit y stop-limit para que una condición cancele automáticamente la otra."
              activePair={marketData.activePair}
            />
          )}
          {activeView === "tpsl" && (
            <TradingProOrderView
              mode="tpsl"
              eyebrow="Protección de posición"
              title="Take Profit / Stop Loss"
              description="Define salida por ganancia y pérdida sobre una posición o una entrada planificada."
              activePair={marketData.activePair}
            />
          )}
          {activeView === "activity" && <TradingProActivityView />}
        </main>

        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}

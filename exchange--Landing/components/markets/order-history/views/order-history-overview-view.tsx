"use client"

import { Button } from "@/components/ui/button"
import type { OrderHistoryView } from "../order-history-data"
import { OrderHistoryCard } from "../order-history-card"
import { ExportPanel, HistoryFiltersPanel, OrderDetailPanel, OrderHistoryStatsGrid, OrdersTable } from "../order-history-widgets"

export function OrderHistoryOverviewView({ onNavigate }: { onNavigate: (view: OrderHistoryView) => void }) {
  return (
    <div className="space-y-5">
      <OrderHistoryStatsGrid />
      <HistoryFiltersPanel />
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <OrderHistoryCard>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Actividad global</p>
                <h2 className="mt-1 text-2xl font-black text-foreground">Órdenes, fills y liquidaciones</h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  Consulta actividad cruzada entre Spot, Futuros, P2P y Market Maker desde una sola vista.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-full" onClick={() => onNavigate("detail")}>Ver detalle</Button>
                <Button variant="outline" className="rounded-full" onClick={() => onNavigate("export")}>Exportar</Button>
              </div>
            </div>
          </OrderHistoryCard>
          <OrdersTable />
        </div>
        <div className="space-y-5">
          <OrderDetailPanel />
          <ExportPanel />
        </div>
      </div>
    </div>
  )
}

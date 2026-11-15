"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { OrderHistoryCard } from "./order-history-card"
import { exportOptions, orderHistoryRows, orderHistoryStats, selectedOrder, type OrderMarket } from "./order-history-data"

export function OrderHistoryStatsGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {orderHistoryStats.map((stat) => (
        <OrderHistoryCard key={stat.label} className="p-4">
          <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.detail}</p>
        </OrderHistoryCard>
      ))}
    </div>
  )
}

export function HistoryFiltersPanel() {
  return (
    <OrderHistoryCard>
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Mercado", "Todos"],
          ["Estado", "Todos"],
          ["Rango", "30 días"],
          ["Buscar", "ORD / par"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs font-bold text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </OrderHistoryCard>
  )
}

export function OrdersTable({ market }: { market?: OrderMarket }) {
  const rows = market ? orderHistoryRows.filter((row) => row.market === market) : orderHistoryRows

  return (
    <OrderHistoryCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">{market ? `Historial ${market}` : "Historial global"}</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{rows.length} registros</span>
      </div>
      <div className="mt-4 grid gap-2">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-2 rounded-xl border border-border bg-background p-4 text-sm xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] xl:items-center">
            <div>
              <p className="font-black text-foreground">{row.id}</p>
              <p className="text-xs text-muted-foreground">{row.time}</p>
            </div>
            <span className="text-muted-foreground">{row.market} · {row.pair}</span>
            <span className="text-muted-foreground">{row.side} · {row.type}</span>
            <span className="text-muted-foreground">{row.amount} · {row.price}</span>
            <span className="text-muted-foreground">{row.fee} · {row.settlement}</span>
            <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-bold", row.status === "Ejecutada" || row.status === "Liquidada" ? "bg-emerald-500 text-white" : "border border-border text-foreground")}>{row.status}</span>
          </div>
        ))}
      </div>
    </OrderHistoryCard>
  )
}

export function OrderDetailPanel() {
  return (
    <OrderHistoryCard>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Detalle de orden</p>
          <h3 className="mt-1 text-xl font-black text-foreground">{selectedOrder.id}</h3>
          <p className="text-sm text-muted-foreground">{selectedOrder.market} · {selectedOrder.pair}</p>
        </div>
        <span className="w-fit rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">{selectedOrder.status}</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-sm font-black text-foreground">Timeline</p>
          <div className="mt-3 space-y-2">
            {selectedOrder.timeline.map(([label, time]) => (
              <div key={label} className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-black text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{time}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-black text-foreground">Fills</p>
          <div className="mt-3 space-y-2">
            {selectedOrder.fills.map((fill) => (
              <div key={`${fill.price}-${fill.amount}`} className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-black text-foreground">{fill.amount} · {fill.price}</p>
                <p className="text-xs text-muted-foreground">Fee {fill.fee}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OrderHistoryCard>
  )
}

export function ExportPanel() {
  const primaryExports = exportOptions.slice(0, 2)
  const secondaryExports = exportOptions.slice(2)

  return (
    <OrderHistoryCard>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Exportación</p>
          <h3 className="mt-1 text-xl font-black text-foreground">Reportes de actividad</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Descarga tu historial para auditoria, soporte o conciliacion personal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-full">Exportar CSV</Button>
          <Button variant="outline" className="rounded-full">Exportar PDF</Button>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {[...primaryExports, ...secondaryExports].map((option) => (
          <div key={option.title} className="rounded-xl border border-border bg-background px-4 py-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-black text-foreground">{option.title}</h4>
                  <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-bold text-muted-foreground">{option.status}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{option.detail}</p>
              </div>
              <Button
                variant={option.status === "Próximo" ? "outline" : "secondary"}
                disabled={option.status === "Próximo"}
                className="w-full rounded-full sm:w-auto"
              >
                {option.title.includes("PDF") ? "Exportar PDF" : option.title.includes("CSV") ? "Exportar CSV" : "Próximamente"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </OrderHistoryCard>
  )
}

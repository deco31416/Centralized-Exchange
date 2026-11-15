"use client"

import { OrderHistoryCard } from "../order-history-card"
import { OrderDetailPanel, OrdersTable } from "../order-history-widgets"

export function OrderHistoryDetailView() {
  return (
    <div className="space-y-5">
      <OrderHistoryCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Auditoría</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Detalle completo de orden</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Estado, timeline, fills, fees y liquidación para revisar ejecución con precisión.
        </p>
      </OrderHistoryCard>
      <OrderDetailPanel />
      <OrdersTable />
    </div>
  )
}

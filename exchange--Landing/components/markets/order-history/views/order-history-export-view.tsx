"use client"

import { ExportPanel, OrderHistoryStatsGrid } from "../order-history-widgets"

export function OrderHistoryExportView() {
  return (
    <div className="space-y-5">
      <OrderHistoryStatsGrid />
      <ExportPanel />
    </div>
  )
}

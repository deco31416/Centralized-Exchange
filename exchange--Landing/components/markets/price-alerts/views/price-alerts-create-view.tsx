"use client"

import type { PriceAlertBuilder, PriceAlertTemplate } from "../price-alerts-data"
import { AlertBuilderPanel, AlertTemplatesPanel } from "../price-alerts-widgets"

export function PriceAlertsCreateView({ alertBuilder, alertTemplates }: { alertBuilder?: PriceAlertBuilder; alertTemplates?: PriceAlertTemplate[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <AlertBuilderPanel builder={alertBuilder} />
      <AlertTemplatesPanel templates={alertTemplates} />
    </div>
  )
}

"use client"

import type { ReactNode } from "react"
import { MarketCard } from "../market-card"

export function MarketAnalysisCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <MarketCard className={className}>{children}</MarketCard>
}

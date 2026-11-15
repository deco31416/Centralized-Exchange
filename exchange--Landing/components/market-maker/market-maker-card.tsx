"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function MarketMakerCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none", className)}>
      {children}
    </div>
  )
}

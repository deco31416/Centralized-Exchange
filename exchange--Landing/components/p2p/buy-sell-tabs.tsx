"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface BuySellTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function BuySellTabs({ className, activeTab = "comprar", onTabChange, ...props }: BuySellTabsProps) {
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <div className={cn("flex items-center rounded-lg border p-1", className)} {...props}>
      <button
        onClick={() => handleTabClick("comprar")}
        className={cn(
          "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          activeTab === "comprar"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        Comprar
      </button>
      <button
        onClick={() => handleTabClick("vender")}
        className={cn(
          "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          activeTab === "vender"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        Vender
      </button>
    </div>
  )
}

"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface CryptoTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function CryptoTabs({ className, activeTab = "usdt", onTabChange, ...props }: CryptoTabsProps) {
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <div className={cn("flex items-center gap-4 overflow-x-auto py-2 scrollbar-hide", className)} {...props}>
      <button
        onClick={() => handleTabClick("usdt")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full",
          activeTab === "usdt"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        USDT
      </button>
      <button
        onClick={() => handleTabClick("btc")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full",
          activeTab === "btc"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        BTC
      </button>
      <button
        onClick={() => handleTabClick("usdc")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full",
          activeTab === "usdc"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        USDC
      </button>
      <button
        onClick={() => handleTabClick("fdusd")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full flex items-center gap-1",
          activeTab === "fdusd"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        FDUSD
        <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0">Nuevo</Badge>
      </button>
      <button
        onClick={() => handleTabClick("bnb")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full",
          activeTab === "bnb"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        BNB
      </button>
      <button
        onClick={() => handleTabClick("eth")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full",
          activeTab === "eth"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        ETH
      </button>
      <button
        onClick={() => handleTabClick("dai")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full",
          activeTab === "dai"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        DAI
      </button>
      <button
        onClick={() => handleTabClick("trump")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full",
          activeTab === "trump"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        TRUMP
      </button>
      <button
        onClick={() => handleTabClick("1000cheems")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full",
          activeTab === "1000cheems"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        1000CHEEMS
      </button>
      <button
        onClick={() => handleTabClick("tst")}
        className={cn(
          "whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors rounded-full",
          activeTab === "tst"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
        )}
      >
        TST
      </button>
    </div>
  )
}

"use client"

import type * as React from "react"
import { HelpCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface P2PTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function P2PTabs({ className, activeTab = "cuenta-p2p", onTabChange, ...props }: P2PTabsProps) {
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <div className={cn("border-b border-border/80 bg-background/95 backdrop-blur-sm", className)} {...props}>
      <div className="container flex items-center gap-6 px-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleTabClick("express")}
            className={cn(
              "flex h-12 items-center border-b-2 border-transparent text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              activeTab === "express" && "border-primary text-primary",
            )}
          >
            Express
          </button>
          <button
            onClick={() => handleTabClick("cuenta-p2p")}
            className={cn(
              "flex h-12 items-center border-b-2 border-transparent text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              activeTab === "cuenta-p2p" && "border-primary text-primary",
            )}
          >
            Cuenta P2P
          </button>
          <button
            onClick={() => handleTabClick("bloques")}
            className={cn(
              "flex h-12 items-center border-b-2 border-transparent text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              activeTab === "bloques" && "border-primary text-primary",
            )}
          >
            Bloques
          </button>
          <button
            onClick={() => handleTabClick("mis-anuncios")}
            className={cn(
              "flex h-12 items-center border-b-2 border-transparent text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              activeTab === "mis-anuncios" && "border-primary text-primary",
            )}
          >
            Mis anuncios
          </button>
          <button
            onClick={() => handleTabClick("ordenes")}
            className={cn(
              "flex h-12 items-center border-b-2 border-transparent text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              activeTab === "ordenes" && "border-primary text-primary",
            )}
          >
            Órdenes
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  Centro de ayuda P2P
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Obtén ayuda sobre P2P</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

"use client"

import React from "react"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"
import { MOVEMENT_TYPE_LABELS, MOVEMENT_STATUS_CLASSES } from "@/components/dashboard/constants"
import type { Movement } from "@/components/dashboard/types"

interface MovementRowProps {
  movement: Movement
}

export default function MovementRow({ movement }: MovementRowProps) {
  const isPositive = movement.type === "payment" || movement.status === "completed"
  const statusClass = MOVEMENT_STATUS_CLASSES[movement.status] ?? MOVEMENT_STATUS_CLASSES.cancelled
  const typeLabel = MOVEMENT_TYPE_LABELS[movement.type] ?? movement.type

  return (
    <DashCard className="hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
          {isPositive
            ? <ArrowDownLeft className="h-4 w-4 text-green-400" />
            : <ArrowUpRight className="h-4 w-4 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground capitalize truncate">
            {movement.description ?? typeLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(movement.createdAt).toLocaleString("es-MX", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-foreground tabular-nums">
            {movement.amount.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
            })} {movement.currency}
          </p>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 mt-0.5 border", statusClass)}>
            {movement.status}
          </Badge>
        </div>
      </div>
    </DashCard>
  )
}

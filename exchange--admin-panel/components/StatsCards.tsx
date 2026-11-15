"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"

interface Stat {
  title: string
  value: string | number
  change?: string
  icon?: React.ElementType
  color?: string
  description?: string
}

interface StatsCardsProps {
  stats: Stat[]
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change?.startsWith("+")
        const isNegative = stat.change?.startsWith("-")

        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </h2>
                  {stat.change && (
                    <span
                      className={`text-sm font-medium ${
                        isPositive
                          ? "text-emerald-500"
                          : isNegative
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                )}
              </div>
              {Icon && (
                <div
                  className={`rounded-lg p-3 ${
                    stat.color || "bg-primary"
                  } bg-opacity-10`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      stat.color
                        ? stat.color.replace("bg-", "text-")
                        : "text-primary"
                    }`}
                  />
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

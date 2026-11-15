import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export interface StatCardData {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    isPositive?: boolean
  }
  icon?: React.ReactNode
}

interface StatsCardsProps {
  stats: StatCardData[]
  className?: string
}

export function StatsCards({ stats, className }: StatsCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4",
        "*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card",
        className
      )}
    >
      {stats.map((stat, index) => (
        <Card
          key={index}
          data-slot="card"
          className="relative overflow-hidden bg-gradient-to-br shadow-xs"
        >
          <CardContent className="flex flex-col gap-3 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              {stat.icon && (
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  {stat.icon}
                </div>
              )}
            </div>
            <div className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {stat.value}
            </div>
          </CardContent>
          {stat.change && (
            <CardFooter className="gap-1 pt-0 text-xs text-muted-foreground">
              <Badge
                className={cn(
                  "gap-1 border-transparent px-1 text-xs",
                  stat.change.isPositive ?? stat.change.value > 0
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                )}
              >
                {(stat.change.isPositive ?? stat.change.value > 0) ? (
                  <IconTrendingUp className="size-3" />
                ) : (
                  <IconTrendingDown className="size-3" />
                )}
                {stat.change.value > 0 ? "+" : ""}
                {stat.change.value}%
              </Badge>
              <span>{stat.change.label}</span>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}

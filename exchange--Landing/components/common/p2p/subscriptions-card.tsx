import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"

export function SubscriptionsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Nuevos Usuarios</CardTitle>
        <CardDescription className="flex items-center text-xs">
          <ArrowUpRight className="mr-1 h-3 w-3 text-success" />
          <span className="text-success">+180.1%</span>
          <span className="ml-1">desde el mes pasado</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">+2350</div>
        <div className="mt-4 h-[60px] flex items-end justify-between gap-1">
          {[35, 45, 20, 50, 25, 65, 30, 55, 15, 60, 40, 25].map((height, i) => (
            <div key={i} className="chart-bar w-3" style={{ height: `${height}px` }} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

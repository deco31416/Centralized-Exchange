import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

export function ActivityGoalCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Meta de Actividad</CardTitle>
        <CardDescription>Establece tu meta diaria de actividad</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-center space-x-4">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full">
            <Minus className="h-4 w-4" />
            <span className="sr-only">Disminuir</span>
          </Button>
          <div className="flex-1 text-center">
            <div className="text-5xl font-bold tracking-tighter">350</div>
            <div className="text-[0.70rem] uppercase text-muted-foreground">TRANSACCIONES/DÍA</div>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Aumentar</span>
          </Button>
        </div>
        <div className="mt-3 h-[60px] flex items-end justify-between gap-1">
          {[40, 20, 60, 15, 35, 25, 50, 30, 45, 65, 35, 15].map((height, i) => (
            <div key={i} className="chart-bar w-3" style={{ height: `${height}px` }} />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Establecer Meta</Button>
      </CardFooter>
    </Card>
  )
}

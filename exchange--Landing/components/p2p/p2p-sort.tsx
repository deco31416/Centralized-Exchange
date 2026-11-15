"use client"

import * as React from "react"
import { ChevronDown, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface P2PSortProps extends React.HTMLAttributes<HTMLDivElement> {
  onSortChange?: (sort: string) => void
}

export function P2PSort({ className, onSortChange, ...props }: P2PSortProps) {
  const [sort, setSort] = React.useState("Precio")
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const { toast } = useToast()

  const handleSortChange = (value: string) => {
    setSort(value)
    if (onSortChange) {
      onSortChange(value)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simular actualización de datos
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "Datos actualizados correctamente",
        variant: "success",
      })
    }, 800)
  }

  return (
    <div className={cn("flex items-center justify-end gap-2", className)} {...props}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Ordenar por:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {sort}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleSortChange("Precio")}>Precio</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("Disponible")}>Disponible</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("Límite")}>Límite</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("Completado")}>Completado</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("Órdenes")}>Órdenes</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={cn(isRefreshing && "animate-spin")}
      >
        <RotateCw className="h-4 w-4" />
      </Button>
    </div>
  )
}

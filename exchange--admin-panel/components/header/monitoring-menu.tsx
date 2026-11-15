"use client"

import { IconActivity, IconPlugConnected, IconServer, IconShieldCheck } from "@tabler/icons-react"
import Link from "next/link"

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
import { Badge } from "@/components/ui/badge"

const monitoringScopes = [
  {
    name: "Gateway Admin",
    description: "Health y métricas pendientes de agregación.",
    icon: IconServer,
  },
  {
    name: "Microservicios",
    description: "Estado por dominio pendiente de conexión.",
    icon: IconPlugConnected,
  },
  {
    name: "Seguridad",
    description: "Alertas y eventos críticos por conectar.",
    icon: IconShieldCheck,
  },
]

export function MonitoringMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IconActivity className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconActivity className="h-4 w-4" />
            <span>Estado del sistema</span>
          </div>
          <Badge variant="secondary">Pendiente</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup className="space-y-3 p-2">
          {monitoringScopes.map((scope) => {
            const Icon = scope.icon

            return (
              <div key={scope.name} className="rounded-xl border p-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full border bg-background">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{scope.name}</p>
                    <p className="text-xs leading-5 text-muted-foreground">{scope.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="justify-center text-sm font-medium">
          <Link href="/monitoreo/health-checks">Ver salud de servicios</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

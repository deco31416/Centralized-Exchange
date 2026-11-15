"use client"

import * as React from "react"
import { 
  IconFileAnalytics, 
  IconReport,
  IconChartBar,
  IconUsers,
  IconCoin,
  IconTrendingUp,
  IconFileDownload
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const reportCategories = [
  {
    label: "Reportes Financieros",
    items: [
      {
        icon: IconChartBar,
        label: "Balance General",
        shortcut: "⌘B",
      },
      {
        icon: IconTrendingUp,
        label: "Estado de Resultados",
        shortcut: "⌘E",
      },
      {
        icon: IconCoin,
        label: "Flujo de Caja",
        shortcut: "⌘F",
      },
    ],
  },
  {
    label: "Reportes Operativos",
    items: [
      {
        icon: IconUsers,
        label: "Actividad de Usuarios",
        shortcut: "⌘U",
      },
      {
        icon: IconReport,
        label: "Transacciones",
        shortcut: "⌘T",
      },
      {
        icon: IconFileAnalytics,
        label: "KYC y Compliance",
        shortcut: "⌘K",
      },
    ],
  },
]

export function ReportsMenu() {
  const handleReportClick = (reportLabel: string) => {
    console.log("Generar reporte:", reportLabel)
    // Aquí iría la lógica para generar el reporte
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconReport className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <IconFileDownload className="h-4 w-4" />
          Generar Reportes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {reportCategories.map((category, idx) => (
          <React.Fragment key={category.label}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
                {category.label}
              </DropdownMenuLabel>
              {category.items.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={() => handleReportClick(item.label)}
                    className="gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            {idx < reportCategories.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm font-medium cursor-pointer">
          Reportes Personalizados
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

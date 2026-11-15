"use client"

import * as React from "react"
import {
  IconSettings,
  IconPalette,
  IconShield,
  IconKey,
  IconDatabase,
  IconPlugConnected,
  IconBell,
  IconLanguage,
  IconServer,
} from "@tabler/icons-react"
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
import { Switch } from "@/components/ui/switch"

const settingsOptions = [
  {
    category: "General",
    items: [
      { icon: IconPalette, label: "Apariencia y Tema" },
      { icon: IconLanguage, label: "Idioma y Región" },
      { icon: IconBell, label: "Notificaciones", shortcut: "Ctrl+N" },
    ],
  },
  {
    category: "Seguridad",
    items: [
      { icon: IconShield, label: "Seguridad y Privacidad" },
      { icon: IconKey, label: "API Keys" },
      { icon: IconServer, label: "Sesiones Activas" },
    ],
  },
  {
    category: "Sistema",
    items: [
      { icon: IconDatabase, label: "Base de Datos" },
      { icon: IconPlugConnected, label: "Integraciones" },
      { icon: IconSettings, label: "Configuración Avanzada" },
    ],
  },
]

export function SettingsMenu() {
  const [mode2FA, setMode2FA] = React.useState(true)

  const handleSettingClick = (label: string) => {
    console.log("Abrir configuración:", label)
    // Aquí iría la navegación o modal de configuración
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconSettings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <IconSettings className="h-4 w-4" />
          Configuración
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {settingsOptions.map((section, idx) => (
          <React.Fragment key={section.category}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
                {section.category}
              </DropdownMenuLabel>
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={() => handleSettingClick(item.label)}
                    className="gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <span className="text-xs text-muted-foreground">
                        {item.shortcut}
                      </span>
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            {idx < settingsOptions.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <IconShield className="h-4 w-4" />
            <span>2FA Activado</span>
          </div>
          <Switch 
            checked={mode2FA} 
            onCheckedChange={setMode2FA}
            onClick={(e) => e.stopPropagation()}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

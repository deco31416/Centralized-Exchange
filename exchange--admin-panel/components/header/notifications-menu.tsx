"use client"

import * as React from "react"
import { IconBell, IconPlugConnected } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationsMenu() {
  const unreadCount = 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IconBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          <Badge variant="outline" className="rounded-full text-[11px]">
            Pendiente
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[220px]">
          <DropdownMenuGroup className="p-3">
            <div className="flex flex-col items-center justify-center rounded-[1.25rem] border bg-muted/20 px-5 py-8 text-center">
              <div className="mb-3 flex size-11 items-center justify-center rounded-full border bg-background">
                <IconPlugConnected className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">Centro de notificaciones pendiente</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Se conectará por Gateway Admin cuando exista el servicio de eventos y alertas.
              </p>
            </div>
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="justify-center text-sm font-medium">
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

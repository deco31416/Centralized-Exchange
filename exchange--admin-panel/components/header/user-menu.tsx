"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  IconUserCircle,
  IconSettings,
  IconShield,
  IconKey,
  IconBell,
  IconMoon,
  IconSun,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
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
import { Badge } from "@/components/ui/badge"

interface UserMenuProps {
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // Evitar hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  const userData = user || {
    name: "Administrador",
    email: "admin@deco31416.com",
    avatar: "/avatar.png",
    role: "Super Admin"
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="gap-2 px-1 sm:px-2 h-auto hover:bg-accent"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
              {getInitials(userData.name)}
            </AvatarFallback>
          </Avatar>
          {mounted && (
            <div className="hidden lg:flex flex-col items-start text-left">
              <span className="text-sm font-medium leading-none">
                {userData.name}
              </span>
              <span className="text-xs text-muted-foreground leading-none mt-1">
                {userData.role}
              </span>
            </div>
          )}
          <IconChevronDown className="ml-1 h-4 w-4 text-muted-foreground hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-2 py-3">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-base">
                {getInitials(userData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{userData.name}</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {userData.role}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {userData.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <IconUserCircle className="h-4 w-4" />
            <span>Mi Perfil</span>
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <IconSettings className="h-4 w-4" />
            <span>Configuración</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <IconBell className="h-4 w-4" />
            <span>Notificaciones</span>
            <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <IconShield className="h-4 w-4" />
            <span>Seguridad</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <IconKey className="h-4 w-4" />
            <span>API Keys</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="gap-2 cursor-pointer"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <IconSun className="h-4 w-4" />
          ) : (
            <IconMoon className="h-4 w-4" />
          )}
          <span>Modo {theme === "dark" ? "Claro" : "Oscuro"}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
          <IconLogout className="h-4 w-4" />
          <span>Cerrar Sesión</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

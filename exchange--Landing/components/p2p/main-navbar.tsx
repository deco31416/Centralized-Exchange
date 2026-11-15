"use client"

import Link from "next/link"
import { useNavigation } from "@/components/p2p/use-navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BarChart3, MessageSquare, Users, Settings, CreditCard, History, Repeat } from "lucide-react"

const items = [
  {
    name: "Dashboard",
    href: "#",
    icon: LayoutDashboard,
    view: "dashboard",
  },
  {
    name: "Mercado",
    href: "#",
    icon: BarChart3,
    view: "market",
  },
  {
    name: "Intercambio",
    href: "#",
    icon: Repeat,
    view: "exchange",
  },
  {
    name: "Mis Anuncios",
    href: "#",
    icon: CreditCard,
    view: "my-ads",
  },
  {
    name: "Órdenes",
    href: "#",
    icon: History,
    view: "orders",
  },
  {
    name: "Chat",
    href: "#",
    icon: MessageSquare,
    view: "chat",
  },
  {
    name: "Traders P2P",
    href: "#",
    icon: Users,
    view: "users",
  },
  {
    name: "Configuración",
    href: "#",
    icon: Settings,
    view: "settings",
  },
]

type MainNavBarProps = {
  orientation?: "horizontal" | "vertical"
}

export function MainNavBar({ orientation = "vertical" }: MainNavBarProps) {
  const { activeView, setActiveView } = useNavigation()

  return (
    <nav
      className={cn(
        orientation === "horizontal"
          ? "flex flex-row items-center gap-4 px-2 py-1"
          : "grid gap-2 p-2"
      )}
    >
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          onClick={(e) => {
            e.preventDefault()
            setActiveView(item.view)
          }}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-primary",
            activeView === item.view ? "bg-muted text-primary" : "text-muted-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}

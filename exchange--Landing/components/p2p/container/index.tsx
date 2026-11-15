// components/p2p/container/index.tsx
"use client"

import { useNavigation } from "@/components/p2p/use-navigation"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import { DashboardView } from "@/components/p2p/views/DashboardView"
import P2PMarketView from "@/components/p2p/views/p2p-market-view"
import ExchangeView from "@/components/p2p/views/exchange-view"
import MyAdsView from "@/components/p2p/views/my-ads-view"
import { OrdersView } from "@/components/p2p/views/orders-view"
import { ChatView } from "@/components/p2p/views/chat-view"
import { UsersView } from "@/components/p2p/views/users-view"
import { SettingsView } from "@/components/p2p/views/settings-view"
import ScrollToTop from "@/components/ui/scroll-to-top"
import {
  LayoutDashboard,
  BarChart3,
  Repeat,
  CreditCard,
  History,
  MessageSquare,
  Users,
  Settings,
} from "lucide-react"

const navItems = [
  { name: "Dashboard",     icon: LayoutDashboard, view: "dashboard" },
  { name: "Mercado",       icon: BarChart3,        view: "market"    },
  { name: "Intercambio",   icon: Repeat,           view: "exchange"  },
  { name: "Mis Anuncios",  icon: CreditCard,       view: "my-ads"   },
  { name: "Órdenes",       icon: History,          view: "orders"   },
  { name: "Chat",          icon: MessageSquare,    view: "chat"     },
  { name: "Traders P2P",   icon: Users,            view: "users"    },
  { name: "Configuración", icon: Settings,         view: "settings" },
]

export default function P2PContainer() {
  const { activeView, setActiveView } = useNavigation()

  return (
    <>
      <Navbar />

      {/* Wrapper: pt compensa el navbar fixed (88px mobile, 96px sm+) */}
      <div className="pt-[88px] sm:pt-24">

        {/* Espacio entre navbar y tabs */}
        <div className="h-14" />

        {/* Tabs — sticky, contenidas al mismo ancho del container */}
        <nav className="bg-background sticky top-[88px] sm:top-24 z-30 pb-2">
          <div className="container">
            <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border overflow-x-auto">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={[
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center min-w-0 shrink-0",
                    activeView === item.view
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <main>
          <div className="container pt-10 pb-10 space-y-6">
            {activeView === "dashboard" && <DashboardView />}
            {activeView === "market"    && <P2PMarketView />}
            {activeView === "exchange"  && <ExchangeView />}
            {activeView === "my-ads"   && <MyAdsView />}
            {activeView === "orders"   && <OrdersView />}
            {activeView === "chat"     && <ChatView />}
            {activeView === "users"    && <UsersView />}
            {activeView === "settings" && <SettingsView />}
          </div>
        </main>

        <Footer />
      </div>

      <ScrollToTop />
    </>
  )
}

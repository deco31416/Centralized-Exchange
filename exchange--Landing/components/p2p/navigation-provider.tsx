"use client"

import type React from "react"

import { createContext, useState } from "react"

type NavigationContextType = {
  activeView: string
  setActiveView: (view: string) => void
  activeOrderId: string | null
  setActiveOrderId: (orderId: string | null) => void
}

export const NavigationContext = createContext<NavigationContextType>({
  activeView: "dashboard",
  setActiveView: () => {},
  activeOrderId: null,
  setActiveOrderId: () => {},
})

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState("dashboard")
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)

  return (
    <NavigationContext.Provider value={{ activeView, setActiveView, activeOrderId, setActiveOrderId }}>
      {children}
    </NavigationContext.Provider>
  )
}

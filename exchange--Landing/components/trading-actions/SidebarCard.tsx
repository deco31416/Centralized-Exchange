"use client"

import React from "react"

interface SidebarCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}

export function SidebarCard({ title, icon, children }: SidebarCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  )
}

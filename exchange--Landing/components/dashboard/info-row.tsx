"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
  loading?: boolean
}

export default function InfoRow({ icon, label, value, loading }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-primary/70 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="h-4 w-32 mt-0.5" />
        ) : (
          <p className="text-sm text-foreground font-medium truncate">{value}</p>
        )}
      </div>
    </div>
  )
}

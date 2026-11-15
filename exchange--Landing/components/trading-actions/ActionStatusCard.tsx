"use client"

import { AlertCircle } from "lucide-react"

interface ActionStatusCardProps {
  title: string
  description: string
  debtCode: string
}

export function ActionStatusCard({ title, description, debtCode }: ActionStatusCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="rounded-md bg-muted/40 px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">{debtCode}</span>
      </div>
    </div>
  )
}

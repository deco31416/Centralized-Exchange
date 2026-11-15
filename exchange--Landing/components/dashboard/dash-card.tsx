"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface DashCardProps {
  className?: string
  children: React.ReactNode
}

export default function DashCard({ className, children }: DashCardProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card/60 p-5", className)}>
      {children}
    </div>
  )
}

"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import type { LegalLandingItem } from "./legal-landing-data"
import { cn } from "@/lib/utils"

type LegalGridCardProps = LegalLandingItem & {
  featured?: boolean
}

export function LegalGridCard({ title, description, href, icon: Icon, featured }: LegalGridCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[118px] items-center justify-between gap-4 rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card/90 p-5 text-left shadow-[0_20px_55px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:bg-white/[0.035] dark:shadow-none dark:hover:border-white/15 dark:hover:bg-white/[0.055]",
        featured && "min-h-[210px] flex-col items-start justify-between"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-[#ff6c02]">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-bold leading-tight text-foreground">{title}</span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{description}</span>
        </span>
      </div>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

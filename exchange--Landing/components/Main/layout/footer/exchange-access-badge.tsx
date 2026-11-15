"use client"

import { LockKeyhole, ArrowUpRight } from "lucide-react"

export function ExchangeAccessBadge() {
  return (
    <a
      href="https://exchange.deco31416.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 rounded-md border border-foreground/70 px-4 py-3 text-foreground transition-colors hover:border-primary hover:text-primary"
      aria-label="DECO Exchange Investor Access"
    >
      <span className="grid h-10 w-10 place-items-center rounded-md border border-current">
        <LockKeyhole className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="leading-none">
        <span className="block text-sm font-black tracking-wide">DECO EXCHANGE</span>
        <span className="mt-1 flex items-center gap-1 text-sm font-medium">
          Investor Access
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </span>
    </a>
  )
}

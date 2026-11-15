"use client"

import { cn } from "@/lib/utils"
import * as React from "react"
import { languages } from "./languages"

export function LanguageSwitcherSmall({
  value = "es",
  onChange,
}: {
  value?: string
  onChange?: (lang: string) => void
}) {
  const [selected, setSelected] = React.useState(value)

  const handleChange = (lang: string) => {
    setSelected(lang)
    if (onChange) onChange(lang)
  }

  return (
    <div className="w-[165px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius)] border border-border bg-popover p-2.5 text-popover-foreground shadow-[0_18px_50px_rgba(15,23,42,0.16)] dark:shadow-none">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-left text-base font-semibold">Idioma</p>
        <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
          {languages.length}
        </span>
      </div>
      <div className="grid max-h-[360px] grid-cols-1 gap-1.5 overflow-y-auto pr-1">
        {languages.map((lang) => {
          const Flag = lang.Flag

          return (
            <button
              key={lang.value}
              onClick={() => handleChange(lang.value)}
              className={cn(
                "group flex min-h-[42px] items-center rounded-[calc(var(--radius)-0.95rem)] border border-border bg-card px-2 py-1.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground",
                selected === lang.value &&
                  "border-[#ff6c02] bg-[#ff6c02]/10 text-foreground ring-1 ring-[#ff6c02]/25 dark:bg-[#ff6c02]/15"
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid h-5 w-7 shrink-0 place-items-center overflow-hidden rounded-[0.2rem] border border-border bg-background">
                  <Flag title={lang.label} className="h-full w-full object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block max-w-[82px] truncate text-[13px] font-semibold leading-tight">
                    {lang.label}
                  </span>
                  <span className="block text-[9px] font-bold uppercase leading-tight tracking-[0.16em] text-muted-foreground">
                    {lang.region}
                  </span>
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

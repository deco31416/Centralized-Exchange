"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface MegaMenuItem {
  title: string
  description?: string
  icon?: string
  href: string
}

interface MegaMenuSection {
  label: string
  badge?: string // 🆕 Badge de la sección
  items: MegaMenuItem[]
}

interface MegaMenuProps {
  label: string
  sections: MegaMenuSection[]
}

export function MegaMenu({ label, sections }: MegaMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="text-xs md:text-sm xl:text-base font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[380px] p-4 shadow-xl border border-border bg-background rounded-xl"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-muted-foreground">{section.label}</h4>
                {section.badge && (
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full shadow-sm border border-border">
                    {section.badge}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 rounded-md p-3 hover:bg-accent transition"
                  >
                    {item.icon && (
                      <Image src={item.icon} alt={item.title} width={32} height={32} className="rounded-md" />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <div className="font-medium text-sm text-foreground group-hover:text-primary">
                        {item.title}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

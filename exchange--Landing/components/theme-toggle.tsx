"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ThemeToggleProps = {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : true
  const nextTheme = isDark ? "light" : "dark"
  const label = isDark ? "Modo claro" : "Modo oscuro"
  const Icon = isDark ? Sun : Moon

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      className={cn(
        showLabel
          ? "w-full justify-start rounded-lg border border-border bg-background text-foreground"
          : "h-[40px] w-[40px] rounded-full border border-border bg-background text-foreground",
        className,
      )}
      aria-label={label}
      onClick={() => setTheme(nextTheme)}
    >
      <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </Button>
  )
}

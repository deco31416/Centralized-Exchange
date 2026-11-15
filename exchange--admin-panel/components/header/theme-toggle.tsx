"use client"

import * as React from "react"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : true
  const Icon = isDark ? IconSun : IconMoon
  const label = isDark ? "Activar modo claro" : "Activar modo oscuro"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full border bg-background/70 text-foreground transition-colors hover:bg-accent dark:bg-black/50"
    >
      <Icon className="h-5 w-5" />
    </Button>
  )
}

"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function AdminLogo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : true
  const src = isDark
    ? "/images/logos/logo-name-black.png"
    : "/images/logos/logo-name-white.png"

  return (
    <img
      src={src}
      alt="DECO EXCHANGE"
      className="h-9 w-auto max-w-full object-contain"
    />
  )
}

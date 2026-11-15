"use client"

import * as React from "react"

type BolsillitoPreferences = {
  language: string
  region: string
  currency: string
}

const storageKey = "deco-locale-preferences"
const changeEventName = "deco-locale-preferences-change"

const defaultPreferences: BolsillitoPreferences = {
  language: "es",
  region: "CO",
  currency: "COP",
}

function readPreferences(): BolsillitoPreferences {
  if (typeof window === "undefined") return defaultPreferences

  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences
  } catch {
    return defaultPreferences
  }
}

export function useBolsillitoPreferences() {
  const [preferences, setPreferences] = React.useState<BolsillitoPreferences>(defaultPreferences)

  React.useEffect(() => {
    const sync = () => setPreferences(readPreferences())

    sync()
    window.addEventListener("storage", sync)
    window.addEventListener(changeEventName, sync)
    window.addEventListener("focus", sync)
    document.addEventListener("visibilitychange", sync)

    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(changeEventName, sync)
      window.removeEventListener("focus", sync)
      document.removeEventListener("visibilitychange", sync)
    }
  }, [])

  return preferences
}

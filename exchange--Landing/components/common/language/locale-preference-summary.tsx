"use client"

import * as React from "react"
import { Globe2 } from "lucide-react"

import { localeLanguages, regions } from "@/components/common/language/locale-options"

type LocalePreferences = {
  language: string
  region: string
  currency: string
}

const storageKey = "deco-locale-preferences"
const changeEventName = "deco-locale-preferences-change"

const defaultPreferences: LocalePreferences = {
  language: "es",
  region: "CO",
  currency: "COP",
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase()
}

function getRegionGroup(region: string) {
  const latinAmericaRegions = new Set(["AR", "AW", "BR", "CL", "CO", "DO", "MX", "PA", "PE", "SV", "VE"])
  if (latinAmericaRegions.has(region)) return "América Latina"
  if (region === "US" || region === "CA") return "Norteamérica"
  if (region === "EU") return "Europa"
  return regions.find((item) => item.value === region)?.label ?? region
}

function readPreferences() {
  if (typeof window === "undefined") return defaultPreferences

  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences
  } catch {
    return defaultPreferences
  }
}

export function emitLocalePreferencesChange() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(changeEventName))
}

export function LocalePreferenceSummary() {
  const [preferences, setPreferences] = React.useState<LocalePreferences>(defaultPreferences)

  React.useEffect(() => {
    const syncPreferences = () => setPreferences(readPreferences())

    syncPreferences()
    window.addEventListener("storage", syncPreferences)
    window.addEventListener(changeEventName, syncPreferences)

    return () => {
      window.removeEventListener("storage", syncPreferences)
      window.removeEventListener(changeEventName, syncPreferences)
    }
  }, [])

  const languageLabel =
    localeLanguages.find((item) => item.value === preferences.language)?.label ??
    normalizeCode(preferences.language)

  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
      <Globe2 className="h-4 w-4" />
      <span>
        Global · {languageLabel} - {getRegionGroup(normalizeCode(preferences.region))} |{" "}
        {normalizeCode(preferences.currency)}
      </span>
    </span>
  )
}

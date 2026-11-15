"use client"

import * as React from "react"
import { CircleCheck, Coins, Globe, MapPin, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FiatCurrencyIcon } from "@/components/common/fiat-currency-icon"
import { emitLocalePreferencesChange } from "@/components/common/language/locale-preference-summary"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { currencies, localeLanguages, regions } from "./locale-options"

type LocalePreferences = {
  language: string
  region: string
  currency: string
}

const storageKey = "deco-locale-preferences"

const defaultPreferences: LocalePreferences = {
  language: "es",
  region: "CO",
  currency: "COP",
}

function optionMatches(query: string, ...values: string[]) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true
  return values.some((value) => value.toLowerCase().includes(normalizedQuery))
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

export function LocalePreferencesModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [preferences, setPreferences] = React.useState<LocalePreferences>(defaultPreferences)

  React.useEffect(() => {
    setPreferences(readPreferences())
  }, [])

  const selectedLanguage = localeLanguages.find((item) => item.value === preferences.language) ?? localeLanguages[0]
  const selectedRegion = regions.find((item) => item.value === preferences.region) ?? regions[0]
  const selectedCurrency = currencies.find((item) => item.value === preferences.currency) ?? currencies[0]

  const filteredLanguages = localeLanguages.filter((item) =>
    optionMatches(query, item.label, item.region, item.value)
  )
  const filteredRegions = regions.filter((item) =>
    optionMatches(query, item.label, item.code, item.currency, item.note)
  )
  const filteredCurrencies = currencies.filter((item) =>
    optionMatches(query, item.value, item.label, item.symbol, item.region)
  )

  const updatePreference = <Key extends keyof LocalePreferences>(key: Key, value: LocalePreferences[Key]) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value }
      if (key === "region") {
        const regionCurrency = regions.find((item) => item.value === value)?.currency
        if (regionCurrency) next.currency = regionCurrency
      }
      return next
    })
  }

  const handleSave = () => {
    window.localStorage.setItem(storageKey, JSON.stringify(preferences))
    emitLocalePreferencesChange()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-[720px] gap-0 overflow-hidden rounded-[var(--radius)] border-border bg-card p-0 shadow-[0_30px_90px_rgba(15,23,42,0.26)] dark:bg-background dark:shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:w-full sm:rounded-[var(--radius)]">
        <div className="border-b border-border px-4 py-4 sm:px-7 sm:py-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-bold sm:text-2xl">Idioma, país y moneda</DialogTitle>
            <DialogDescription>
              Ajusta estas preferencias para adaptar idioma, región, moneda y disponibilidad regulatoria.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs defaultValue="language" onValueChange={() => setQuery("")} className="min-h-0">
          <div className="px-4 pt-4 sm:px-7 sm:pt-5">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-[1.45rem] bg-muted/70 p-1.5 dark:bg-white/10">
              <TabsTrigger
                value="language"
                className="min-h-[52px] gap-1.5 rounded-[1.05rem] px-2 py-3 text-xs text-muted-foreground data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_12px_26px_rgba(15,23,42,0.16)] dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none sm:gap-2 sm:text-sm"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Idioma</span>
              </TabsTrigger>
              <TabsTrigger
                value="region"
                className="min-h-[52px] gap-1.5 rounded-[1.05rem] px-2 py-3 text-xs text-muted-foreground data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_12px_26px_rgba(15,23,42,0.16)] dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none sm:gap-2 sm:text-sm"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">País / región</span>
              </TabsTrigger>
              <TabsTrigger
                value="currency"
                className="min-h-[52px] gap-1.5 rounded-[1.05rem] px-2 py-3 text-xs text-muted-foreground data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_12px_26px_rgba(15,23,42,0.16)] dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none sm:gap-2 sm:text-sm"
              >
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Moneda</span>
              </TabsTrigger>
            </TabsList>

            <label className="mt-4 flex h-11 items-center gap-2 rounded-[calc(var(--radius)-0.75rem)] border border-border bg-background px-3 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar..."
                className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          <div className="max-h-[46vh] overflow-y-auto px-4 py-4 sm:max-h-[48vh] sm:px-7 sm:py-5">
            <TabsContent value="language" className="m-0">
              <div className="grid gap-2 min-[520px]:grid-cols-2">
                {filteredLanguages.map((item) => {
                  const Flag = item.Flag
                  const active = preferences.language === item.value
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updatePreference("language", item.value)}
                      className={cn(
                        "flex min-h-[58px] items-center justify-between gap-3 rounded-[calc(var(--radius)-0.75rem)] border border-border bg-background px-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/50",
                        active && "border-[#ff6c02] bg-[#ff6c02]/10 ring-1 ring-[#ff6c02]/25"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid h-7 w-10 shrink-0 place-items-center overflow-hidden rounded-[0.25rem] border border-border bg-card">
                          <Flag title={item.label} className="h-full w-full object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{item.label}</span>
                          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                            {item.region}
                          </span>
                        </span>
                      </span>
                      {active && <CircleCheck className="h-5 w-5 shrink-0 text-[#ff6c02]" />}
                    </button>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="region" className="m-0">
              <div className="grid gap-2 min-[520px]:grid-cols-2">
                {filteredRegions.map((item) => {
                  const Flag = item.Flag
                  const active = preferences.region === item.value
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updatePreference("region", item.value)}
                      className={cn(
                        "flex min-h-[72px] items-center justify-between gap-3 rounded-[calc(var(--radius)-0.75rem)] border border-border bg-background px-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/50",
                        active && "border-[#ff6c02] bg-[#ff6c02]/10 ring-1 ring-[#ff6c02]/25"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid h-7 w-10 shrink-0 place-items-center overflow-hidden rounded-[0.25rem] border border-border bg-card">
                          <Flag title={item.label} className="h-full w-full object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{item.label}</span>
                          <span className="block text-xs text-muted-foreground">
                            {item.currency} · {item.note}
                          </span>
                        </span>
                      </span>
                      {active && <CircleCheck className="h-5 w-5 shrink-0 text-[#ff6c02]" />}
                    </button>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="currency" className="m-0">
              <div className="grid gap-2 min-[520px]:grid-cols-2 sm:grid-cols-3">
                {filteredCurrencies.map((item) => {
                  const active = preferences.currency === item.value
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updatePreference("currency", item.value)}
                      className={cn(
                        "flex min-h-[62px] items-center justify-between gap-3 rounded-[calc(var(--radius)-0.75rem)] border border-border bg-background px-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/50",
                        active && "border-[#ff6c02] bg-[#ff6c02]/10 ring-1 ring-[#ff6c02]/25"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <FiatCurrencyIcon code={item.value} label={item.label} className="h-8 w-8" />
                        <span className="min-w-0">
                          <span className="block text-base font-bold">{item.symbol} {item.value}</span>
                          <span className="block truncate text-xs text-muted-foreground">{item.label}</span>
                        </span>
                      </span>
                      {active && <CircleCheck className="h-5 w-5 shrink-0 text-[#ff6c02]" />}
                    </button>
                  )
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="mb-3 text-xs text-muted-foreground sm:mb-0">
            {selectedLanguage.label} · {selectedRegion.label} · {selectedCurrency.value}
          </div>
          <Button onClick={handleSave} className="w-full rounded-full px-7 sm:w-auto">
            Guardar preferencias
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

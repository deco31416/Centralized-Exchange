"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  allCookiePreferences,
  defaultCookiePreferences,
  normalizeCookiePreferences,
  persistCookieConsent,
  readCookieConsent,
  type CookieCategoryId,
  type CookiePreference,
} from "@/lib/privacy/cookie-consent"

type ConsentMode = "summary" | "customize"

type CookieConsentEvent = CustomEvent<{ mode?: ConsentMode }>

const cookieCategories: Array<{
  id: CookieCategoryId
  title: string
  description: string
  required?: boolean
  cookies: Array<{
    name: string
    duration: string
    description: string
  }>
}> = [
  {
    id: "necessary",
    title: "Necesario",
    required: true,
    description:
      "Se requieren para habilitar funciones basicas del sitio, como inicio de sesion seguro o preferencias de consentimiento. No almacenan datos de identificacion personal.",
    cookies: [
      {
        name: "Is.session",
        duration: "7 dias",
        description: "Cookie necesaria para autorizar usuarios y mantener una sesion segura.",
      },
    ],
  },
  {
    id: "functional",
    title: "Funcional",
    description:
      "Ayudan a recordar preferencias, mejorar funciones del sitio, recopilar comentarios y habilitar integraciones de soporte o terceros.",
    cookies: [
      {
        name: "intercom-id-*",
        duration: "8 meses 26 dias",
        description: "Permite reconocer conversaciones previas cuando se habilite soporte externo.",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analitica",
    description:
      "Nos ayudan a comprender como interactuan los visitantes con el sitio mediante metricas agregadas como visitas, rebote y fuentes de trafico.",
    cookies: [
      {
        name: "gtm_id",
        duration: "1 ano",
        description: "Mide interaccion con paginas y estados relevantes de experiencia.",
      },
    ],
  },
  {
    id: "advertising",
    title: "Anuncio",
    description:
      "Se usan para medir campanas, evitar impactos repetidos y mejorar comunicaciones comerciales cuando el usuario lo permite.",
    cookies: [
      {
        name: "deco_ads_consent",
        duration: "6 meses",
        description: "Guarda preferencia para experiencias publicitarias y campanas.",
      },
    ],
  },
]

export function CookieConsentModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<ConsentMode>("summary")
  const [expandedCategory, setExpandedCategory] = useState<CookieCategoryId>("necessary")
  const [preferences, setPreferences] = useState<CookiePreference>(defaultCookiePreferences)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    const storedConsent = readCookieConsent()
    if (storedConsent) {
      setPreferences(storedConsent.preferences)
    }

    if (!storedConsent) {
      setIsOpen(true)
    }

    const openCookiePreferences = (event: Event) => {
      const detail = (event as CookieConsentEvent).detail
      const currentConsent = readCookieConsent()
      setPreferences(currentConsent?.preferences ?? allCookiePreferences)
      setSavedMessage(null)
      setMode(detail?.mode ?? "customize")
      setIsOpen(true)
    }

    window.addEventListener("deco:cookies", openCookiePreferences)
    return () => window.removeEventListener("deco:cookies", openCookiePreferences)
  }, [])

  const acceptAll = () => {
    setPreferences(allCookiePreferences)
    persistCookieConsent(allCookiePreferences)
    setSavedMessage("Aceptaste todas las cookies.")
    setIsOpen(false)
  }

  const savePreferences = () => {
    const safePreferences = normalizeCookiePreferences(preferences)
    setPreferences(safePreferences)
    persistCookieConsent(safePreferences)
    setSavedMessage("Tus preferencias quedaron guardadas.")
  }

  const saveNecessaryOnly = () => {
    setPreferences(defaultCookiePreferences)
    persistCookieConsent(defaultCookiePreferences)
    setSavedMessage("Continuaras solo con cookies necesarias.")
    setIsOpen(false)
  }

  const closeWithoutSaving = () => {
    if (savedMessage) {
      setIsOpen(false)
      return
    }

    saveNecessaryOnly()
  }

  const openCustomizeFromSummary = () => {
    const currentConsent = readCookieConsent()
    setPreferences(currentConsent?.preferences ?? allCookiePreferences)
    setSavedMessage(null)
    setMode("customize")
  }

  const updatePreference = (categoryId: CookieCategoryId, checked: boolean) => {
    if (categoryId === "necessary") {
      return
    }
    setSavedMessage(null)
    setPreferences((current) => ({
      ...current,
      [categoryId]: checked,
    }))
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-background/20 px-3 py-4 backdrop-blur-[2px] sm:items-end sm:justify-start sm:px-6 sm:py-6">
      <section className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-[24px] border border-border bg-background text-foreground shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border px-5 py-3">
          <div className="min-w-0">
            <p className="text-lg font-black leading-tight sm:text-xl">
              {mode === "summary" ? "Politicas de Cookies" : "Personalizar preferencias"}
            </p>
            {mode === "customize" ? (
              <p className="mt-1 text-xs text-muted-foreground">Consentimiento por categoria</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeWithoutSaving}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border hover:bg-muted"
            aria-label="Cerrar politicas de cookies"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {mode === "summary" ? (
          <div className="overflow-y-auto px-5 py-5">
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Cuando visita nuestro sitio web y brinda su consentimiento, utilizaremos cookies propias y de terceros y
                tecnologias similares para mejorar su experiencia, analizar el trafico y garantizar la seguridad. Puede
                aceptar todo, personalizar por categoria o continuar solo con cookies necesarias. Para obtener mas
                informacion, consulte nuestra politica de privacidad y cookies.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-h-0 overflow-y-auto">
            <div className="border-b border-border px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Este sitio web utiliza cookies y tecnologias similares para mejorar su experiencia de navegacion.
                Algunas cookies son esenciales para las funciones basicas del sitio web y se almacenan en su navegador.
              </p>
              {savedMessage ? (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                  {savedMessage}
                </div>
              ) : null}
            </div>

            <div className="divide-y divide-border">
              {cookieCategories.map((category) => {
                const isExpanded = expandedCategory === category.id
                return (
                  <article key={category.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedCategory(isExpanded ? "necessary" : category.id)}
                        className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-muted"
                        aria-label={`Ver ${category.title}`}
                      >
                        <ChevronRight className={cn("h-5 w-5 transition-transform", isExpanded && "rotate-90")} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-lg font-black text-foreground">{category.title}</h3>
                          <Switch
                            checked={preferences[category.id]}
                            disabled={category.required}
                            onCheckedChange={(checked) => updatePreference(category.id, checked)}
                            aria-label={`Activar cookies ${category.title}`}
                          />
                        </div>
                        <p className="mt-3 max-w-[440px] text-sm leading-relaxed text-muted-foreground">
                          {category.description}
                        </p>

                        {isExpanded ? (
                          <div className="mt-5 grid gap-3">
                            {category.cookies.map((cookie) => (
                              <div
                                key={`${category.id}-${cookie.name}`}
                                className="rounded-2xl border border-border bg-card p-3"
                              >
                                <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Cookie</p>
                                    <p className="mt-1 font-black text-foreground">{cookie.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                                      Duracion
                                    </p>
                                    <p className="mt-1 font-black text-foreground">{cookie.duration}</p>
                                  </div>
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                  {cookie.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        <footer className="grid gap-3 border-t border-border bg-background/95 px-5 py-4 sm:grid-cols-3">
          {mode === "summary" ? (
            <Button type="button" className="h-12 rounded-full" onClick={openCustomizeFromSummary}>
              Personalizar
            </Button>
          ) : (
            <Button type="button" className="h-12 rounded-full" onClick={savePreferences}>
              Guardar seleccion
            </Button>
          )}
          <Button type="button" variant="outline" className="h-12 rounded-full" onClick={saveNecessaryOnly}>
            Solo necesarias
          </Button>
          <Button type="button" variant="outline" className="h-12 rounded-full" onClick={acceptAll}>
            Aceptar todo
          </Button>
          {mode === "customize" && savedMessage ? (
            <Button type="button" variant="outline" className="h-12 rounded-full sm:col-span-3" onClick={() => setIsOpen(false)}>
              Cerrar
            </Button>
          ) : null}
        </footer>
      </section>
    </div>
  )
}

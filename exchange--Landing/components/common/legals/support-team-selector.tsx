"use client"

import { useState } from "react"
import { Code2, MessageCircle, Scale, ShieldCheck, Sparkles, WalletCards } from "lucide-react"

import { cn } from "@/lib/utils"

const supportProfiles = [
  {
    name: "DECO",
    role: "Asistente general",
    detail: "Orienta tu solicitud y te dirige al canal adecuado.",
    icon: Sparkles,
  },
  {
    name: "María",
    role: "Soporte al usuario",
    detail: "Ayuda con acceso, perfil, dudas frecuentes y navegación.",
    icon: MessageCircle,
  },
  {
    name: "Carlos",
    role: "Cumplimiento",
    detail: "Guía sobre KYC, AML, reportes y revisión documental.",
    icon: ShieldCheck,
  },
  {
    name: "Ana",
    role: "Pagos y operaciones",
    detail: "Consulta referencias de pagos, fiat, retiros y estado operativo.",
    icon: WalletCards,
  },
  {
    name: "Leo",
    role: "Integraciones API",
    detail: "Acompaña integraciones, widgets y recursos para desarrolladores.",
    icon: Code2,
  },
  {
    name: "Sofía",
    role: "Legal y comunidad",
    detail: "Apoya consultas sobre políticas, términos y convivencia.",
    icon: Scale,
  },
]

export function SupportTeamSelector() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeProfile = supportProfiles[activeIndex]
  const ActiveIcon = activeProfile.icon

  return (
    <div className="relative overflow-hidden rounded-[var(--radius)] border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.20),rgba(226,232,240,0.40)_28%,transparent_56%),linear-gradient(180deg,#ffffff_0%,hsl(var(--card))_68%)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.13),rgba(255,255,255,0.04)_28%,transparent_52%),linear-gradient(180deg,#101010_0%,#050505_68%)] dark:shadow-none">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.16))] opacity-70 dark:bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.03))] dark:opacity-100" />
      <div className="relative z-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ff6c02]">Equipo de soporte</p>
          <h3 className="mt-2 text-xl font-black text-foreground md:text-2xl">Elige el área que necesitas</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Selecciona una persona o área para encontrar el canal adecuado dentro del ecosistema DECO EXCHANGE.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-6">
          {supportProfiles.map((profile, index) => {
            const Icon = profile.icon
            const active = index === activeIndex

            return (
              <button
                key={profile.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "group flex aspect-square min-h-14 flex-col items-center justify-center rounded-full border border-border bg-background/70 p-2 text-center transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6c02] dark:bg-background/40",
                  active && "scale-110 border-[#ff6c02] bg-[#ff6c02] text-white shadow-[0_16px_36px_rgba(255,108,2,0.28)] dark:bg-white dark:text-black dark:shadow-none"
                )}
              >
                <Icon className={cn("h-5 w-5 text-[#ff6c02]", active && "text-current")} />
                <span className="mt-1 max-w-full truncate text-xs font-bold">{profile.name}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-5 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background/75 p-4 text-left dark:bg-background/35">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ff6c02] text-white">
              <ActiveIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-base font-black text-foreground">{activeProfile.name}</p>
              <p className="text-sm font-semibold text-[#ff6c02]">{activeProfile.role}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{activeProfile.detail}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

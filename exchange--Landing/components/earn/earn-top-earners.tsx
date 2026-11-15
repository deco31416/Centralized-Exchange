"use client"

import * as React from "react"
import { Crown, EyeOff, ShieldCheck, Trophy, UserRoundCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  EarnHero,
  EarnHeroStat,
  EarnMetricCard,
  EarnModal,
  EarnPanel,
  EarnSummary,
  EarnSummaryRow,
} from "./earn-components"
import { earnTopEarners, earnTopEarnerStats } from "./earn-data"

type RankingModal = "alias" | "rules" | "claim" | null

export function EarnTopEarners() {
  const [modal, setModal] = React.useState<RankingModal>(null)

  return (
    <div className="space-y-6">
      <EarnHero
        eyebrow="Ganar · Ranking"
        title="Hazte visible"
        description="Compite por posicion mensual, premios en token y reconocimiento dentro de Deco. Tu identidad se muestra con alias y reglas antiabuso antes de reclamar cualquier premio."
        aside={
          <EarnHeroStat
            label="Tu carrera"
            value="#12"
            description="Posicion mock del mes, calculada por actividad valida y programas elegibles."
          />
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {earnTopEarnerStats.map((metric) => (
          <EarnMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Leaderboard</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Ganadores del mes</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Ranking por puntos elegibles. Los premios pueden pagarse en DECO, USDT o tokens de proyectos Launchpad segun la campana.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => setModal("alias")}>
                  <UserRoundCog className="mr-2 h-4 w-4" />
                  Alias
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => setModal("rules")}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Reglas
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {earnTopEarners.map((earner) => (
                <div
                  key={`${earner.rank}-${earner.alias}`}
                  className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4"
                >
                  <div className="grid gap-4 md:grid-cols-[0.25fr_1fr_0.75fr_0.7fr_0.7fr] md:items-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-lg font-black text-foreground">
                      {earner.rank <= 3 ? <Crown className="h-5 w-5 text-primary" /> : `#${earner.rank}`}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{earner.badge}</p>
                      <h3 className="mt-1 text-lg font-black text-foreground">{earner.alias}</h3>
                      <p className="text-sm text-muted-foreground">{earner.program}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Puntos</p>
                      <p className="text-sm font-black text-foreground">{earner.points}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Premio</p>
                      <p className="text-sm font-black text-foreground">{earner.reward}</p>
                    </div>
                    <div className="md:text-right">
                      <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
                        Mensual
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </EarnPanel>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Formula mock</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Como se suman puntos</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {[
                ["Referidos", "Activacion valida"],
                ["Cashback", "Compras elegibles"],
                ["Launchpad", "Participacion permitida"],
                ["Liquidez", "Volumen verificado"],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <p className="text-sm font-black text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </EarnPanel>
        </div>

        <div className="space-y-5">
          <EarnSummary eyebrow="Tu perfil" title="Alias publico">
            <EarnSummaryRow label="Alias" value="Tu alias" />
            <EarnSummaryRow label="Privacidad" value="Visible con alias" />
            <EarnSummaryRow label="Posicion" value="#12" />
            <EarnSummaryRow label="Premio" value="35 USDT" />
            <Button className="mt-2 w-full rounded-full" onClick={() => setModal("claim")}>
              Reclamar premio
            </Button>
          </EarnSummary>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Privacidad</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Tu nombre no tiene que salir</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              El ranking debe usar alias publico, opt-in y controles antiabuso. La identidad real queda para verificacion interna.
            </p>
            <Button variant="outline" className="mt-5 w-full rounded-full" onClick={() => setModal("alias")}>
              <EyeOff className="mr-2 h-4 w-4" />
              Configurar alias
            </Button>
          </EarnPanel>
        </div>
      </div>

      <EarnModal
        open={modal === "alias"}
        onClose={() => setModal(null)}
        title="Configurar alias"
        subtitle="Mockup de privacidad para aparecer en el ranking."
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Guardar alias mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Alias actual" value="Tu alias" />
          <EarnSummaryRow label="Visibilidad" value="Ranking mensual" />
          <EarnSummaryRow label="Identidad real" value="Privada" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Luego el backend validara disponibilidad del alias, cambios permitidos y opt-in del usuario.
          </p>
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "rules"}
        onClose={() => setModal(null)}
        title="Reglas antiabuso"
        subtitle="El ranking premia actividad valida, no volumen manipulado."
      >
        <div className="space-y-3">
          {[
            "Cuentas duplicadas, referidos falsos o actividad circular no suman puntos.",
            "Deco puede retener premios si hay revision de fraude o incumplimiento.",
            "La formula puede cambiar por campana, region o programa.",
            "Los premios pueden liquidarse en DECO, USDT o token Launchpad segun reglas vigentes.",
          ].map((rule) => (
            <div key={rule} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4 text-sm text-muted-foreground">
              {rule}
            </div>
          ))}
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "claim"}
        onClose={() => setModal(null)}
        title="Reclamar premio"
        subtitle="Confirmacion del ranking mensual."
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Enviar reclamo
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Posicion" value="#12" />
          <EarnSummaryRow label="Premio" value="35 DECO" />
          <EarnSummaryRow label="Destino" value="Bolsillito DECO" />
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                El premio final requiere corte mensual, validacion antiabuso y disponibilidad del programa.
              </p>
            </div>
          </div>
        </div>
      </EarnModal>
    </div>
  )
}

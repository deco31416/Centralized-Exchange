"use client"

import * as React from "react"
import Link from "next/link"
import { BadgeCheck, Coins, ExternalLink, Gift, History, ShieldCheck, Sparkles } from "lucide-react"

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
import {
  earnPointsMovements,
  earnPointsRewards,
  earnPointsSources,
  earnPointsStats,
  type EarnPointsReward,
} from "./earn-data"

type PointsModal = "redeem" | "rules" | "history" | null

export function EarnDecoPoints() {
  const [modal, setModal] = React.useState<PointsModal>(null)
  const [selectedReward, setSelectedReward] = React.useState<EarnPointsReward | null>(earnPointsRewards[0] ?? null)

  function openReward(reward: EarnPointsReward) {
    setSelectedReward(reward)
    setModal("redeem")
  }

  return (
    <div className="space-y-6">
      <EarnHero
        eyebrow="Ganar · Puntos Deco"
        title="Tus puntos mueven el ecosistema"
        description="Acumula puntos por actividad valida, aprende, invita, compra y canjea beneficios sin mezclarlo con rendimiento ni promesas garantizadas."
        aside={
          <EarnHeroStat
            label="Balance"
            value="8,420 pts"
            description="Puntos disponibles mock. El backend definira equivalencia, vencimiento y reglas por region."
          />
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {earnPointsStats.map((metric) => (
          <EarnMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Fuentes</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">De donde vienen tus puntos</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Puntos Deco es la capa comun de Ganar: suma actividad elegible y luego permite canjear beneficios.
                </p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => setModal("rules")}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Ver reglas
              </Button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {earnPointsSources.map((source) => (
                <div key={source.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
                      <Coins className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {source.status}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">{source.id}</p>
                  <h3 className="mt-1 text-xl font-black text-foreground">{source.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{source.description}</p>
                  <p className="mt-4 text-2xl font-black text-foreground">{source.points}</p>
                </div>
              ))}
            </div>
          </EarnPanel>

          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Canjes</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Elige como usar tus puntos</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Beneficios mock conectables a inventario real: tokens, descuentos, boosts o accesos.
                </p>
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">
                Sin promesa fija
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {earnPointsRewards.map((reward) => (
                <div key={reward.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
                      <Gift className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {reward.status}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">{reward.id}</p>
                  <h3 className="mt-1 text-xl font-black text-foreground">{reward.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reward.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Costo</p>
                      <p className="text-sm font-black text-foreground">{reward.cost}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Recibes</p>
                      <p className="text-sm font-black text-foreground">{reward.value}</p>
                    </div>
                  </div>
                  <Button
                    className="mt-4 w-full rounded-full"
                    disabled={reward.status === "Pronto"}
                    onClick={() => openReward(reward)}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Canjear
                  </Button>
                </div>
              ))}
            </div>
          </EarnPanel>

          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Historial</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Movimientos de puntos</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Entradas, pendientes y canjes listos para conectarse al gateway de usuario.
                </p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => setModal("history")}>
                <History className="mr-2 h-4 w-4" />
                Ver detalle
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {earnPointsMovements.map((movement) => (
                <div key={movement.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="grid gap-4 md:grid-cols-[1.1fr_0.7fr_0.7fr_0.65fr] md:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{movement.id}</p>
                      <h3 className="mt-1 text-lg font-black text-foreground">{movement.title}</h3>
                      <p className="text-sm text-muted-foreground">{movement.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fuente</p>
                      <p className="text-sm font-black text-foreground">{movement.source}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Puntos</p>
                      <p className="text-sm font-black text-foreground">{movement.points}</p>
                    </div>
                    <div className="md:text-right">
                      <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
                        {movement.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </EarnPanel>
        </div>

        <div className="space-y-5">
          <EarnSummary eyebrow="Resumen" title="Balance Puntos Deco">
            <EarnSummaryRow label="Disponible" value="8,420 pts" />
            <EarnSummaryRow label="Pendiente" value="1,180 pts" />
            <EarnSummaryRow label="Equivalencia" value="Variable" />
            <EarnSummaryRow label="Proximo venc." value="30 dias" />
            <Button className="mt-2 w-full rounded-full" onClick={() => openReward(earnPointsRewards[0])}>
              Canjear puntos
            </Button>
          </EarnSummary>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Regla de producto</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Puntos, no rendimiento</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Los puntos son beneficios del ecosistema. No representan deposito, inversion ni ganancia garantizada.
            </p>
            <div className="mt-5 grid gap-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/legals/giros-puntos">
                  Legal de puntos
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/legals/deco-token">
                  Token DECO
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </EarnPanel>
        </div>
      </div>

      <EarnModal
        open={modal === "redeem"}
        onClose={() => setModal(null)}
        title="Canjear puntos"
        subtitle={selectedReward ? `Beneficio: ${selectedReward.title}` : "Beneficio seleccionado"}
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Confirmar canje mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Costo" value={selectedReward?.cost ?? "Variable"} />
          <EarnSummaryRow label="Recibes" value={selectedReward?.value ?? "Beneficio"} />
          <EarnSummaryRow label="Estado" value={selectedReward?.status ?? "Disponible"} />
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                El canje final dependera de inventario, region, KYC, antiabuso y reglas vigentes del beneficio.
              </p>
            </div>
          </div>
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "rules"}
        onClose={() => setModal(null)}
        title="Reglas de Puntos Deco"
        subtitle="Condiciones mock para acumular, validar y canjear puntos."
      >
        <div className="space-y-3">
          {[
            "Los puntos se acreditan solo por actividad valida y verificable.",
            "Algunas fuentes pueden quedar pendientes hasta pasar controles de riesgo.",
            "Los puntos pueden vencer segun fecha, campana, region o tipo de beneficio.",
            "Canjes reversados, abuso o informacion falsa pueden cancelar recompensas.",
          ].map((rule) => (
            <div key={rule} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4 text-sm text-muted-foreground">
              {rule}
            </div>
          ))}
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "history"}
        onClose={() => setModal(null)}
        title="Historial de puntos"
        subtitle="Detalle mock de entradas, pendientes y canjes."
      >
        <div className="space-y-3">
          {earnPointsMovements.map((movement) => (
            <div key={movement.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-foreground">{movement.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {movement.source} · {movement.date}
                  </p>
                </div>
                <p className="text-right text-sm font-black text-foreground">{movement.points}</p>
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-primary">{movement.status}</p>
            </div>
          ))}
        </div>
      </EarnModal>
    </div>
  )
}

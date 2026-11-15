"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink, Gamepad2, Gift, ShieldCheck, Target } from "lucide-react"

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
import { earnMissionStats, earnMissions, type EarnMission } from "./earn-data"

type MissionModal = "detail" | "claim" | "rules" | null

export function EarnMissions() {
  const [modal, setModal] = React.useState<MissionModal>(null)
  const [selectedMission, setSelectedMission] = React.useState<EarnMission | null>(earnMissions[0] ?? null)

  function openMission(mission: EarnMission, modalType: MissionModal) {
    setSelectedMission(mission)
    setModal(modalType)
  }

  return (
    <div className="space-y-6">
      <EarnHero
        eyebrow="Ganar · Misiones"
        title="Completa misiones"
        description="Retos diarios, semanales y juego online para activar habitos dentro de Deco. Cada recompensa depende de actividad valida y revision."
        aside={
          <EarnHeroStat
            label="Hoy"
            value="7 activas"
            description="Misiones mock con racha, bonus semanal y premio elegible por completar."
          />
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {earnMissionStats.map((metric) => (
          <EarnMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Misiones activas</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Acciones que suman</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Misiones conecta aprendizaje, uso del producto, referidos y campanas en una experiencia gamificada.
                </p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => setModal("rules")}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Reglas
              </Button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {earnMissions.map((mission) => (
                <div key={mission.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
                      {mission.id === "MSN-GAME" ? <Gamepad2 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {mission.status}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">{mission.id}</p>
                  <h3 className="mt-1 text-xl font-black text-foreground">{mission.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mission.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Progreso</p>
                      <p className="text-sm font-black text-foreground">{mission.progress}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Recompensa</p>
                      <p className="text-sm font-black text-foreground">{mission.reward}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-full" onClick={() => openMission(mission, "detail")}>
                      Ver mision
                    </Button>
                    <Button
                      className="rounded-full"
                      disabled={mission.status !== "Completada"}
                      onClick={() => openMission(mission, "claim")}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Reclamar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </EarnPanel>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Juego online</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Reto semanal Deco</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              El juego vive como una mision destacada: puntaje, ranking, premio token y reglas antiabuso antes de reclamar.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <EarnSummaryRow label="Entrada" value="Gratis mock" />
              <EarnSummaryRow label="Premio" value="50 DECO" />
              <EarnSummaryRow label="Corte" value="Domingo" />
            </div>
          </EarnPanel>
        </div>

        <div className="space-y-5">
          <EarnSummary eyebrow="Resumen" title="Tu racha">
            <EarnSummaryRow label="Racha actual" value="4 dias" />
            <EarnSummaryRow label="Bonus semanal" value="+15%" />
            <EarnSummaryRow label="Reclamable" value="360 pts" />
            <EarnSummaryRow label="Token destacado" value="DECO" />
            <Button className="mt-2 w-full rounded-full" onClick={() => openMission(earnMissions[0], "claim")}>
              Reclamar disponible
            </Button>
          </EarnSummary>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Base legal</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Jugar no garantiza ganar</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Las misiones premian actividad valida y pueden requerir KYC, region disponible y revision de abuso.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full rounded-full">
              <Link href="/legals/play-to-earn">
                Ver Play to Earn
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </EarnPanel>
        </div>
      </div>

      <EarnModal
        open={modal === "detail"}
        onClose={() => setModal(null)}
        title="Detalle de mision"
        subtitle={selectedMission ? selectedMission.title : "Mision seleccionada"}
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal("claim")} disabled={selectedMission?.status !== "Completada"}>
            Reclamar si aplica
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Progreso" value={selectedMission?.progress ?? "0 / 1"} />
          <EarnSummaryRow label="Recompensa" value={selectedMission?.reward ?? "Puntos"} />
          <EarnSummaryRow label="Estado" value={selectedMission?.status ?? "Disponible"} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            El usuario debe completar todos los requisitos antes de reclamar. El gateway validara la actividad final.
          </p>
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "claim"}
        onClose={() => setModal(null)}
        title="Reclamar recompensa"
        subtitle={selectedMission ? selectedMission.title : "Mision completada"}
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Reclamar mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Recompensa" value={selectedMission?.reward ?? "Puntos"} />
          <EarnSummaryRow label="Destino" value="Puntos Deco" />
          <EarnSummaryRow label="Revision" value="Antiabuso" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Esta accion no acredita fondos reales. El backend confirmara elegibilidad, monto y trazabilidad.
          </p>
        </div>
      </EarnModal>

      <EarnModal open={modal === "rules"} onClose={() => setModal(null)} title="Reglas de misiones">
        <div className="space-y-3">
          {[
            "Cada mision tiene requisitos, fecha y recompensa propia.",
            "Las recompensas pueden ser puntos, DECO, token Launchpad o beneficios.",
            "El juego online requiere reglas claras, ranking valido y controles antiabuso.",
            "Misiones vencidas o actividades reversadas no generan recompensa.",
          ].map((rule) => (
            <div key={rule} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4 text-sm text-muted-foreground">
              {rule}
            </div>
          ))}
        </div>
      </EarnModal>
    </div>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink, Rocket, ShieldAlert, Sparkles } from "lucide-react"

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
  earnLaunchpadProjects,
  earnLaunchpadStats,
  type EarnLaunchpadProject,
} from "./earn-data"

type LaunchpadModal = "detail" | "participate" | "risk" | null

export function EarnLaunchpad() {
  const [modal, setModal] = React.useState<LaunchpadModal>(null)
  const [selectedProject, setSelectedProject] = React.useState<EarnLaunchpadProject>(earnLaunchpadProjects[0])

  function openProject(project: EarnLaunchpadProject, nextModal: LaunchpadModal) {
    setSelectedProject(project)
    setModal(nextModal)
  }

  return (
    <div className="space-y-6">
      <EarnHero
        eyebrow="Ganar · Launchpad"
        title="Entra temprano"
        description="Explora proyectos seleccionados con cupos, riesgo visible, monedas aceptadas y vesting antes de enviar interes. Es participacion temprana, no rendimiento garantizado."
        aside={
          <EarnHeroStat
            label="Acceso"
            value="Whitelist"
            description="La elegibilidad depende de region, verificacion, cupo y reglas del proyecto."
          />
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {earnLaunchpadStats.map((metric) => (
          <EarnMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Proyectos</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Seleccionados para comunidad</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Cada proyecto vive como oportunidad separada, con reglas visibles antes de cualquier accion mock.
                </p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => setModal("risk")}>
                <ShieldAlert className="mr-2 h-4 w-4" />
                Riesgo launchpad
              </Button>
            </div>

            <div className="mt-5 grid gap-3">
              {earnLaunchpadProjects.map((project) => (
                <div key={project.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
                          <Rocket className="h-5 w-5" />
                        </div>
                        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                          {project.status}
                        </span>
                      </div>
                      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">{project.id} · {project.sector}</p>
                      <h3 className="mt-1 text-2xl font-black text-foreground">{project.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Objetivo</p>
                        <p className="text-sm font-black text-foreground">{project.target}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Cupo usuario</p>
                        <p className="text-sm font-black text-foreground">{project.userCap}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Vesting</p>
                        <p className="text-sm font-black text-foreground">{project.vesting}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Riesgo</p>
                        <p className="text-sm font-black text-foreground">{project.risk}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      className="rounded-full"
                      disabled={project.status === "Cerrado"}
                      onClick={() => openProject(project, "participate")}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Participar
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => openProject(project, "detail")}>
                      Ver detalle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </EarnPanel>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Calendario</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Etapas del flujo</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {[
                ["01", "Whitelist", "Verificacion y cupo."],
                ["02", "Reserva", "Monto mock bloqueado."],
                ["03", "Asignacion", "Tokens estimados."],
                ["04", "Vesting", "Liberacion por etapas."],
              ].map(([step, title, detail]) => (
                <div key={step} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{step}</p>
                  <p className="mt-2 text-lg font-black text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </EarnPanel>
        </div>

        <div className="space-y-5">
          <EarnSummary eyebrow="Resumen" title="Elegibilidad launchpad">
            <EarnSummaryRow label="Perfil" value="Nivel 5 · Embajador" />
            <EarnSummaryRow label="KYC" value="Requerido" />
            <EarnSummaryRow label="Cupo mock" value="1,500 USDT" />
            <EarnSummaryRow label="Monedas" value="USDT / USDC" />
            <Button className="mt-2 w-full rounded-full" onClick={() => openProject(selectedProject, "participate")}>
              Simular participacion
            </Button>
          </EarnSummary>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Aviso</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Temprano tambien es riesgoso</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Launchpad puede implicar perdida total, baja liquidez, cambios de calendario, vesting largo y restricciones por jurisdiccion.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full rounded-full">
              <Link href="/legals/risks">
                Ver riesgos
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </EarnPanel>
        </div>
      </div>

      <EarnModal
        open={modal === "detail"}
        onClose={() => setModal(null)}
        title={selectedProject.name}
        subtitle={`${selectedProject.stage} · ${selectedProject.sector}`}
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Objetivo" value={selectedProject.target} />
          <EarnSummaryRow label="Cupo usuario" value={selectedProject.userCap} />
          <EarnSummaryRow label="Monedas" value={selectedProject.accepted} />
          <EarnSummaryRow label="Vesting" value={selectedProject.vesting} />
          <EarnSummaryRow label="Riesgo" value={selectedProject.risk} />
          <p className="text-sm leading-relaxed text-muted-foreground">{selectedProject.description}</p>
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "participate"}
        onClose={() => setModal(null)}
        title="Simular participacion"
        subtitle={selectedProject.name}
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Enviar interes mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Proyecto" value={selectedProject.name} />
          <EarnSummaryRow label="Monto mock" value="250 USDT" />
          <EarnSummaryRow label="Cupo maximo" value={selectedProject.userCap} />
          <EarnSummaryRow label="Vesting" value={selectedProject.vesting} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Esta accion no compra tokens reales. Solo representa el flujo UX que luego se conectara al gateway y reglas del proyecto.
          </p>
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "risk"}
        onClose={() => setModal(null)}
        title="Riesgo launchpad"
        subtitle="Participar temprano exige ver condiciones antes de enviar interes."
      >
        <div className="space-y-3">
          {[
            "La participacion no garantiza listado, liquidez, retorno ni precio futuro.",
            "El token puede quedar bloqueado por vesting o condiciones del proyecto.",
            "La disponibilidad depende de jurisdiccion, KYC, cupo y evaluacion interna.",
            "La informacion del proyecto puede cambiar antes de la asignacion final.",
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

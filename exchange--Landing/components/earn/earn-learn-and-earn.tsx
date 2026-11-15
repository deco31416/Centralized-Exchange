"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, CheckCircle2, ExternalLink, GraduationCap, ShieldCheck } from "lucide-react"

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
import { earnLearningPaths, earnLearningStats, type EarnLearningPath } from "./earn-data"

type LearnModal = "lesson" | "quiz" | "rules" | null

export function EarnLearnAndEarn() {
  const [modal, setModal] = React.useState<LearnModal>(null)
  const [selectedPath, setSelectedPath] = React.useState<EarnLearningPath | null>(earnLearningPaths[0] ?? null)

  function openLesson(path: EarnLearningPath, modalType: LearnModal = "lesson") {
    setSelectedPath(path)
    setModal(modalType)
  }

  return (
    <div className="space-y-6">
      <EarnHero
        eyebrow="Ganar · Aprende"
        title="Aprende y gana"
        description="Convierte educacion en progreso visible. Completa lecciones, responde quizzes y gana puntos o tokens sujetos a validacion."
        aside={
          <EarnHeroStat
            label="Ruta activa"
            value="62%"
            description="Progreso mock de aprendizaje con racha, recompensa pendiente y reglas antiabuso."
          />
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {earnLearningStats.map((metric) => (
          <EarnMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Rutas educativas</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Aprende lo que vas a usar</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Cada ruta separa contenido, progreso, recompensa y estado para conectarse luego al backend.
                </p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => setModal("rules")}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Reglas
              </Button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {earnLearningPaths.map((path) => (
                <div key={path.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {path.status}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">{path.id}</p>
                  <h3 className="mt-1 text-xl font-black text-foreground">{path.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{path.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Progreso</p>
                      <p className="text-sm font-black text-foreground">{path.progress}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Recompensa</p>
                      <p className="text-sm font-black text-foreground">{path.reward}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className="rounded-full" onClick={() => openLesson(path)}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Iniciar
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => openLesson(path, "quiz")}>
                      Quiz
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </EarnPanel>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Proxima accion</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Cierra el quiz de seguridad</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              El usuario ve una accion concreta, no una biblioteca vacia. El resultado final queda sujeto a actividad valida.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {["Lee la guia", "Responde 5 preguntas", "Reclama puntos"].map((step, index) => (
                <div key={step} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">0{index + 1}</p>
                  <p className="mt-2 text-sm font-black text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </EarnPanel>
        </div>

        <div className="space-y-5">
          <EarnSummary eyebrow="Resumen" title="Aprendizaje activo">
            <EarnSummaryRow label="Racha" value="6 dias" />
            <EarnSummaryRow label="Puntos ganados" value="920 pts" />
            <EarnSummaryRow label="Certificados" value="2 mock" />
            <EarnSummaryRow label="Pendiente" value="280 pts" />
            <Button className="mt-2 w-full rounded-full" onClick={() => openLesson(earnLearningPaths[0])}>
              Continuar ruta
            </Button>
          </EarnSummary>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Base legal</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Premia aprendizaje real</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              El contenido recompensado debe prevenir abuso, respuestas automatizadas y promesas de ganancia.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full rounded-full">
              <Link href="/legals/lee-y-gana">
                Ver Lee y Gana
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </EarnPanel>
        </div>
      </div>

      <EarnModal
        open={modal === "lesson"}
        onClose={() => setModal(null)}
        title="Iniciar leccion"
        subtitle={selectedPath ? selectedPath.title : "Ruta seleccionada"}
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal("quiz")}>
            Abrir quiz mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Progreso" value={selectedPath?.progress ?? "0%"} />
          <EarnSummaryRow label="Recompensa" value={selectedPath?.reward ?? "Puntos"} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Esta leccion representa contenido educativo. La recompensa se libera solo si el usuario completa la validacion.
          </p>
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "quiz"}
        onClose={() => setModal(null)}
        title="Quiz completado"
        subtitle="Resultado mock para probar el flujo de recompensa."
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Reclamar recompensa mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Resultado" value="4 / 5" />
          <EarnSummaryRow label="Recompensa" value={selectedPath?.reward ?? "Puntos"} />
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                El backend validara intentos, tiempo, region, cuenta y controles antiabuso antes de acreditar.
              </p>
            </div>
          </div>
        </div>
      </EarnModal>

      <EarnModal open={modal === "rules"} onClose={() => setModal(null)} title="Reglas educativas">
        <div className="space-y-3">
          {[
            "Completar una lectura no garantiza recompensa si el quiz no se valida.",
            "Las recompensas pueden ser puntos, DECO, token Launchpad o beneficios segun campana.",
            "Intentos automatizados, respuestas falsas o abuso cancelan el premio.",
            "Los contenidos pueden variar por region, perfil y disponibilidad.",
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

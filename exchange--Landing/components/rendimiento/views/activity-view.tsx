"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { RendimientoCard } from "../rendimiento-card"
import { rendimientoActivityEvents, rendimientoPositions, type RendimientoPosition, type RendimientoView } from "../rendimiento-data"
import { RendimientoWithdrawModal } from "../rendimiento-withdraw-modal"

type ActivityFilter = "Todas" | "Flexible" | "Programada"

export function ActivityView({ onNavigate }: { onNavigate: (view: RendimientoView) => void }) {
  const [filter, setFilter] = React.useState<ActivityFilter>("Todas")
  const [selectedPosition, setSelectedPosition] = React.useState<RendimientoPosition | null>(null)
  const filteredPositions = rendimientoPositions.filter((position) => filter === "Todas" || position.mode === filter)

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <RendimientoCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Actividad y posiciones</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Control de rendimiento</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Consulta posiciones activas, vencimientos, retiro flexible y estados conectables al gateway.
            </p>
          </div>
          <div className="flex rounded-full border border-border bg-muted/35 p-1 dark:bg-white/[0.035]">
            {(["Todas", "Flexible", "Programada"] as ActivityFilter[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-bold text-muted-foreground transition-colors",
                  filter === item && "bg-background text-foreground shadow-sm dark:bg-white/[0.075]"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredPositions.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-dashed border-border bg-background p-6 text-center">
              <p className="text-lg font-black text-foreground">Sin posiciones para este filtro</p>
              <p className="mt-2 text-sm text-muted-foreground">Simula staking o boveda para ver actividad aqui.</p>
              <div className="mt-4 flex justify-center gap-2">
                <Button className="rounded-full" onClick={() => onNavigate("staking")}>Ir a staking</Button>
                <Button variant="outline" className="rounded-full" onClick={() => onNavigate("vault")}>Ver boveda</Button>
              </div>
            </div>
          ) : (
            filteredPositions.map((position) => (
              <div key={position.id} className="rounded-[var(--radius)] border border-border bg-background p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{position.id}</p>
                    <h3 className="mt-1 text-lg font-black text-foreground">{position.product}</h3>
                    <p className="text-sm text-muted-foreground">{position.amount} · {position.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      disabled={!position.canWithdraw}
                      onClick={() => setSelectedPosition(position)}
                    >
                      Retirar
                    </Button>
                    <Button className="rounded-full" onClick={() => onNavigate("calculator")}>Simular</Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Inicio</p>
                    <p className="font-bold text-foreground">{position.startedAt}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vencimiento</p>
                    <p className="font-bold text-foreground">{position.endsAt}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimacion</p>
                    <p className="font-bold text-foreground">{position.estimate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estado</p>
                    <p className="font-bold text-foreground">{position.nextStep}</p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${position.progress}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </RendimientoCard>

      <RendimientoCard>
        <h3 className="text-xl font-black text-foreground">Timeline</h3>
        <p className="mt-1 text-sm text-muted-foreground">Eventos recientes del flujo de rendimiento.</p>
        <div className="mt-5 space-y-3">
          {rendimientoActivityEvents.map((event) => (
            <div key={event.id} className="rounded-[var(--radius)] border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-foreground">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{event.date}</span>
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-primary">{event.status}</p>
            </div>
          ))}
        </div>
      </RendimientoCard>

      <RendimientoWithdrawModal
        position={selectedPosition}
        open={Boolean(selectedPosition)}
        onOpenChange={(open) => !open && setSelectedPosition(null)}
      />
    </div>
  )
}

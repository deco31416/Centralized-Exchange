"use client"

import { Button } from "@/components/ui/button"

import { RendimientoCard } from "../rendimiento-card"
import { rendimientoPositions, rendimientoProducts, rendimientoStats, type RendimientoView } from "../rendimiento-data"

export function OverviewView({ onNavigate }: { onNavigate: (view: RendimientoView) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {rendimientoStats.map((stat) => (
          <RendimientoCard key={stat.label} className="p-4">
            <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.detail}</p>
          </RendimientoCard>
        ))}
      </div>

      <RendimientoCard>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">
              Nivel 4 · Uso inteligente
            </div>
            <h2 className="text-2xl font-black text-foreground">Productos de rendimiento</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Selecciona un producto, revisa minimo, liquidez, riesgo y condiciones. Las cifras son referencias para experiencia mockup.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => onNavigate("staking")}>Ver staking</Button>
            <Button variant="outline" className="rounded-full" onClick={() => onNavigate("vault")}>Boveda programada</Button>
            <Button variant="outline" className="rounded-full" onClick={() => onNavigate("activity")}>Actividad</Button>
          </div>
        </div>
      </RendimientoCard>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <RendimientoCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-foreground">Opciones disponibles</h3>
              <p className="text-sm text-muted-foreground">Activos elegibles y condiciones principales.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {rendimientoProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onNavigate(product.id === "deco-token" ? "reserves" : "staking")}
                className="rounded-[var(--radius)] border border-border bg-background p-4 text-left transition-colors hover:bg-muted/45"
              >
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{product.asset}</p>
                <h4 className="mt-2 text-base font-black text-foreground">{product.title}</h4>
                <p className="mt-1 min-h-10 text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
                  <span className="rounded-full border border-border px-2.5 py-1">{product.minimum}</span>
                  <span className="rounded-full border border-border px-2.5 py-1">{product.risk}</span>
                </div>
              </button>
            ))}
          </div>
        </RendimientoCard>

        <RendimientoCard>
          <h3 className="text-xl font-black text-foreground">Actividad mockup</h3>
          <p className="mt-1 text-sm text-muted-foreground">Posiciones conectables al gateway de usuario.</p>
          <div className="mt-4 space-y-3">
            {rendimientoPositions.map((position) => (
              <div key={position.id} className="rounded-[var(--radius)] border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-foreground">{position.product}</p>
                    <p className="text-xs text-muted-foreground">{position.id} · {position.amount}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{position.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-bold text-muted-foreground">Estimacion</p>
                    <p className="text-foreground">{position.estimate}</p>
                  </div>
                  <div>
                    <p className="font-bold text-muted-foreground">Estado</p>
                    <p className="text-foreground">{position.nextStep}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RendimientoCard>
      </div>
    </div>
  )
}

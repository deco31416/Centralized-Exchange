"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { RendimientoCard } from "../rendimiento-card"
import type { RendimientoView } from "../rendimiento-data"

export function CalculatorView({ onNavigate }: { onNavigate: (view: RendimientoView) => void }) {
  const [amount, setAmount] = React.useState("100")
  const parsedAmount = Number(amount) || 0
  const conservative = parsedAmount * 0.006
  const base = parsedAmount * 0.012
  const high = parsedAmount * 0.018

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Rendimiento</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Calculadora de retorno</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Simula escenarios antes de activar staking o una bóveda programada. Las cifras son referencias variables.
            </p>
          </div>

          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4 lg:w-[360px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Simulación</p>
            <p className="mt-2 text-3xl font-black text-foreground">Antes de activar</p>
            <p className="mt-1 text-sm text-muted-foreground">Revisa monto, plazo, comisiones, liquidez y disponibilidad.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <RendimientoCard>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Calculadora</p>
          <h2 className="mt-2 text-2xl font-black text-foreground">Configura el escenario</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Esta simulacion es referencial. El resultado final depende del producto, activo, plazo, comisiones y disponibilidad.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-foreground">Monto</span>
              <Input
                className="mt-2 rounded-full"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[var(--radius)] border border-border bg-background p-3">
                <p className="text-xs font-bold text-muted-foreground">Activo</p>
                <p className="mt-1 font-black text-foreground">USDT</p>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-background p-3">
                <p className="text-xs font-bold text-muted-foreground">Plazo</p>
                <p className="mt-1 font-black text-foreground">30 dias</p>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-background p-3">
                <p className="text-xs font-bold text-muted-foreground">Riesgo</p>
                <p className="mt-1 font-black text-foreground">Variable</p>
              </div>
            </div>
          </div>
        </RendimientoCard>

        <RendimientoCard>
          <h3 className="text-xl font-black text-foreground">Escenarios estimados</h3>
          <p className="mt-1 text-sm text-muted-foreground">Son referencias de retorno, sujetas a condiciones.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { label: "Conservador", value: conservative },
              { label: "Base", value: base },
              { label: "Alto", value: high },
            ].map((scenario) => (
              <div key={scenario.label} className="rounded-[var(--radius)] border border-border bg-background p-4">
                <p className="text-xs font-bold text-muted-foreground">{scenario.label}</p>
                <p className="mt-2 text-2xl font-black text-foreground">{scenario.value.toFixed(2)} USDT</p>
                <p className="mt-1 text-xs text-muted-foreground">Referencia mensual</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[var(--radius)] border border-border bg-background p-4">
            <p className="text-sm font-bold text-foreground">Condiciones visibles</p>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Comision</p>
                <p className="font-bold text-foreground">Segun producto</p>
              </div>
              <div>
                <p className="text-muted-foreground">Liquidez</p>
                <p className="font-bold text-foreground">Segun plazo</p>
              </div>
              <div>
                <p className="text-muted-foreground">Disponibilidad</p>
                <p className="font-bold text-foreground">Pais y KYC</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => onNavigate("staking")}>Ir a staking</Button>
            <Button variant="outline" className="rounded-full" onClick={() => onNavigate("vault")}>Ver boveda</Button>
          </div>
        </RendimientoCard>
      </div>
    </div>
  )
}

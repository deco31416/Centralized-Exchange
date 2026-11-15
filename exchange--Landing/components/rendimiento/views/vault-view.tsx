"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { RendimientoActionModal } from "../rendimiento-action-modal"
import { RendimientoCard } from "../rendimiento-card"
import { vaultPlans, type VaultPlan } from "../rendimiento-data"

export function VaultView() {
  const [selectedPlan, setSelectedPlan] = React.useState<VaultPlan>(vaultPlans[0])
  const [modalPlan, setModalPlan] = React.useState<VaultPlan | null>(null)
  const [amount, setAmount] = React.useState("100")
  const numericAmount = Number(amount) || 0
  const estimatedReference = numericAmount * 0.012
  const totalLockedReserves = 18_200_000
  const totalDeclaredReserves = 128_400_000
  const lockedShare = numericAmount > 0 ? (numericAmount / totalLockedReserves) * 100 : 0
  const totalShare = numericAmount > 0 ? (numericAmount / totalDeclaredReserves) * 100 : 0
  const formatShare = (value: number) => (value < 0.01 && value > 0 ? "<0.01%" : `${value.toFixed(2)}%`)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Rendimiento</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Bóveda Programada</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Bloquea activos por un periodo definido, revisa condiciones y simula una proyección variable antes de activar.
            </p>
          </div>
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4 lg:w-[360px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Producto</p>
            <p className="mt-2 text-3xl font-black text-foreground">Plazo definido</p>
            <p className="mt-1 text-sm text-muted-foreground">Retiros, comisiones y disponibilidad dependen del plan elegido.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <RendimientoCard>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Elige plazo</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Planes disponibles</h2>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">
                Mockup conectable
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {vaultPlans.map((plan) => {
                const active = selectedPlan.term === plan.term && selectedPlan.asset === plan.asset

                return (
                  <button
                    key={`${plan.asset}-${plan.term}`}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={[
                      "relative min-h-[148px] rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-card/70",
                      active ? "bg-primary/[0.035]" : "",
                    ].join(" ")}
                  >
                    {active && <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary" />}
                    <p className="pl-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">{plan.asset}</p>
                    <h3 className="mt-2 pl-1 text-3xl font-black text-foreground">{plan.term}</h3>
                    <p className="mt-2 pl-1 text-sm text-muted-foreground">{plan.estimate}</p>
                    <div className="mt-4 flex flex-wrap gap-2 pl-1 text-[11px] font-bold text-muted-foreground">
                      <span className="rounded-full border border-border px-2.5 py-1">{plan.minimum}</span>
                      <span className="rounded-full border border-border px-2.5 py-1">{plan.exit}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </RendimientoCard>

          <RendimientoCard>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Configura monto</p>
            <div className="mt-4 flex min-h-[72px] items-center gap-3 rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background px-4">
              <span className="text-3xl font-black text-muted-foreground">$</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder="0.00"
                className="min-w-0 flex-1 bg-transparent text-4xl font-black tracking-normal text-foreground outline-none placeholder:text-muted-foreground/35"
              />
              <span className="text-lg font-black text-foreground">{selectedPlan.asset}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[20, 100, 500, 1000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(String(quickAmount))}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
                >
                  {quickAmount} {selectedPlan.asset}
                </button>
              ))}
            </div>
          </RendimientoCard>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Inicio", value: "Hoy" },
              { label: "Vencimiento", value: selectedPlan.term },
              { label: "Salida", value: selectedPlan.exit },
            ].map((item) => (
              <RendimientoCard key={item.label} className="p-4">
                <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-lg font-black text-foreground">{item.value}</p>
              </RendimientoCard>
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <RendimientoCard>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Resumen</p>
            <div className="mt-4 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Proyección referencial</p>
              <p className="mt-2 text-3xl font-black text-foreground">
                {estimatedReference.toFixed(2)} {selectedPlan.asset}
              </p>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Monto", value: `${numericAmount || 0} ${selectedPlan.asset}` },
                { label: "Plazo", value: selectedPlan.term },
                { label: "Mínimo", value: selectedPlan.minimum },
                { label: "Comisión", value: selectedPlan.fee },
                { label: "Riesgo", value: "Variable" },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-right font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            <Button className="mt-5 w-full rounded-full" onClick={() => setModalPlan(selectedPlan)}>
              Simular bóveda
            </Button>
          </RendimientoCard>

          <RendimientoCard>
            <p className="text-sm font-black text-foreground">Condición clave</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La bóveda usa una proyección variable. El resultado final depende de condiciones vigentes, liquidez, país y validación KYC.
            </p>
          </RendimientoCard>

          <RendimientoCard>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Reservas</p>
            <h2 className="mt-2 text-lg font-black text-foreground">Tu bóveda en reservas</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Mientras esté activa, esta simulación se refleja como reserva bloqueada dentro del estado general de respaldo.
            </p>

            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Tu bóveda", value: `${numericAmount || 0} ${selectedPlan.asset}` },
                { label: "Reservas bloqueadas", value: "18.2M USDT" },
                { label: "Parte bloqueada", value: formatShare(lockedShare) },
                { label: "Parte del total", value: formatShare(totalShare) },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-right font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            <Link
              href="/rendimiento/reservas"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:text-primary"
            >
              Ver reservas
            </Link>
          </RendimientoCard>
        </aside>
      </div>

      {modalPlan && (
        <RendimientoActionModal
          open={Boolean(modalPlan)}
          onOpenChange={(open) => !open && setModalPlan(null)}
          eyebrow="Boveda programada"
          title={`${modalPlan.asset} · ${modalPlan.term}`}
          description="Simula una boveda con plazo definido, proyeccion variable y condiciones visibles."
          asset={modalPlan.asset}
          minimum={modalPlan.minimum}
          estimate={modalPlan.estimate}
          liquidity={modalPlan.exit}
          risk="Variable"
          fee={modalPlan.fee}
          ctaLabel="Crear simulacion"
        />
      )}
    </div>
  )
}

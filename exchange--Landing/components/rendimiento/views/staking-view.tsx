"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { RendimientoActionModal } from "../rendimiento-action-modal"
import { RendimientoCard } from "../rendimiento-card"
import { rendimientoProducts, type RendimientoProduct } from "../rendimiento-data"

export function StakingView() {
  const [selectedProduct, setSelectedProduct] = React.useState<RendimientoProduct>(rendimientoProducts[0])
  const [modalProduct, setModalProduct] = React.useState<RendimientoProduct | null>(null)
  const [amount, setAmount] = React.useState("100")
  const numericAmount = Number(amount) || 0
  const referenceReturn = numericAmount * 0.009
  const globalStakingPool = 42_600_000
  const totalDeclaredReserves = 128_400_000
  const poolShare = numericAmount > 0 ? (numericAmount / globalStakingPool) * 100 : 0
  const totalShare = numericAmount > 0 ? (numericAmount / totalDeclaredReserves) * 100 : 0
  const formatShare = (value: number) => (value < 0.01 && value > 0 ? "<0.01%" : `${value.toFixed(2)}%`)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Rendimiento</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Staking de Tokens</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Selecciona un activo elegible, revisa liquidez, riesgo y comisiones, y simula una posición antes de activarla.
            </p>
          </div>
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4 lg:w-[360px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Saldo elegible</p>
            <p className="mt-2 text-3xl font-black text-foreground">1,240 USDT</p>
            <p className="mt-1 text-sm text-muted-foreground">Disponible para simular productos de staking.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <RendimientoCard>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Activos elegibles</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Elige token</h2>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">
                Riesgo visible
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {rendimientoProducts.map((product) => {
                const active = selectedProduct.id === product.id

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className={[
                      "relative min-h-[150px] rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-card/70",
                      active ? "bg-primary/[0.035]" : "",
                    ].join(" ")}
                  >
                    {active && <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary" />}
                    <p className="pl-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">{product.mode}</p>
                    <h3 className="mt-2 pl-1 text-xl font-black text-foreground">{product.title}</h3>
                    <p className="mt-2 min-h-10 pl-1 text-sm text-muted-foreground">{product.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 pl-1 text-[11px] font-bold text-muted-foreground">
                      <span className="rounded-full border border-border px-2.5 py-1">{product.minimum}</span>
                      <span className="rounded-full border border-border px-2.5 py-1">{product.risk}</span>
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
              <span className="text-lg font-black text-foreground">{selectedProduct.asset}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[20, 100, 500, 1000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(String(quickAmount))}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
                >
                  {quickAmount} {selectedProduct.asset}
                </button>
              ))}
            </div>
          </RendimientoCard>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Modalidad", value: selectedProduct.mode },
              { label: "Liquidez", value: selectedProduct.liquidity },
              { label: "Riesgo", value: selectedProduct.risk },
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Referencia mensual</p>
              <p className="mt-2 text-3xl font-black text-foreground">
                {referenceReturn.toFixed(2)} {selectedProduct.asset}
              </p>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Activo", value: selectedProduct.asset },
                { label: "Monto", value: `${numericAmount || 0} ${selectedProduct.asset}` },
                { label: "Mínimo", value: selectedProduct.minimum },
                { label: "Estimación", value: selectedProduct.estimate },
                { label: "Comisión", value: selectedProduct.fee },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-right font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            <Button className="mt-5 w-full rounded-full" onClick={() => setModalProduct(selectedProduct)}>
              Simular staking
            </Button>
          </RendimientoCard>

          <RendimientoCard>
            <p className="text-sm font-black text-foreground">Antes de activar</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              El staking puede depender de red, validador, liquidez, país y aprobación operativa. La simulación no bloquea fondos.
            </p>
          </RendimientoCard>

          <RendimientoCard>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Reservas</p>
            <h2 className="mt-2 text-lg font-black text-foreground">Tu staking en el pool</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La posición simulada queda visible dentro del pool de staking y se relaciona con las reservas declaradas.
            </p>

            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Tu posición", value: `${numericAmount || 0} ${selectedProduct.asset}` },
                { label: "Pool global staking", value: "42.6M USDT" },
                { label: "Parte del pool", value: formatShare(poolShare) },
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

      {modalProduct && (
        <RendimientoActionModal
          open={Boolean(modalProduct)}
          onOpenChange={(open) => !open && setModalProduct(null)}
          eyebrow="Staking de tokens"
          title={modalProduct.title}
          description="Simula una posicion antes de activar fondos reales. Este flujo queda listo para conectar al gateway de usuario."
          asset={modalProduct.asset}
          minimum={modalProduct.minimum}
          estimate={modalProduct.estimate}
          liquidity={modalProduct.liquidity}
          risk={modalProduct.risk}
          fee={modalProduct.fee}
          ctaLabel="Crear simulacion"
        />
      )}
    </div>
  )
}

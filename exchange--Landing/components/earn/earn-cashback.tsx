"use client"

import * as React from "react"
import Link from "next/link"
import { BadgeDollarSign, Check, ExternalLink, Gift, ShieldCheck } from "lucide-react"

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
  earnCashbackCategories,
  earnCashbackMovements,
  earnCashbackStats,
  type EarnCashbackCategory,
} from "./earn-data"

type CashbackModal = "activate" | "detail" | "payout" | null

export function EarnCashback() {
  const [modal, setModal] = React.useState<CashbackModal>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<EarnCashbackCategory | null>(earnCashbackCategories[1] ?? null)

  function openCategory(category: EarnCashbackCategory, modalType: CashbackModal) {
    setSelectedCategory(category)
    setModal(modalType)
  }

  return (
    <div className="space-y-6">
      <EarnHero
        eyebrow="Ganar · Cashback"
        title="Recupera valor"
        description="Activa beneficios por compras, pagos y comercios elegibles. Cada devolucion muestra regla, estado, fecha de corte y moneda antes de cobrarse."
        aside={
          <EarnHeroStat
            label="Corte actual"
            value="46.80 USDT"
            description="Monto mock acumulado, sujeto a validacion y disponibilidad regional."
          />
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {earnCashbackStats.map((metric) => (
          <EarnMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Categorias</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Activa lo que usas</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Cashback no es rendimiento: es una devolucion condicionada por uso, comercios, campanas y reglas vigentes.
                </p>
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">
                Sin tabs · Una ruta
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {earnCashbackCategories.map((category) => (
                <div key={category.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
                      <Gift className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {category.status}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">{category.id}</p>
                  <h3 className="mt-1 text-xl font-black text-foreground">{category.title}</h3>
                  <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="text-lg font-black text-foreground">{category.rate}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Limite</p>
                      <p className="text-sm font-black text-foreground">{category.limit}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      className="rounded-full"
                      disabled={category.status === "Pausada"}
                      onClick={() => openCategory(category, "activate")}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Activar
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => openCategory(category, "detail")}>
                      Ver reglas
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </EarnPanel>

          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Historial</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Devoluciones recientes</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Movimientos mock con estados conectables al gateway.
                </p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => setModal("detail")}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Politica cashback
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {earnCashbackMovements.map((movement) => (
                <div key={movement.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="grid gap-4 md:grid-cols-[1.1fr_0.75fr_0.75fr_0.7fr] md:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{movement.id}</p>
                      <h3 className="mt-1 text-lg font-black text-foreground">{movement.title}</h3>
                      <p className="text-sm text-muted-foreground">{movement.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Compra</p>
                      <p className="text-sm font-black text-foreground">{movement.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cashback</p>
                      <p className="text-sm font-black text-foreground">{movement.reward}</p>
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
          <EarnSummary eyebrow="Resumen" title="Cashback disponible">
            <EarnSummaryRow label="Ciclo" value="Junio 2026" />
            <EarnSummaryRow label="Disponible" value="28.55 USDT" />
            <EarnSummaryRow label="Pendiente" value="18.25 USDT" />
            <EarnSummaryRow label="Destino" value="Bolsillito USDT" />
            <Button className="mt-2 w-full rounded-full" onClick={() => setModal("payout")}>
              Solicitar cobro
            </Button>
          </EarnSummary>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Regla simple</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Usas, validas, cobras</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              La devolucion depende de categoria activa, comercio elegible, fecha de corte, KYC y revision antiabuso.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full rounded-full">
              <Link href="/legals/comisiones">
                Ver comisiones
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </EarnPanel>
        </div>
      </div>

      <EarnModal
        open={modal === "activate"}
        onClose={() => setModal(null)}
        title="Activar cashback"
        subtitle={selectedCategory ? `Categoria: ${selectedCategory.title}` : "Categoria seleccionada"}
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Activar beneficio mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Rate" value={selectedCategory?.rate ?? "Variable"} />
          <EarnSummaryRow label="Limite" value={selectedCategory?.limit ?? "Segun campana"} />
          <EarnSummaryRow label="Estado" value={selectedCategory?.status ?? "Disponible"} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            La activacion queda sujeta a region, KYC, disponibilidad del programa y reglas vigentes.
          </p>
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "detail"}
        onClose={() => setModal(null)}
        title="Reglas de cashback"
        subtitle="Condiciones mock para validar compras, pagos y promociones."
      >
        <div className="space-y-3">
          {[
            "La compra debe pertenecer a una categoria activa antes de la transaccion.",
            "El cashback puede quedar pendiente hasta que el comercio confirme la operacion.",
            "Promociones, limites y monedas pueden cambiar por region.",
            "Movimientos reversados, fraude o abuso cancelan la devolucion.",
          ].map((rule) => (
            <div key={rule} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4 text-sm text-muted-foreground">
              {rule}
            </div>
          ))}
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "payout"}
        onClose={() => setModal(null)}
        title="Solicitar cobro"
        subtitle="Mockup de salida hacia saldo disponible."
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Enviar solicitud mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Monto disponible" value="28.55 USDT" />
          <EarnSummaryRow label="Destino" value="Bolsillito USDT" />
          <EarnSummaryRow label="Revision" value="Corte + antiabuso" />
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <BadgeDollarSign className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Esta accion no mueve dinero real. El backend definira saldo final, disponibilidad y trazabilidad.
              </p>
            </div>
          </div>
        </div>
      </EarnModal>
    </div>
  )
}

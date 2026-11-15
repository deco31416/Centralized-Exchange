import Link from "next/link"
import { ArrowRight, ClipboardList, FileText, ShieldAlert } from "lucide-react"

import {
  aliadoDecoDisputes,
  aliadoDecoHistory,
  aliadoDecoLiquidity,
  aliadoDecoMetrics,
  aliadoDecoOrders,
  type AliadoDecoOrder,
} from "./red-deco-data"
import {
  RedDecoControlCard,
  RedDecoHero,
  RedDecoPanel,
  RedDecoStat,
  RedDecoSummaryRow,
} from "./red-deco-components"

export type AliadoDecoDashboardView = "dashboard" | "orders" | "reports" | "compliance"

function OrderCard({ order }: { order: AliadoDecoOrder }) {
  return (
    <article className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{order.id}</p>
          <h3 className="mt-1 text-lg font-black text-foreground">{order.type}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{order.user}</p>
        </div>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
          {order.status}
        </span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        <RedDecoSummaryRow label="Monto" value={order.amount} />
        <RedDecoSummaryRow label="Resultado" value={order.result} />
        <RedDecoSummaryRow label="Comision" value={order.commission} />
        <RedDecoSummaryRow label="Tiempo" value={order.timer} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground">
          Revisar
        </button>
        <button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-black text-foreground">
          Reportar
        </button>
      </div>
    </article>
  )
}

export function AliadoDecoDashboardNav({ view }: { view: AliadoDecoDashboardView }) {
  const items = [
    { href: "/earn/aliado-deco/dashboard", label: "Dashboard", value: "dashboard" },
    { href: "/earn/aliado-deco/orders", label: "Ordenes", value: "orders" },
    { href: "/earn/aliado-deco/reports", label: "Reportes", value: "reports" },
    { href: "/earn/aliado-deco/compliance", label: "Cumplimiento", value: "compliance" },
  ]

  return (
    <div className="flex gap-1 overflow-x-auto rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
            view === item.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

export function AliadoDecoDashboardPage({ view = "dashboard" }: { view?: AliadoDecoDashboardView }) {
  const showOrdersOnly = view === "orders"

  return (
    <div className="space-y-6">
      <RedDecoHero
        eyebrow="Aliado Deco · Consola"
        title={showOrdersOnly ? "Ordenes del aliado" : "Panel operativo"}
        description="Gestiona solicitudes presenciales, caja declarada, ganancias, disputas y trazabilidad sin calcular tasas manualmente."
        actionHref="/earn/aliado-deco"
        actionText="Volver a Aliado Deco"
        secondaryHref="/earn/aliado-deco/reports"
        secondaryText="Ver reportes"
        aside={<RedDecoStat label="Estado" value="Operativo" detail="Mock listo para conectar ordenes, riesgo y ledger." />}
      />

      <AliadoDecoDashboardNav view={view} />

      {!showOrdersOnly ? (
        <div className="grid gap-3 md:grid-cols-4">
          {aliadoDecoMetrics.map((metric) => {
            const Icon = metric.icon
            return (
              <RedDecoControlCard
                key={metric.label}
                icon={<Icon className="h-4 w-4" />}
                label={metric.label}
                value={`${metric.value} · ${metric.detail}`}
              />
            )
          })}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <RedDecoPanel>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Operacion</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">
                {showOrdersOnly ? "Todas las ordenes activas" : "Pendientes y en curso"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Cada orden mantiene estado, monto, comision, QR/codigo y trazabilidad para soporte.
              </p>
            </div>
            <Link href="/earn/aliado-deco/orders" className="inline-flex items-center gap-2 text-sm font-black text-foreground">
              Ver ordenes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {aliadoDecoOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </RedDecoPanel>

        <div className="space-y-5">
          <RedDecoPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Caja</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Liquidez declarada</h2>
            <div className="mt-4 space-y-3">
              {aliadoDecoLiquidity.map((item) => (
                <div key={item.asset} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-foreground">{item.asset}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.range}</p>
                    </div>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-foreground">{item.available}</p>
                </div>
              ))}
            </div>
          </RedDecoPanel>

          <RedDecoPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Disputas</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Control de riesgo</h2>
            <div className="mt-4 space-y-3">
              {aliadoDecoDisputes.map((dispute) => (
                <div key={dispute.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{dispute.id}</p>
                      <h3 className="mt-1 text-sm font-black text-foreground">{dispute.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{dispute.detail}</p>
                      <p className="mt-3 text-xs font-bold text-muted-foreground">
                        {dispute.status} · Riesgo {dispute.risk}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RedDecoPanel>
        </div>
      </div>

      {!showOrdersOnly ? (
        <RedDecoPanel>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Historial</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Cierres recientes</h2>
            </div>
            <div className="flex gap-2 text-sm font-black text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                <ClipboardList className="h-4 w-4 text-primary" />
                Ledger mock
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                <FileText className="h-4 w-4 text-primary" />
                PDF/CSV futuro
              </span>
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {aliadoDecoHistory.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </RedDecoPanel>
      ) : null}
    </div>
  )
}

"use client"

import {
  IconBuildingBank,
  IconCashBanknote,
  IconCreditCardPay,
  IconReceiptDollar,
  IconRefreshAlert,
  IconShieldDollar,
} from "@tabler/icons-react"

import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { FiatProvider, useFiatCustody } from "./use-fiat-custody"

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

function statusLabel(status: FiatProvider["status"]) {
  if (status === "active") return "Activo"
  if (status === "maintenance") return "Mantenimiento"
  return "En espera"
}

function statusClass(status: FiatProvider["status"]) {
  if (status === "active") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
  if (status === "maintenance") return "bg-amber-500/15 text-amber-700 dark:text-amber-300"
  return "bg-muted text-muted-foreground"
}

export function FiatCustodyPage() {
  const { providers, reconciliation, feePolicy, summary, loading, error } = useFiatCustody()
  const connected = !error

  const stats = [
    {
      title: "Proveedores fiat",
      value: loading ? "—" : summary.providers,
      change: { value: 0, label: "pasarelas", isPositive: true },
      icon: <IconBuildingBank className="size-5" />,
    },
    {
      title: "Activos",
      value: loading ? "—" : summary.activeProviders,
      change: { value: 0, label: "operativos", isPositive: true },
      icon: <IconShieldDollar className="size-5" />,
    },
    {
      title: "Fees externos",
      value: loading ? "—" : summary.externalFeeProfiles,
      change: { value: 0, label: "perfiles", isPositive: true },
      icon: <IconReceiptDollar className="size-5" />,
    },
    {
      title: "Revisión",
      value: loading ? "—" : summary.reviewItems,
      change: { value: 0, label: "conciliación", isPositive: summary.reviewItems === 0 },
      icon: <IconRefreshAlert className="size-5" />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Custodia fiat"
        description="Control de pasarelas, bancos, dinero real retenido, costos externos y conciliación operativa."
        state={connected ? "partial" : "pending"}
        percent={connected ? 45 : 10}
        note={
          connected
            ? "Vista inicial conectada por BFF y Gateway Admin hacia custody-fiat; movimientos reales y acciones quedan para fase auditada."
            : error ?? "No se pudo consultar custody-fiat en este momento."
        }
      />

      <StatsCards stats={stats} />

      <div className="grid gap-4 @4xl/page:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[1.5rem]">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Pasarelas y cuentas</CardTitle>
              <CardDescription>
                Donde se custodia el dinero fiat real antes de reflejarlo en saldos internos.
              </CardDescription>
            </div>
            <ConnectionStatusBadge state={connected ? "partial" : "pending"} percent={connected ? 45 : 10} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                Cargando proveedores desde Gateway Admin...
              </div>
            ) : providers.length ? (
              <div className="grid gap-3">
                {providers.map((provider) => (
                  <div key={provider.id} className="rounded-[1.25rem] border bg-card/70 p-4 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold">{provider.name}</p>
                          <Badge variant="outline" className="rounded-full">
                            {provider.country}
                          </Badge>
                          <Badge className={cn("rounded-full", statusClass(provider.status))}>
                            {statusLabel(provider.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {provider.rail} · {provider.currency}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold tabular-nums">
                          {money(provider.heldBalance, provider.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">saldo proveedor</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <span>Fee fijo: {money(provider.fee.fixed, provider.fee.currency)}</span>
                      <span>Fee variable: {provider.fee.percent.toFixed(2)}%</span>
                      <span>Liquidación: {provider.fee.settlementDays}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                No hay proveedores fiat registrados todavía.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-[1.5rem]">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
                <IconCreditCardPay className="size-6 text-primary" />
              </div>
              <CardTitle>Costos externos</CardTitle>
              <CardDescription>Fees cobrados por pasarelas antes de aplicar comisión o spread DECO.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {feePolicy?.note ??
                  "Los fees externos dependen del proveedor, país, moneda y método de liquidación."}
              </p>
              <div className="rounded-[1.25rem] border p-4">
                <p className="font-semibold">Liquidación pendiente</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {money(summary.pendingSettlement, "USD")}
                </p>
                <p className="text-xs text-muted-foreground">Agregado referencial multi-proveedor</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem]">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
                <IconCashBanknote className="size-6 text-primary" />
              </div>
              <CardTitle>Conciliación</CardTitle>
              <CardDescription>Comparación entre saldo de proveedor y saldo esperado por ledger.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando conciliación...</p>
              ) : reconciliation.length ? (
                reconciliation.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-[1rem] border p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{item.provider}</span>
                      <Badge variant="outline" className="rounded-full">
                        {item.status === "matched" ? "Cuadra" : "Revisar"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      Diferencia: {money(item.difference, item.currency)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin registros de conciliación.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

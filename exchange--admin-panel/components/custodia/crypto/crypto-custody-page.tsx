"use client"

import {
  IconAlertTriangle,
  IconCurrencyBitcoin,
  IconDatabase,
  IconEye,
  IconLock,
  IconShieldLock,
} from "@tabler/icons-react"

import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { useCryptoCustody } from "./use-crypto-custody"

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 8,
  }).format(value)
}

function shortAddress(value?: string) {
  if (!value) return "Sin dirección"
  if (value.length <= 18) return value
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

export function CryptoCustodyPage() {
  const { wallets, deposits, loading, error, summary } = useCryptoCustody()
  const connected = !error

  const stats = [
    {
      title: "Wallets activas",
      value: loading ? "—" : summary.activeWallets,
      change: { value: 0, label: "custodia crypto", isPositive: true },
      icon: <IconShieldLock className="size-5" />,
    },
    {
      title: "Activos custodiados",
      value: loading ? "—" : summary.assets,
      change: { value: 0, label: "por asset", isPositive: true },
      icon: <IconCurrencyBitcoin className="size-5" />,
    },
    {
      title: "Wallets bloqueadas",
      value: loading ? "—" : summary.lockedWallets,
      change: { value: 0, label: "emergencia", isPositive: summary.lockedWallets === 0 },
      icon: <IconLock className="size-5" />,
    },
    {
      title: "Depósitos recientes",
      value: loading ? "—" : summary.deposits,
      change: { value: 0, label: "últimos eventos", isPositive: true },
      icon: <IconDatabase className="size-5" />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Custodia crypto"
        description="Control de wallets calientes, balances reales, depósitos, retiros y watchtower blockchain."
        state={connected ? "partial" : "pending"}
        percent={connected ? 58 : 35}
        note={
          connected
            ? "Lectura conectada por BFF y Gateway Admin hacia custody-crypto; acciones sensibles quedan para fase auditada."
            : error ?? "No se pudo consultar custody-crypto en este momento."
        }
      />

      <StatsCards stats={stats} />

      <div className="grid gap-4 @4xl/page:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[1.5rem]">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Wallets de custodia</CardTitle>
              <CardDescription>
                Fondos reales custodiados por asset, red, límites y estado operativo.
              </CardDescription>
            </div>
            <ConnectionStatusBadge state={connected ? "partial" : "pending"} percent={connected ? 58 : 35} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                Cargando wallets desde Gateway Admin...
              </div>
            ) : wallets.length ? (
              <div className="grid gap-3">
                {wallets.slice(0, 6).map((wallet) => (
                  <div
                    key={wallet._id ?? `${wallet.blockchain}-${wallet.assetCode}`}
                    className="rounded-[1.25rem] border bg-card/70 p-4 shadow-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold">{wallet.assetCode ?? "Asset"}</p>
                          <Badge variant="outline" className="rounded-full">
                            {wallet.blockchain ?? "red"}
                          </Badge>
                          {wallet.isLocked ? (
                            <Badge className="rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300">
                              Bloqueada
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              Activa
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {shortAddress(wallet.mainAddress)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold tabular-nums">
                          {formatNumber(Number(wallet.balance || 0))}
                        </p>
                        <p className="text-xs text-muted-foreground">balance real</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <span>Por tx: {formatNumber(Number(wallet.maxWithdrawalPerTx || 0))}</span>
                      <span>Por hora: {formatNumber(Number(wallet.maxWithdrawalPerHour || 0))}</span>
                      <span>Por día: {formatNumber(Number(wallet.maxWithdrawalPerDay || 0))}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                No hay wallets de custodia activas registradas todavía.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-[1.5rem]">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
                <IconEye className="size-6 text-primary" />
              </div>
              <CardTitle>Watchtower</CardTitle>
              <CardDescription>Monitoreo de red y detección de depósitos blockchain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-full border px-4 py-2">
                <span className="text-muted-foreground">Estado</span>
                <Badge
                  className={cn(
                    "rounded-full",
                    summary.watchtowerRunning
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {summary.watchtowerRunning ? "Activo" : "Sin señal"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Las acciones de iniciar/detener watchtower deben pasar por flujo auditado antes de habilitarse en UI.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem]">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
                <IconAlertTriangle className="size-6 text-primary" />
              </div>
              <CardTitle>Depósitos recientes</CardTitle>
              <CardDescription>Últimos eventos detectados por custodia crypto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando depósitos...</p>
              ) : deposits.length ? (
                deposits.slice(0, 4).map((deposit) => (
                  <div key={deposit._id ?? deposit.txHash} className="rounded-[1rem] border p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{deposit.assetCode ?? "Asset"}</span>
                      <Badge variant="outline" className="rounded-full">
                        {deposit.status ?? "estado"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {formatNumber(Number(deposit.amount || 0))} en {deposit.blockchain ?? "red"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin depósitos recientes para mostrar.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

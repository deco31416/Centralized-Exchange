// components/p2p/views/DashboardView.tsx
"use client"

import type * as React from "react"
import { useAuth } from "@/components/p2p/use-auth"
import { useP2POrders } from "@/hooks/p2p/use-p2p-orders"
import { useMyAds } from "@/hooks/p2p/use-my-ads"
import { usePaymentMethods } from "@/hooks/p2p/use-payment-methods"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Megaphone, ShieldAlert, CreditCard, CheckCircle2, Clock } from "lucide-react"
import { useNavigation } from "@/components/p2p/use-navigation"
import type { Order } from "@/types/p2p"

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Creada",
  ESCROW_PENDING: "Escrow pendiente",
  ESCROW_LOCKED: "Escrow bloqueado",
  PAYMENT_PENDING: "Esperando pago",
  PAYMENT_MARKED: "Pago marcado",
  RELEASE_PENDING: "Liberación pendiente",
  RELEASED: "Completada",
  CANCELLED: "Cancelada",
  DISPUTED: "En disputa",
  EXPIRED: "Expirada",
  processing: "En proceso",
  completed: "Completada",
  cancelled: "Cancelada",
  disputed: "En disputa",
}

function StatCard({ title, value, icon: Icon, description, loading }: {
  title: string
  value: number | string
  icon: React.ElementType
  description?: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

function ActiveOrderRow({ order, onGo }: { order: Order; onGo: () => void }) {
  const rawStatus = ((order as unknown as Record<string, unknown>).status as string) ?? ""
  const label = STATUS_LABELS[rawStatus] ?? rawStatus
  const isDisputed = rawStatus === "disputed" || rawStatus === "DISPUTED"
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">
          {(order as unknown as Record<string, unknown>).crypto as string ?? "—"} /{" "}
          {(order as unknown as Record<string, unknown>).currency as string ?? "—"}
        </span>
        <span className="text-xs text-muted-foreground">{order.id?.slice(-8)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={isDisputed ? "destructive" : "secondary"} className="text-xs">{label}</Badge>
        <Button size="sm" variant="ghost" className="text-xs h-6 px-2" onClick={onGo}>Ver</Button>
      </div>
    </div>
  )
}

export function DashboardView() {
  const { user } = useAuth()
  const { setActiveView } = useNavigation()
  const { data: orders, isLoading: ordersLoading } = useP2POrders()
  const { data: ads, isLoading: adsLoading } = useMyAds()
  const { data: paymentMethods, isLoading: pmLoading } = usePaymentMethods()

  if (!user) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard P2P</h2>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Inicia sesión para ver tu dashboard P2P</CardTitle>
            <CardDescription>Consulta tus órdenes activas, anuncios y métodos de pago en un solo lugar.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setActiveView("market")}>Explorar el mercado</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const activeOrders = orders.filter((o) => {
    const s = ((o as unknown as Record<string, unknown>).status as string) ?? ""
    return !["completed", "cancelled", "RELEASED", "CANCELLED", "EXPIRED"].includes(s)
  })
  const completedOrders = orders.filter((o) => {
    const s = ((o as unknown as Record<string, unknown>).status as string) ?? ""
    return s === "completed" || s === "RELEASED"
  })
  const openDisputes = orders.filter((o) => {
    const s = ((o as unknown as Record<string, unknown>).status as string) ?? ""
    return s === "disputed" || s === "DISPUTED"
  })
  const activeAds = ads.filter((a) => a.status === "active")

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard P2P</h2>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Órdenes activas"
          value={activeOrders.length}
          icon={Clock}
          description="Órdenes en curso"
          loading={ordersLoading}
        />
        <StatCard
          title="Órdenes completadas"
          value={completedOrders.length}
          icon={CheckCircle2}
          description="Total histórico"
          loading={ordersLoading}
        />
        <StatCard
          title="Disputas abiertas"
          value={openDisputes.length}
          icon={ShieldAlert}
          description={openDisputes.length > 0 ? "Requieren atención" : "Sin disputas activas"}
          loading={ordersLoading}
        />
        <StatCard
          title="Anuncios activos"
          value={activeAds.length}
          icon={Megaphone}
          description={`${ads.length} anuncio${ads.length !== 1 ? "s" : ""} en total`}
          loading={adsLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Órdenes activas */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Órdenes activas</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveView("orders")}>
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : activeOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tienes órdenes activas.</p>
            ) : (
              <div>
                {activeOrders.slice(0, 5).map((o) => (
                  <ActiveOrderRow key={o.id} order={o} onGo={() => setActiveView("exchange")} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Métodos de pago */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Métodos de pago</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveView("settings")}>
                  Gestionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pmLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : paymentMethods.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Sin métodos. Agrega uno en Configuración para publicar anuncios.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.slice(0, 3).map((pm) => (
                    <div key={pm.id} className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{pm.name}</span>
                      <Badge variant="outline" className="text-xs capitalize ml-auto">
                        {pm.type?.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                  {paymentMethods.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{paymentMethods.length - 3} más</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mis anuncios */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Mis anuncios</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveView("my-ads")}>
                  Gestionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {adsLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : ads.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 text-center">No tienes anuncios publicados.</p>
              ) : (
                <div className="space-y-2">
                  {ads.slice(0, 3).map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between">
                      <span className="text-sm">
                        <span className={ad.type === "buy" ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                          {ad.type === "buy" ? "Compra" : "Venta"}
                        </span>{" "}
                        {ad.crypto?.toUpperCase()} / {ad.fiat?.toUpperCase()}
                      </span>
                      <Badge variant={ad.status === "active" ? "default" : "outline"} className="text-xs">
                        {ad.status}
                      </Badge>
                    </div>
                  ))}
                  {ads.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{ads.length - 3} más</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

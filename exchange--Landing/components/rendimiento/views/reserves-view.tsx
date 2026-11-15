"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"
import { BadgeCheck, Banknote, Bitcoin, FileCheck2, KeyRound, Layers3, ShieldCheck, WalletCards } from "lucide-react"

import { LoginModal } from "@/components/common/onboarding/login-modal"
import { RegisterModal } from "@/components/common/onboarding/register-modal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/p2p/use-auth"

import { RendimientoCard } from "../rendimiento-card"
import {
  myReserveItems,
  reserveConsolidated,
  reserveCryptoAssets,
  reserveFiatAssets,
  reserveMetrics,
  type ReserveAsset,
  userMerkleProof,
  userReserveBreakdown,
  userReserveShare,
} from "../rendimiento-data"

const proofLinks = [
  { title: "Prueba de reservas", href: "/legals/reservas", icon: FileCheck2 },
  { title: "Transparencia", href: "/legals/transparencia", icon: BadgeCheck },
  { title: "Auditorias", href: "/legals/auditorias", icon: ShieldCheck },
  { title: "Custodia", href: "/legals/deco-custody", icon: WalletCards },
]

function ReserveAssetTable({
  assets,
  icon,
  title,
  subtitle,
}: {
  assets: ReserveAsset[]
  icon: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <RendimientoCard>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-primary">
            {icon}
          </span>
          <div>
            <h2 className="text-2xl font-black text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span className="w-fit rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">
          Snapshot · 24h
        </span>
      </div>

      <div className="overflow-hidden rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background">
        <div className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.75fr] gap-3 border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span>Activo</span>
          <span>Reserva</span>
          <span>Usuarios</span>
          <span>Bloqueado</span>
          <span>Cobertura</span>
        </div>
        {assets.map((asset) => (
          <div
            key={`${asset.kind}-${asset.asset}`}
            className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.75fr] gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0"
          >
            <span className="font-black text-foreground">{asset.asset}</span>
            <span className="text-muted-foreground">{asset.total}</span>
            <span className="text-muted-foreground">{asset.users}</span>
            <span className="text-muted-foreground">{asset.locked}</span>
            <span className="font-bold text-foreground">{asset.coverage}</span>
          </div>
        ))}
      </div>
    </RendimientoCard>
  )
}

export function ReservesView() {
  const { isLoading, user } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const showPrivateProof = Boolean(user)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Rendimiento</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Reservas</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Consulta reservas crypto, reservas fiat, consolidado de fondos de usuarios y comprobante Merkle de tu cuenta.
            </p>
          </div>
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4 lg:w-[360px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Cobertura consolidada</p>
            <p className="mt-2 text-3xl font-black text-foreground">105.3%</p>
            <p className="mt-1 text-sm text-muted-foreground">Reservas declaradas frente al total de fondos de usuarios.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-4">
        {reserveMetrics.map((metric) => (
          <RendimientoCard key={metric.label} className="p-4">
            <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-black text-foreground">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.detail}</p>
          </RendimientoCard>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <RendimientoCard>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Consolidado</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Fondos de usuarios</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  El total combina pasivos crypto y fiat. La cobertura compara reservas declaradas contra saldos de usuarios.
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {reserveConsolidated.map((item) => (
                <div key={item.label} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-xl font-black text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </RendimientoCard>

          <ReserveAssetTable
            title="Reservas crypto"
            subtitle="Activos on-chain y saldos cripto de usuarios."
            assets={reserveCryptoAssets}
            icon={<Bitcoin className="h-5 w-5" />}
          />

          <ReserveAssetTable
            title="Reservas fiat"
            subtitle="Saldos fiat, bancos, proveedores y rails locales."
            assets={reserveFiatAssets}
            icon={<Banknote className="h-5 w-5" />}
          />
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          {isLoading ? (
            <RendimientoCard>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Privado</p>
              <h2 className="mt-2 text-lg font-black text-foreground">Verificando sesion</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Estamos revisando si puedes ver tu desglose personal de reservas.
              </p>
            </RendimientoCard>
          ) : showPrivateProof ? (
            <>
              <RendimientoCard>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Privado</p>
                    <h2 className="mt-1 text-lg font-black text-foreground">Asi esta tu dinero</h2>
                  </div>
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground">
                    Snapshot
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Distribucion referencial del usuario dentro del snapshot de reservas.
                </p>
                <div className="mt-4 space-y-3">
                  {myReserveItems.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-right font-bold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  {userReserveBreakdown.map((item) => (
                    <div key={item.label} className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-foreground">{item.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-foreground">{item.share}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-2">
                  {userReserveShare.map((item) => (
                    <div key={item.label} className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-3">
                      <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-xl font-black text-foreground">{item.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>

                <Button className="mt-5 w-full rounded-full">Generar comprobante</Button>
              </RendimientoCard>

              <RendimientoCard>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-primary">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-black text-foreground">Arbol Merkle</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Prueba de inclusion del usuario en el snapshot.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {userMerkleProof.map((item) => (
                    <div key={item.label} className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-3">
                      <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                      <p className="mt-1 break-all text-sm font-black text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  El comprobante no revela saldos de otros usuarios. El backend entregara proof path, leaf y snapshot firmado.
                </p>
              </RendimientoCard>
            </>
          ) : (
            <RendimientoCard>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Privado con login</p>
              <h2 className="mt-2 text-lg font-black text-foreground">Ve tu dinero en reservas</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Inicia sesion para ver tu distribucion crypto/fiat, porcentaje dentro de reservas y comprobante Merkle personal.
              </p>
              <div className="mt-4 grid gap-2">
                <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Incluye</p>
                  <p className="mt-1 text-sm font-black text-foreground">Saldo, porcentaje y Merkle</p>
                </div>
                <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Privacidad</p>
                  <p className="mt-1 text-sm font-black text-foreground">Solo tu cuenta</p>
                </div>
              </div>
              <Button className="mt-5 w-full rounded-full" onClick={() => setLoginOpen(true)}>
                Iniciar sesion
              </Button>
            </RendimientoCard>
          )}

          <RendimientoCard>
            <h2 className="text-lg font-black text-foreground">Documentos</h2>
            <div className="mt-4 grid gap-2">
              {proofLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="flex items-center gap-3 rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background px-3 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted/45"
                >
                  <link.icon className="h-4 w-4 text-primary" />
                  {link.title}
                </Link>
              ))}
            </div>
          </RendimientoCard>
        </aside>
      </div>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onRegisterClick={() => {
          setLoginOpen(false)
          setRegisterOpen(true)
        }}
      />
      <RegisterModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onLoginClick={() => {
          setRegisterOpen(false)
          setLoginOpen(true)
        }}
      />
    </div>
  )
}

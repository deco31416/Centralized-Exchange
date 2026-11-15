"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Copy, ExternalLink, Share2, ShieldCheck } from "lucide-react"

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
import { earnReferralStats, earnReferralUsers } from "./earn-data"

const REFERRAL_CODE = "DECO-EMB-31416"
const REFERRAL_URL = "https://deco.exchange/register?ref=DECO-EMB-31416"

type ReferralModal = "share" | "rules" | "payout" | null

export function EarnReferrals() {
  const [copied, setCopied] = React.useState(false)
  const [modal, setModal] = React.useState<ReferralModal>(null)

  async function copyReferral() {
    try {
      await navigator.clipboard.writeText(REFERRAL_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
      setModal("share")
    }
  }

  return (
    <div className="space-y-6">
      <EarnHero
        eyebrow="Ganar · Referidos"
        title="Invita y gana"
        description="Convierte tu comunidad en comisiones elegibles. Comparte tu enlace, acompaña la activacion y revisa cada recompensa antes del corte."
        aside={
          <EarnHeroStat
            label="Programa"
            value="Hasta 2 niveles"
            description="Modelo mock sujeto a verificacion, reglas y actividad valida."
          />
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {earnReferralStats.map((metric) => (
          <EarnMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <EarnPanel>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Enlace de embajador</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Comparte Deco con tu comunidad</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  El enlace es mockup conectable. Luego el backend entregara codigo, regla vigente, tracking y liquidacion real.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-full" onClick={copyReferral}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar enlace"}
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => setModal("share")}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[0.38fr_0.62fr]">
              <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Codigo</p>
                <p className="mt-2 break-all text-2xl font-black text-foreground">{REFERRAL_CODE}</p>
                <p className="mt-2 text-xs text-muted-foreground">Visible para campañas y QR futuro.</p>
              </div>
              <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">URL</p>
                <p className="mt-2 break-all text-sm font-bold text-foreground">{REFERRAL_URL}</p>
                <p className="mt-2 text-xs text-muted-foreground">Se reemplaza por enlace real del usuario autenticado.</p>
              </div>
            </div>
          </EarnPanel>

          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Invitados</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Actividad del programa</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Seguimiento mock de usuarios, primera operacion y recompensa estimada.
                </p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => setModal("rules")}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Ver reglas
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {earnReferralUsers.map((user) => (
                <div key={user.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr_0.75fr_0.75fr] md:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{user.id}</p>
                      <h3 className="mt-1 text-lg font-black text-foreground">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">Ingreso {user.joinedAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Volumen valido</p>
                      <p className="text-sm font-black text-foreground">{user.volume}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Recompensa</p>
                      <p className="text-sm font-black text-foreground">{user.reward}</p>
                    </div>
                    <div className="md:text-right">
                      <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </EarnPanel>
        </div>

        <div className="space-y-5">
          <EarnSummary eyebrow="Resumen" title="Liquidacion referidos">
            <EarnSummaryRow label="Estado" value="Elegible mock" />
            <EarnSummaryRow label="Corte" value="30 Jun 2026" />
            <EarnSummaryRow label="Moneda" value="USDT" />
            <EarnSummaryRow label="Validacion" value="KYC + actividad" />
            <Button className="mt-2 w-full rounded-full" onClick={() => setModal("payout")}>
              Solicitar cobro
            </Button>
          </EarnSummary>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Copy legal</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Comision elegible</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Las recompensas dependen de verificacion, primera operacion valida, reglas vigentes, region y controles antiabuso.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full rounded-full">
              <Link href="/legals/referidos">
                Ver legal de referidos
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </EarnPanel>
        </div>
      </div>

      <EarnModal
        open={modal === "share"}
        onClose={() => setModal(null)}
        title="Compartir invitacion"
        subtitle="Mensaje corto para enviar a tu comunidad."
        footer={
          <Button className="w-full rounded-full" onClick={copyReferral}>
            Copiar enlace
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4">
            <p className="text-sm leading-relaxed text-foreground">
              Unete a Deco Exchange con mi enlace y empieza a operar con una cuenta preparada para crypto, fiat y recompensas.
            </p>
          </div>
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Enlace</p>
            <p className="mt-2 break-all text-sm font-bold text-foreground">{REFERRAL_URL}</p>
          </div>
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "rules"}
        onClose={() => setModal(null)}
        title="Reglas de comision"
        subtitle="Condiciones mock para que el flujo sea claro antes de backend."
      >
        <div className="space-y-3">
          {[
            "El invitado debe completar verificacion requerida.",
            "La recompensa se calcula sobre actividad valida y no fraudulenta.",
            "El pago queda sujeto a corte, moneda disponible y revision regional.",
            "Deco puede pausar campanas si detecta abuso o actividad irregular.",
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
        subtitle="Mockup de confirmacion. Luego se conectara al gateway de usuario."
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Enviar solicitud mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Monto elegible" value="128.40 USDT" />
          <EarnSummaryRow label="Destino" value="Bolsillito USDT" />
          <EarnSummaryRow label="Revision" value="KYC + antiabuso" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Esta solicitud no ejecuta pago real. El backend definira monto final, estado y trazabilidad.
          </p>
        </div>
      </EarnModal>
    </div>
  )
}

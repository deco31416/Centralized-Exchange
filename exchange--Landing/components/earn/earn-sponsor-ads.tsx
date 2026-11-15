"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink, Megaphone, Send, ShieldCheck, Upload } from "lucide-react"

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
import { earnSponsorCampaigns, earnSponsorStats, type EarnSponsorCampaign } from "./earn-data"

type SponsorModal = "take" | "submit" | "rules" | null

export function EarnSponsorAds() {
  const [modal, setModal] = React.useState<SponsorModal>(null)
  const [selectedCampaign, setSelectedCampaign] = React.useState<EarnSponsorCampaign | null>(earnSponsorCampaigns[0] ?? null)

  function openCampaign(campaign: EarnSponsorCampaign, modalType: SponsorModal) {
    setSelectedCampaign(campaign)
    setModal(modalType)
  }

  return (
    <div className="space-y-6">
      <EarnHero
        eyebrow="Ganar · Sponsor Ads"
        title="Promociona y gana"
        description="Toma campanas aprobadas, comparte contenido con disclosure y envia evidencia para ganar tokens, puntos o recompensas segun revision."
        aside={
          <EarnHeroStat
            label="Embajador"
            value="4 campanas"
            description="Campanas mock para redes, comunidades, tutoriales y contenido educativo."
          />
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {earnSponsorStats.map((metric) => (
          <EarnMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <EarnPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Campanas</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Promociona con reglas claras</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Sponsor Ads se vuelve ganancia para usuarios creadores, no solo producto B2B. Cada campana exige canal, evidencia y revision.
                </p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => setModal("rules")}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Reglas
              </Button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {earnSponsorCampaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
                      <Megaphone className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {campaign.status}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">{campaign.id}</p>
                  <h3 className="mt-1 text-xl font-black text-foreground">{campaign.title}</h3>
                  <p className="mt-1 text-sm font-bold text-muted-foreground">{campaign.channel}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{campaign.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Recompensa</p>
                      <p className="text-sm font-black text-foreground">{campaign.reward}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Requisito</p>
                      <p className="text-sm font-black text-foreground">{campaign.requirement}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className="rounded-full" onClick={() => openCampaign(campaign, "take")}>
                      <Megaphone className="mr-2 h-4 w-4" />
                      Tomar
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => openCampaign(campaign, "submit")}>
                      Enviar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </EarnPanel>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Flujo creador</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Toma, publica, valida</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              La experiencia queda lista para conectar metricas reales: URL, canal, impresiones, clics, aprobacion y recompensa.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {["Campana aprobada", "Contenido publicado", "Revision y pago"].map((step, index) => (
                <div key={step} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">0{index + 1}</p>
                  <p className="mt-2 text-sm font-black text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </EarnPanel>
        </div>

        <div className="space-y-5">
          <EarnSummary eyebrow="Resumen" title="Estado creador">
            <EarnSummaryRow label="Campanas tomadas" value="3" />
            <EarnSummaryRow label="Contenido aprobado" value="2" />
            <EarnSummaryRow label="Pendiente" value="75 DECO" />
            <EarnSummaryRow label="Siguiente pago" value="30 Jun" />
            <Button className="mt-2 w-full rounded-full" onClick={() => openCampaign(earnSponsorCampaigns[0], "submit")}>
              Enviar publicacion
            </Button>
          </EarnSummary>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Base legal</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Promocion responsable</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sin spam, sin promesas falsas y con disclosure. El usuario gana solo por campanas validas.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full rounded-full">
              <Link href="/legals/sponsor-ads">
                Ver Sponsor Ads
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </EarnPanel>
        </div>
      </div>

      <EarnModal
        open={modal === "take"}
        onClose={() => setModal(null)}
        title="Tomar campana"
        subtitle={selectedCampaign ? selectedCampaign.title : "Campana seleccionada"}
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal("submit")}>
            Tomar campana mock
          </Button>
        }
      >
        <div className="space-y-3">
          <EarnSummaryRow label="Canal" value={selectedCampaign?.channel ?? "Red social"} />
          <EarnSummaryRow label="Recompensa" value={selectedCampaign?.reward ?? "Variable"} />
          <EarnSummaryRow label="Requisito" value={selectedCampaign?.requirement ?? "Evidencia"} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Al tomar una campana, el usuario acepta reglas de contenido, disclosure y revision antiabuso.
          </p>
        </div>
      </EarnModal>

      <EarnModal
        open={modal === "submit"}
        onClose={() => setModal(null)}
        title="Enviar publicacion"
        subtitle={selectedCampaign ? selectedCampaign.title : "Campana seleccionada"}
        footer={
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            Enviar evidencia mock
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Upload className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-black text-foreground">URL o evidencia</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Campo mock para publicar enlace, captura o identificador del contenido.
                </p>
              </div>
            </div>
          </div>
          <EarnSummaryRow label="Canal" value={selectedCampaign?.channel ?? "Red social"} />
          <EarnSummaryRow label="Revision" value="Manual + metricas" />
          <EarnSummaryRow label="Pago" value={selectedCampaign?.reward ?? "Variable"} />
          <div className="rounded-full border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
            https://red-social.com/post/deco-demo
          </div>
        </div>
      </EarnModal>

      <EarnModal open={modal === "rules"} onClose={() => setModal(null)} title="Reglas Sponsor Ads">
        <div className="space-y-3">
          {[
            "El contenido debe declarar que es promocion o campana cuando aplique.",
            "No se permiten promesas de rentabilidad, garantia, aprobacion o precio futuro.",
            "Spam, contenido enganoso o metricas falsas cancelan la recompensa.",
            "La recompensa final depende de campana, canal, region, evidencia y revision.",
          ].map((rule) => (
            <div key={rule} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-card p-4 text-sm text-muted-foreground">
              {rule}
            </div>
          ))}
          <Button className="w-full rounded-full" onClick={() => setModal(null)}>
            <Send className="mr-2 h-4 w-4" />
            Entendido
          </Button>
        </div>
      </EarnModal>
    </div>
  )
}

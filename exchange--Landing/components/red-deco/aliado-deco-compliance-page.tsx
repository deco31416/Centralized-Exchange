import { AlertTriangle, FileLock2, LockKeyhole, ShieldCheck } from "lucide-react"

import { AliadoDecoDashboardNav } from "./aliado-deco-dashboard-page"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  aliadoDecoComplianceRules,
  aliadoDecoPartnerLevels,
  aliadoDecoSecureForms,
} from "./red-deco-data"
import {
  RedDecoControlCard,
  RedDecoHero,
  RedDecoPanel,
  RedDecoStat,
  RedDecoSummaryRow,
} from "./red-deco-components"

const complianceMetrics = [
  { label: "KYC/KYB", value: "Nivel 3", detail: "Comercio aliado habilitado", icon: ShieldCheck },
  { label: "Formularios", value: "2", detail: "Plantillas seguras mock", icon: FileLock2 },
  { label: "Retencion", value: "30 dias", detail: "Politica referencial", icon: LockKeyhole },
  { label: "Riesgo", value: "Normal", detail: "Sin bloqueo operativo", icon: AlertTriangle },
]

export function AliadoDecoCompliancePage() {
  return (
    <div className="space-y-6">
      <RedDecoHero
        eyebrow="Aliado Deco · Cumplimiento"
        title="Operar con reglas claras"
        description="Define permisos, manejo de datos sensibles, formularios seguros y requisitos por nivel antes de conectar KYC, KYB y motor de riesgo."
        actionHref="/earn/aliado-deco/dashboard"
        actionText="Volver al dashboard"
        secondaryHref="/earn/aliado-deco/reports"
        secondaryText="Ver reportes"
        aside={<RedDecoStat label="Estado" value="Mock" detail="Listo para conectar compliance, auditoria, casos y almacenamiento seguro." />}
      />

      <AliadoDecoDashboardNav view="compliance" />

      <div className="grid gap-3 md:grid-cols-4">
        {complianceMetrics.map((metric) => {
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

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <RedDecoPanel>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Permisos</p>
          <h2 className="mt-2 text-2xl font-black text-foreground">Requisitos por nivel</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            El aliado no ve todos los productos desde el inicio. Permisos, limites y servicios suben con verificacion e historial.
          </p>
          <div className="mt-5 space-y-3">
            {aliadoDecoPartnerLevels.map((level) => (
              <article key={level.level} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Nivel {level.level}</p>
                    <h3 className="mt-1 text-lg font-black text-foreground">{level.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{level.profile}</p>
                  </div>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                    {level.limit}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{level.permissions}</p>
              </article>
            ))}
          </div>
        </RedDecoPanel>

        <div className="space-y-5">
          <RedDecoPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Datos sensibles</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Reglas operativas</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {aliadoDecoComplianceRules.map((rule) => (
                <article key={rule.title} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <h3 className="text-sm font-black text-foreground">{rule.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rule.detail}</p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-primary">{rule.status}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </RedDecoPanel>

          <RedDecoPanel>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Formulario seguro</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Solicitudes controladas</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Cuando el aliado necesita soporte fiscal o validacion adicional, la solicitud nace como caso trazable.
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-full font-black">Crear solicitud</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Solicitud segura mock</DialogTitle>
                    <DialogDescription>
                      Este flujo prepara un caso trazable antes de conectar almacenamiento seguro, KYC/KYB y auditoria.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <RedDecoSummaryRow label="Tipo" value="Soporte fiscal adicional" />
                    <RedDecoSummaryRow label="Campos" value="Motivo, orden, comprobante y consentimiento" />
                    <RedDecoSummaryRow label="Retencion" value="30 dias o politica vigente" />
                    <RedDecoSummaryRow label="Estado" value="Borrador frontend" />
                  </div>
                  <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-muted/35 p-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Los documentos sensibles no se piden por chat. Cuando el backend este listo, esta accion creara un
                      formulario ligado a la orden, con permisos por rol y registro de acceso.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {aliadoDecoSecureForms.map((form) => (
                <article key={form.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{form.id}</p>
                  <h3 className="mt-1 text-lg font-black text-foreground">{form.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{form.requester}</p>
                  <div className="mt-4 grid gap-2">
                    <RedDecoSummaryRow label="Campos" value={form.fields} />
                    <RedDecoSummaryRow label="Retencion" value={form.retention} />
                    <RedDecoSummaryRow label="Estado" value={form.status} />
                  </div>
                </article>
              ))}
            </div>
          </RedDecoPanel>
        </div>
      </div>
    </div>
  )
}

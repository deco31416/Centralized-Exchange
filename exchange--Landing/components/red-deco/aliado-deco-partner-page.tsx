import { ArrowRight } from "lucide-react"

import {
  aliadoDecoOrders,
  aliadoDecoPartnerBenefits,
  aliadoDecoPartnerLevels,
} from "./red-deco-data"
import {
  RedDecoControlCard,
  RedDecoHero,
  RedDecoPanel,
  RedDecoStat,
  RedDecoSummaryRow,
} from "./red-deco-components"

export function AliadoDecoPartnerPage() {
  return (
    <div className="space-y-6">
      <RedDecoHero
        eyebrow="Ganar · Aliado Deco"
        title="Opera como Aliado Deco"
        description="Atiende depositos, retiros y remesas desde tu comercio o cuenta verificada. Deco guia la operacion, calcula la tasa y genera registros para control fiscal."
        actionHref="/earn/aliado-deco/apply"
        actionText="Solicitar activacion"
        secondaryHref="/earn/aliado-deco/dashboard"
        secondaryText="Ver consola"
        aside={<RedDecoStat label="Modelo aliado" value="Fee + volumen" detail="Comisiones por operacion, bonos y rutas elegibles." />}
      />

      <div className="grid gap-3 md:grid-cols-4">
        {aliadoDecoPartnerBenefits.map((benefit) => {
          const Icon = benefit.icon
          return <RedDecoControlCard key={benefit.label} icon={<Icon className="h-4 w-4" />} label={benefit.label} value={benefit.value} />
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <RedDecoPanel>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Niveles</p>
          <h2 className="mt-2 text-2xl font-black text-foreground">Permisos por verificacion</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cada nivel abre limites y servicios. Las remesas internacionales viven en comercio, empresa o mesa profesional.
          </p>
          <div className="mt-5 space-y-3">
            {aliadoDecoPartnerLevels.map((level) => (
              <article key={level.level} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                <div className="grid gap-4 md:grid-cols-[44px_1fr]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card font-mono text-xs font-black tracking-[0.12em] text-primary">
                    {level.level}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-foreground">{level.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{level.profile}</p>
                    <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-[1fr_auto]">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Permite</p>
                        <p className="mt-1 text-sm font-black leading-snug text-foreground">{level.permissions}</p>
                      </div>
                      <div className="min-w-0 sm:text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Limite</p>
                        <p className="mt-1 text-sm font-black leading-snug text-foreground">{level.limit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </RedDecoPanel>

        <RedDecoPanel>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Consola mock</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Operaciones del punto</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                El aliado solo confirma pasos. Deco calcula monto, fee, tasa, QR y comprobante.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {aliadoDecoOrders.map((order) => (
              <article key={order.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{order.id}</p>
                    <h3 className="mt-1 text-lg font-black text-foreground">{order.type}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{order.user}</p>
                  </div>
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">{order.status}</span>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ["Monto", order.amount],
                      ["Resultado", order.result],
                      ["Comision", order.commission],
                      ["Tiempo", order.timer],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                        <p className="mt-1 break-words text-sm font-black leading-snug text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="mt-4 inline-flex items-center gap-2 text-sm font-black text-foreground">
                  Revisar operacion
                  <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </RedDecoPanel>
      </div>

      <RedDecoPanel className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Cumplimiento</p>
          <h2 className="mt-2 text-2xl font-black text-foreground">Declaracion lista</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cada orden conserva codigo, contraparte permitida, monto, fee, comision, ruta, comprobante y estado para reportes.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <RedDecoSummaryRow label="Exportables" value="PDF / CSV" />
          <RedDecoSummaryRow label="Chat" value="Seguro" />
          <RedDecoSummaryRow label="Formularios" value="Auditados" />
          <RedDecoSummaryRow label="AML" value="Por corredor" />
        </div>
      </RedDecoPanel>
    </div>
  )
}

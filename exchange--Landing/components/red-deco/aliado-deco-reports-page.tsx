import { Download, FileSpreadsheet, FileText, ReceiptText } from "lucide-react"

import { AliadoDecoDashboardNav } from "./aliado-deco-dashboard-page"
import {
  aliadoDecoExportFiles,
  aliadoDecoFiscalSummary,
  aliadoDecoReportRecords,
} from "./red-deco-data"
import {
  RedDecoControlCard,
  RedDecoHero,
  RedDecoPanel,
  RedDecoStat,
  RedDecoSummaryRow,
} from "./red-deco-components"

export function AliadoDecoReportsPage() {
  return (
    <div className="space-y-6">
      <RedDecoHero
        eyebrow="Aliado Deco · Reportes"
        title="Reportes fiscales"
        description="Consulta operaciones conciliadas, comisiones, contrapartes y exportables mock para preparar declaracion y soporte contable."
        actionHref="/earn/aliado-deco/dashboard"
        actionText="Volver al dashboard"
        secondaryHref="/earn/aliado-deco/compliance"
        secondaryText="Ver cumplimiento"
        aside={<RedDecoStat label="Periodo" value="Junio" detail="Resumen mock hasta conectar ledger, impuestos y motor fiscal." />}
      />

      <AliadoDecoDashboardNav view="reports" />

      <div className="grid gap-3 md:grid-cols-4">
        {aliadoDecoFiscalSummary.map((item) => (
          <RedDecoControlCard
            key={item.label}
            icon={<ReceiptText className="h-4 w-4" />}
            label={item.label}
            value={`${item.value} · ${item.detail}`}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <RedDecoPanel>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Ledger</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Operaciones conciliadas</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Cada fila conserva fecha, contraparte resumida, servicio, monto, comision y base fiscal.
              </p>
            </div>
            <span className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-black text-muted-foreground">
              {aliadoDecoReportRecords.length} registros
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-[calc(var(--radius)-0.55rem)] border border-border">
            <div className="hidden grid-cols-[0.8fr_0.9fr_1fr_0.8fr_0.8fr_1fr_0.8fr] gap-3 border-b border-border bg-background px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground lg:grid">
              <span>ID</span>
              <span>Fecha</span>
              <span>Contraparte</span>
              <span>Servicio</span>
              <span>Monto</span>
              <span>Base</span>
              <span>Estado</span>
            </div>
            <div className="divide-y divide-border">
              {aliadoDecoReportRecords.map((record) => (
                <article
                  key={record.id}
                  className="grid gap-3 bg-card/50 p-4 lg:grid-cols-[0.8fr_0.9fr_1fr_0.8fr_0.8fr_1fr_0.8fr] lg:items-center"
                >
                  <p className="text-sm font-black text-foreground">{record.id}</p>
                  <p className="text-sm text-muted-foreground">{record.date}</p>
                  <p className="text-sm font-bold text-foreground">{record.counterparty}</p>
                  <p className="text-sm text-muted-foreground">{record.service}</p>
                  <p className="text-sm font-black text-foreground">{record.amount}</p>
                  <p className="text-sm text-muted-foreground">{record.taxBase}</p>
                  <span className="w-fit rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground">
                    {record.status}
                  </span>
                  <div className="grid gap-2 lg:hidden">
                    <RedDecoSummaryRow label="Comision" value={record.commission} />
                    <RedDecoSummaryRow label="Base fiscal" value={record.taxBase} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </RedDecoPanel>

        <div className="space-y-5">
          <RedDecoPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Exportables</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">PDF y CSV mock</h2>
            <div className="mt-4 space-y-3">
              {aliadoDecoExportFiles.map((file) => {
                const Icon = file.format === "PDF" ? FileText : FileSpreadsheet
                return (
                  <div key={file.name} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black text-foreground">{file.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {file.format} · {file.period}
                        </p>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">{file.status}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </RedDecoPanel>

          <RedDecoPanel>
            <div className="flex items-start gap-3">
              <Download className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Privacidad</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">Sin datos expuestos</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  El reporte publico usa alias, niveles y comprobantes resumidos. Datos sensibles se solicitan solo desde formularios seguros.
                </p>
              </div>
            </div>
          </RedDecoPanel>
        </div>
      </div>
    </div>
  )
}

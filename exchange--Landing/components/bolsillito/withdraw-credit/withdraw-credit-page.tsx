"use client"

import { Banknote, Building2, CheckCircle2, Landmark, Wallet } from "lucide-react"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import { Button } from "@/components/ui/button"

const methods = [
  { title: "Cuenta bancaria", detail: "Retira a una cuenta registrada.", icon: Landmark },
  { title: "Medio digital", detail: "Envio a proveedor disponible.", icon: Wallet },
  { title: "Punto de retiro", detail: "Retiro por red aliada habilitada.", icon: Building2 },
]

function WithdrawalMethod({ title, detail, icon: Icon }: (typeof methods)[number]) {
  return (
    <button className="flex items-start gap-4 rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card/90 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/45 dark:bg-white/[0.035]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-base font-bold text-foreground">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{detail}</span>
      </span>
    </button>
  )
}

export default function WithdrawCreditPage() {
  return (
    <ActionPageShell>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Bolsillito</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Retira saldo</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Retira saldo de tu Bolsillito a medios disponibles segun moneda, pais y nivel de cuenta.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {methods.map((method) => (
              <WithdrawalMethod key={method.title} {...method} />
            ))}
          </div>

          <div className="mt-6 rounded-[var(--radius)] border border-border bg-card/90 p-6 dark:bg-white/[0.035]">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">Moneda</span>
                <select className="h-12 w-full rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background px-4 text-sm outline-none focus:border-primary">
                  <option>COP</option>
                  <option>USD</option>
                  <option>MXN</option>
                  <option>PEN</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">Monto a retirar</span>
                <input
                  inputMode="decimal"
                  placeholder="0.00"
                  className="h-12 w-full rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <Button className="mt-5 h-12 w-full rounded-full text-sm font-bold">
              <Banknote className="h-4 w-4" />
              Solicitar retiro
            </Button>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
            <h2 className="text-sm font-bold text-foreground">Antes de retirar</h2>
            <div className="mt-4 space-y-3">
              {["Verifica el titular del medio", "Confirma moneda y comision", "Firma la solicitud con seguridad"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Disponible</p>
            <p className="mt-2 text-3xl font-black text-foreground">$0.00</p>
            <p className="mt-1 text-sm text-muted-foreground">Saldo fiat estimado para retiro.</p>
          </div>
        </aside>
      </main>
    </ActionPageShell>
  )
}

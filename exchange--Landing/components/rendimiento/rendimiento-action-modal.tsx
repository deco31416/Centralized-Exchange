"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type RendimientoActionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  eyebrow: string
  title: string
  description: string
  asset: string
  minimum: string
  estimate: string
  liquidity: string
  risk: string
  fee: string
  ctaLabel: string
}

export function RendimientoActionModal({
  open,
  onOpenChange,
  eyebrow,
  title,
  description,
  asset,
  minimum,
  estimate,
  liquidity,
  risk,
  fee,
  ctaLabel,
}: RendimientoActionModalProps) {
  const [accepted, setAccepted] = React.useState(false)
  const [amount, setAmount] = React.useState(minimum.split(" ")[0] ?? "")

  React.useEffect(() => {
    if (open) {
      setAccepted(false)
      setAmount(minimum.split(" ")[0] ?? "")
    }
  }, [minimum, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[var(--radius)] border-border bg-background p-0">
        <div className="border-b border-border p-5 md:p-6">
          <DialogHeader>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
            <DialogTitle className="text-2xl font-black tracking-normal text-foreground">{title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">{description}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[0.9fr_1.1fr] md:p-6">
          <div>
            <label className="block">
              <span className="text-sm font-bold text-foreground">Monto a simular</span>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  className="rounded-full"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
                <span className="rounded-full border border-border bg-muted px-3 py-2 text-sm font-bold text-muted-foreground">
                  {asset}
                </span>
              </div>
            </label>

            <div className="mt-4 rounded-[var(--radius)] border border-border bg-card/70 p-4 dark:bg-white/[0.035]">
              <p className="text-sm font-bold text-foreground">Antes de continuar</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Esta accion es un mockup de experiencia. La activacion real dependera de KYC, pais, liquidez, condiciones vigentes y backend.
              </p>
              <Link href="/legals/risks" className="mt-3 inline-flex text-sm font-bold text-primary hover:underline">
                Revisar riesgos
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              { label: "Minimo", value: minimum },
              { label: "Estimacion", value: estimate },
              { label: "Liquidez", value: liquidity },
              { label: "Comision", value: fee },
              { label: "Riesgo", value: risk },
              { label: "Disponibilidad", value: "Pais y KYC" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-card/70 px-4 py-3 dark:bg-white/[0.035]">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <strong className="text-right text-sm text-foreground">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border p-5 md:p-6">
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <Checkbox checked={accepted} onCheckedChange={(value) => setAccepted(value === true)} />
            <span>
              Entiendo que el rendimiento es estimado, variable y sujeto a disponibilidad, condiciones del producto y aprobacion operativa.
            </span>
          </label>

          <DialogFooter className="mt-5 gap-2 sm:space-x-0">
            <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="rounded-full" disabled={!accepted} onClick={() => onOpenChange(false)}>
              {ctaLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

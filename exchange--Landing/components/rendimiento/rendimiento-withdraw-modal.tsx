"use client"

import * as React from "react"

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

import type { RendimientoPosition } from "./rendimiento-data"

type RendimientoWithdrawModalProps = {
  position: RendimientoPosition | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RendimientoWithdrawModal({ position, open, onOpenChange }: RendimientoWithdrawModalProps) {
  const [accepted, setAccepted] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setAccepted(false)
    }
  }, [open])

  if (!position) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[var(--radius)] border-border bg-background p-0">
        <div className="border-b border-border p-5 md:p-6">
          <DialogHeader>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Retiro flexible</p>
            <DialogTitle className="text-2xl font-black tracking-normal text-foreground">{position.product}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Revisa tiempo, comision y efecto sobre la posicion antes de solicitar el retiro.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-3 p-5 md:p-6">
          {[
            { label: "Monto", value: position.amount },
            { label: "Modalidad", value: position.mode },
            { label: "Disponibilidad", value: position.nextStep },
            { label: "Comision", value: position.fee },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-card/70 px-4 py-3 dark:bg-white/[0.035]">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <strong className="text-right text-sm text-foreground">{item.value}</strong>
            </div>
          ))}

          <div className="rounded-[var(--radius)] border border-border bg-card/70 p-4 dark:bg-white/[0.035]">
            <p className="text-sm font-bold text-foreground">Impacto estimado</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Al retirar, la posicion deja de participar en nuevas proyecciones. El saldo final puede variar por red, comisiones y disponibilidad operativa.
            </p>
          </div>
        </div>

        <div className="border-t border-border p-5 md:p-6">
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <Checkbox checked={accepted} onCheckedChange={(value) => setAccepted(value === true)} />
            <span>Entiendo que el retiro puede tener tiempos, comisiones y condiciones variables.</span>
          </label>
          <DialogFooter className="mt-5 gap-2 sm:space-x-0">
            <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="rounded-full" disabled={!accepted} onClick={() => onOpenChange(false)}>
              Solicitar retiro
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

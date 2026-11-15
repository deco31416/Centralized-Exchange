"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export function StepStart({
  onSelect,
}: {
  onSelect: (provider: "email" | "google" | "apple" | "telegram") => void
}) {
  const [accepted, setAccepted] = useState(false)
  const { toast } = useToast()

  const handleContinue = (provider: "email" | "google" | "apple" | "telegram") => {
    if (!accepted) {
      toast({
        title: "Consentimiento requerido",
        description: "Debes aceptar los terminos y politicas  para continuar.",
        variant: "neutral",
        action: <ToastAction altText="Entendido">Entendido</ToastAction>,
      })
      return
    }

    onSelect(provider)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Te damos la bienvenida</h2>

      <Button className="w-full" onClick={() => handleContinue("email")}>
        Correo o número de teléfono
      </Button>

      <div className="flex items-start gap-2 pt-2 text-sm">
        <Checkbox
          id="terms"
          checked={accepted}
          onCheckedChange={(val) => setAccepted(val === true)}
        />
        <Label htmlFor="terms" className="text-xs leading-snug text-muted-foreground">
          Al crear una cuenta, declaro que acepto los{" "}
          <a href="/terms" className="underline">
            Términos de servicio
          </a>{" "}
          y las{" "}
          <a href="/privacy" className="underline">
            Políticas de privacidad
          </a>{" "}
          de deco-exchange.
        </Label>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import type { OnboardingStepProps } from "./types"

export function StepTerms({ data, update, onNext, onBack }: OnboardingStepProps) {
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const allAccepted =
      data.acceptAge &&
      data.acceptPrivacy &&
      data.acceptLegalFunds &&
      data.acceptRisk

    if (!allAccepted) {
      toast({
        title: "Faltan consentimientos",
        description: "Debes aceptar todas las casillas para continuar.",
        variant: "neutral",
        action: <ToastAction altText="Entendido">Entendido</ToastAction>,
      })
      return
    }

    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-center">Términos y condiciones</h2>

      <div className="flex items-start gap-2">
        <Checkbox
          id="age"
          checked={data.acceptAge}
          onCheckedChange={(v) => update("acceptAge", v === true)}
        />
        <Label htmlFor="age" className="text-sm leading-snug text-muted-foreground">
          Declaro que soy mayor de 18 años y tengo plena capacidad legal para contratar con deco-exchange.
        </Label>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="privacy"
          checked={data.acceptPrivacy}
          onCheckedChange={(v) => update("acceptPrivacy", v === true)}
        />
        <Label htmlFor="privacy" className="text-sm leading-snug text-muted-foreground">
          Autorizo el{" "}
          <a href="/privacy" target="_blank" className="underline">tratamiento de mis datos personales</a>.
        </Label>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="funds"
          checked={data.acceptLegalFunds}
          onCheckedChange={(v) => update("acceptLegalFunds", v === true)}
        />
        <Label htmlFor="funds" className="text-sm leading-snug text-muted-foreground">
          Declaro que los fondos que utilizo provienen de operaciones legales y son transables según la normativa de mi país.
        </Label>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="risk"
          checked={data.acceptRisk}
          onCheckedChange={(v) => update("acceptRisk", v === true)}
        />
        <Label htmlFor="risk" className="text-sm leading-snug text-muted-foreground">
          Acepto las{" "}
          <a href="/risk-policy" target="_blank" className="underline">políticas de riesgo financiero</a> y comprendo que puedo perder parte o la totalidad de mis fondos al operar en deco-exchange.
        </Label>
      </div>

      <div className="flex justify-between gap-2 pt-4">
        <Button type="button" onClick={onBack} variant="outline" className="w-full">
          Atrás
        </Button>
        <Button type="submit" className="w-full">
          Siguiente
        </Button>
      </div>
    </form>
  )
}

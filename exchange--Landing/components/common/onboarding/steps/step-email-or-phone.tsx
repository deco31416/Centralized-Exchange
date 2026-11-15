"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { OnboardingStepProps } from "./types"

type StepEmailOrPhoneProps = Pick<OnboardingStepProps, "data" | "update" | "onNext">

export function StepEmailOrPhone({ data, update, onNext }: StepEmailOrPhoneProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.email) return alert("Correo requerido")
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-center">Crea tu cuenta en deco-exchange</h2>
      <div className="space-y-2">
        <Label htmlFor="email">Correo o número de teléfono</Label>
        <Input
          id="email"
          type="text"
          placeholder="correo@ejemplo.com"
          value={data.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">Siguiente</Button>
    </form>
  )
}

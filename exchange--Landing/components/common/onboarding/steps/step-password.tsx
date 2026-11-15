"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import type { OnboardingStepProps } from "./types"

/**
 * Calcula fortaleza de contraseña: 0-4.
 * Los caracteres especiales válidos son EXACTAMENTE los que acepta el backend:
 * @ $ ! % * ? &
 */
function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  // Solo @ $ ! % * ? & son aceptados por el backend
  if (/[@$!%*?&]/.test(password)) score++
  return Math.min(4, score)
}

const STRENGTH_LABELS = ["", "Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"]
const STRENGTH_COLORS = [
  "",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-400",
  "bg-emerald-400",
  "bg-green-500",
]
const STRENGTH_TEXT_COLORS = [
  "",
  "text-red-500",
  "text-orange-500",
  "text-yellow-500",
  "text-emerald-400",
  "text-green-500",
]

export function StepPassword({ data, update, onNext, onBack }: OnboardingStepProps) {
  const { toast } = useToast()
  const strength = getPasswordStrength(data.password || "")
  const passwordsMatch = data.password && data.confirmPassword && data.password === data.confirmPassword

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!data.password || !data.confirmPassword) {
      toast({
        title: "Contraseña requerida",
        description: "Debes completar ambos campos de contraseña para continuar.",
        variant: "neutral",
        action: <ToastAction altText="Entendido">Entendido</ToastAction>,
      })
      return
    }

    if (data.password !== data.confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Verifica que ambas contraseñas sean iguales.",
        variant: "destructive",
        action: <ToastAction altText="Entendido">Entendido</ToastAction>,
      })
      return
    }

    if (strength < 3) {
      toast({
        title: "Contraseña muy débil",
        description: "Usa al menos 8 caracteres, mayúsculas, números y un símbolo.",
        variant: "destructive",
        action: <ToastAction altText="Entendido">Entendido</ToastAction>,
      })
      return
    }

    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-center">Crea tu contraseña</h2>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={data.password}
          onChange={(e) => update("password", e.target.value)}
        />

        {/* Barra de fortaleza */}
        {data.password ? (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    strength >= level ? STRENGTH_COLORS[strength] : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${STRENGTH_TEXT_COLORS[strength]}`}>
              {STRENGTH_LABELS[strength]}
              {strength < 3 && (
                <span className="text-muted-foreground font-normal ml-1">
                  — Usa mayúsculas, números y un símbolo
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Símbolos permitidos: <span className="font-mono font-semibold tracking-widest">@ $ ! % * ? &</span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={data.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          className={
            data.confirmPassword
              ? passwordsMatch
                ? "border-green-500 focus-visible:ring-green-500"
                : "border-red-500 focus-visible:ring-red-500"
              : ""
          }
        />
        {data.confirmPassword && !passwordsMatch && (
          <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
        )}
        {data.confirmPassword && passwordsMatch && (
          <p className="text-xs text-green-500">✓ Las contraseñas coinciden</p>
        )}
      </div>

      <div className="flex justify-between gap-2 pt-2">
        <Button type="button" onClick={onBack} variant="outline" className="w-full">Atrás</Button>
        <Button type="submit" className="w-full">Siguiente</Button>
      </div>
    </form>
  )
}

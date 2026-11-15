"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { BrandLogo } from "@/components/common/brand-logo"

import { StepStart } from "./step-start"
import { StepEmailOrPhone } from "./step-email-or-phone"
import { StepPassword } from "./step-password"
import { StepTerms } from "./step-terms"
// import { StepSocial } from "./step-social"
import { StepLegalAgreement } from "./step-legal-agreement"
import { StepSuccess } from "./step-success"
import type { OnboardingFormData } from "./types"

interface RegisterStepperModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginClick?: () => void
}

export function RegisterStepperModal({ open, onOpenChange, onLoginClick }: RegisterStepperModalProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<number | null>(null)
  const [flow, setFlow] = useState<"start" | "email" | "done">("start")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<OnboardingFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  const nextStep = () => setStep((prev) => prev !== null ? Math.min(prev + 1, steps.length - 1) : 0)
  const prevStep = () => setStep((prev) => prev !== null ? Math.max(prev - 1, 0) : 0)
  const updateField = (key: keyof OnboardingFormData, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  /**
   * Llamada real a `/api/auth/register` al aceptar el acuerdo legal (último paso).
   * Si el registro es exitoso, avanza a StepSuccess.
   * Si falla, muestra el error vía toast sin cambiar el paso.
   */
  const handleRegisterAndNext = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        credentials: "include",
      })
      const data = await res.json()

      if (res.ok) {
        nextStep()
      } else {
        // NestJS ValidationPipe devuelve message como array; otros errores como string
        const rawMsg = data?.message || data?.error || "Error al registrar la cuenta"
        const msg = Array.isArray(rawMsg)
          ? rawMsg.join(" / ")
          : typeof rawMsg === "string"
            ? rawMsg
            : "Inténtalo de nuevo"
        toast({
          title: "Error al registrarse",
          description: msg,
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo completar el registro. Verifica tu conexión.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    <StepEmailOrPhone
      key="email"
      data={formData}
      update={updateField}
      onNext={nextStep}
    />,
    <StepPassword
      key="password"
      data={formData}
      update={updateField}
      onNext={nextStep}
      onBack={prevStep}
    />,
    <StepTerms
      key="terms"
      data={formData}
      update={updateField}
      onNext={nextStep}
      onBack={prevStep}
    />,
    // <StepSocial
    //   key="social"
    //   onNext={nextStep}
    //   onBack={prevStep}
    // />,
    <StepLegalAgreement
      key="jurisdiction"
      data={formData}
      update={updateField}
      onNext={handleRegisterAndNext}
      onBack={prevStep}
      isSubmitting={isSubmitting}
    />,
    <StepSuccess key="success" onLoginClick={onLoginClick ? () => { onOpenChange(false); onLoginClick() } : undefined} />,
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-full sm:max-w-[460px]">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo variant="name" priority />
          </div>
          <DialogTitle className="text-xl">Registrarse</DialogTitle>
          <DialogDescription className="sr-only">
            Completa el formulario de registro para crear tu cuenta en deco-exchange.
          </DialogDescription>
        </DialogHeader>

        {flow === "start" && (
          <StepStart
            onSelect={(option) => {
              if (option === "email") {
                setFlow("email")
                setStep(0)
              } else {
                toast({
                  title: "Próximamente",
                  description: "El acceso con Google, Apple y Telegram estará disponible próximamente.",
                })
              }
            }}
          />
        )}

        {flow === "email" && typeof step === "number" && steps[step]}
      </DialogContent>
    </Dialog>

  )
}

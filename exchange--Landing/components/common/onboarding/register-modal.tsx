"use client"

import { RegisterStepperModal } from "./steps/register-stepper-modal"

interface RegisterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginClick?: () => void
}

export function RegisterModal({ open, onOpenChange, onLoginClick }: RegisterModalProps) {
  return (
    <RegisterStepperModal open={open} onOpenChange={onOpenChange} onLoginClick={onLoginClick} />
  )
}

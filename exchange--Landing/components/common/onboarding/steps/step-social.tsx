"use client"

import { Apple, Chrome, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

import { SharePreviewCard } from "./share-preview-card"

interface StepSocialProps {
  onNext: () => void
  onBack: () => void
}

export function StepSocial({ onNext, onBack }: StepSocialProps) {
  return (
    <div className="space-y-4">
      <SharePreviewCard />
      <h2 className="text-xl font-bold text-center">También puedes registrarte con</h2>
      <div className="grid gap-2">
        <Button type="button" variant="outline" className="w-full">
          <Chrome className="mr-2 h-5 w-5" />
          Google
        </Button>
        <Button type="button" variant="outline" className="w-full">
          <Apple className="mr-2 h-5 w-5" />
          Apple
        </Button>
        <Button type="button" variant="outline" className="w-full">
          <Send className="mr-2 h-5 w-5" />
          Telegram
        </Button>
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <Button type="button" onClick={onBack} variant="outline" className="w-full">Atrás</Button>
        <Button type="button" onClick={onNext} className="w-full">Finalizar</Button>
      </div>
    </div>
  )
}

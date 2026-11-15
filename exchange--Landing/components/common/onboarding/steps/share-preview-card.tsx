"use client"

import Image from "next/image"
import { Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"

const SHARE_CARD_IMAGE =
  "https://res.cloudinary.com/deco31416/image/upload/v1781990693/Frame_1116606613_op22k1.png"
const FALLBACK_SHARE_URL = "https://deco31416.com"

export function SharePreviewCard() {
  const handleShare = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.origin : FALLBACK_SHARE_URL
      const shareData = {
        title: "deco-exchange",
        text: "Explora deco-exchange, realizado por DECO31416.",
        url,
      }

      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData)
        return
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      // El usuario puede cancelar el share nativo; no necesita ruido visual.
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Image
        src={SHARE_CARD_IMAGE}
        alt="Card oficial para compartir deco-exchange"
        width={1200}
        height={630}
        className="aspect-[1.91/1] w-full object-cover"
        priority
      />
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Comparte deco-exchange</p>
          <p className="text-xs text-muted-foreground">Card oficial realizada por DECO31416.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleShare} className="shrink-0">
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      </div>
    </div>
  )
}

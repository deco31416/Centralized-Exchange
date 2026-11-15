"use client"

import React from "react"
import Image from "next/image"
import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons"

interface CurrencyIconProps {
  currency: string
  size?: number
}

export default function CurrencyIcon({ currency, size = 28 }: CurrencyIconProps) {
  const src = LOCAL_CURRENCY_ICONS[currency.toUpperCase()]

  if (src) {
    return (
      <Image
        src={src}
        alt={currency}
        width={size}
        height={size}
        className="rounded-full shrink-0"
        style={{ width: size, height: size, objectFit: "cover" }}
      />
    )
  }

  // Fallback: círculo con las iniciales (para monedas sin asset local)
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className="flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold shrink-0 select-none"
    >
      {currency.slice(0, 2).toUpperCase()}
    </span>
  )
}


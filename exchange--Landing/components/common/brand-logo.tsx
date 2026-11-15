import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoVariant = "name" | "full-sm" | "full-md" | "full-lg"

type BrandLogoProps = {
  className?: string
  priority?: boolean
  variant?: BrandLogoVariant
}

const logoWidths: Record<BrandLogoVariant, string> = {
  name: "w-[210px]",
  "full-sm": "w-[210px]",
  "full-md": "w-[260px]",
  "full-lg": "w-[320px]",
}

export function BrandLogo({ className, priority = false, variant = "name" }: BrandLogoProps) {
  const imageClassName = cn("h-auto max-w-full", logoWidths[variant], className)

  return (
    <>
      <Image
        src="/logo-decoexchange.png"
        alt="DECO Exchange"
        width={500}
        height={167}
        priority={priority}
        className={cn(imageClassName, "block dark:hidden")}
      />
      <Image
        src="/logo-deco-exchange-white.png"
        alt="DECO Exchange"
        width={500}
        height={167}
        priority={priority}
        className={cn(imageClassName, "hidden dark:block")}
      />
    </>
  )
}

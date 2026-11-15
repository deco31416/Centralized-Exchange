import { cn } from "@/lib/utils"

export const FIAT_CURRENCY_ICON_URLS: Record<string, string> = {
  ARS: "/images/FiatAccepted/argentina-ar-ars-logo_vhf9iy.svg",
  AWG: "/images/FiatAccepted/aruba-aw-awg-logo_ygxapm.svg",
  BRL: "/images/FiatAccepted/brasil-br-brl-logo_dcxcvj.svg",
  CAD: "/images/FiatAccepted/canada-ca-cad-logo_cu35ca.svg",
  CLP: "/images/FiatAccepted/chile-cl-clp-logo.svg",
  COP: "/images/FiatAccepted/colombia-co-cop-logo_jc6iu2.svg",
  DOP: "/images/FiatAccepted/republicadomincana-do-dot-logo_kehpud.svg",
  EUR: "/images/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg",
  MXN: "/images/FiatAccepted/mexico-mx-mxn-logo_ctxoht.svg",
  PEN: "/images/FiatAccepted/peru-pe-sol-logo_rbaixq.svg",
  SVC: "/images/FiatAccepted/elsalvador-sv-svc-logo.svg",
  USD: "/images/FiatAccepted/usa-us-usd-logo_lx28hi.svg",
  VES: "/images/FiatAccepted/venezuela-ve-ves-logo_s3y7me.svg",
}

type FiatCurrencyIconProps = {
  code: string
  label?: string
  className?: string
  imageClassName?: string
}

export function FiatCurrencyIcon({
  code,
  label,
  className,
  imageClassName,
}: FiatCurrencyIconProps) {
  const normalizedCode = code.trim().toUpperCase()
  const iconUrl = FIAT_CURRENCY_ICON_URLS[normalizedCode]

  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-card text-[10px] font-bold text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:shadow-none",
        className
      )}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={label ?? normalizedCode}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      ) : (
        normalizedCode.slice(0, 3)
      )}
    </span>
  )
}

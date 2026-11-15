import { cn } from "@/lib/utils"

interface AmountDisplayProps {
  amount: number
  currency?: string
  className?: string
  showSign?: boolean
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  BTC: "₿",
  ETH: "Ξ",
  USDT: "₮",
  ARS: "$",
  MXN: "$",
  COP: "$",
  CLP: "$",
  PEN: "S/",
  BRL: "R$",
}

export function AmountDisplay({
  amount,
  currency = "USD",
  className,
  showSign = false,
}: AmountDisplayProps) {
  const symbol = currencySymbols[currency?.toUpperCase()] || currency
  const isNegative = amount < 0
  const absoluteAmount = Math.abs(amount)
  
  const formattedAmount = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absoluteAmount)

  return (
    <span
      className={cn(
        "tabular-nums font-medium",
        isNegative && "text-rose-600 dark:text-rose-400",
        !isNegative && showSign && "text-emerald-600 dark:text-emerald-400",
        className
      )}
    >
      {showSign && !isNegative && "+"}
      {isNegative && "-"}
      {symbol}
      {formattedAmount} {currency.toUpperCase()}
    </span>
  )
}

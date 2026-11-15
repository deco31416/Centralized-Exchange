export function parseCompactMarketNumber(value: string): number {
  const normalized = value.trim().replaceAll(",", "")
  const unit = normalized.at(-1)?.toUpperCase()
  const rawNumber = unit && ["B", "M", "K"].includes(unit) ? normalized.slice(0, -1) : normalized
  const number = Number(rawNumber)

  if (!Number.isFinite(number)) return 0
  if (unit === "B") return number * 1_000_000_000
  if (unit === "M") return number * 1_000_000
  if (unit === "K") return number * 1_000
  return number
}

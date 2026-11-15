export type SpreadSource = "fiat" | "crypto"
export type PriceBandMode = "MANUAL" | "AUTO"
export type AlertLevel = "SAFE" | "WARNING" | "DANGER" | "BLOCKED"

export type EntropySnapshot = {
  score?: number
  level?: string
  recommendedBuySpread?: number
  recommendedSellSpread?: number
  rateChange24hPct?: number
  priceChange24hPct?: number
  calculatedAt?: string
}

export type PriceBand = {
  _id?: string
  id?: string
  source: SpreadSource
  pairCode?: string
  corridorCode?: string
  assetCode?: string
  networkCode?: string
  mode: PriceBandMode
  buySpreadPercentage: number
  sellSpreadPercentage: number
  effectiveBuySpread?: number
  effectiveSellSpread?: number
  legalMaxUpperPercentage: number
  legalMaxLowerPercentage: number
  alertLevel: AlertLevel
  alertMessage?: string
  enabled: boolean
  requiresJustification?: boolean
  entropy?: EntropySnapshot
  updatedAt?: string
}

export function getPriceBandId(band: PriceBand) {
  return String(band._id ?? band.id ?? `${band.source}-${band.pairCode ?? band.assetCode}`)
}

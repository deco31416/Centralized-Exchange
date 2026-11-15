import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons"

const GENERIC_ASSET_ICON = "/logo-deco-exchange-white.png"

export function getAssetIconUrl(assetCode: string, metadataIconUrl?: string | null): string {
  if (metadataIconUrl && metadataIconUrl.trim().length > 0) {
    return metadataIconUrl
  }

  const normalized = assetCode.trim().toUpperCase()
  const local = LOCAL_CURRENCY_ICONS[normalized]
  if (local && local.trim().length > 0) {
    return local
  }

  return GENERIC_ASSET_ICON
}

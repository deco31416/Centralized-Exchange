import { AssetsCatalogClient } from "@/components/assets/assets-catalog-client"
import { getCryptoAssets } from "@/components/assets/assets-data"
import { AssetsHero, AssetsHeroStat, AssetsPageShell } from "@/components/assets/assets-ui"

export const metadata = {
  title: "Criptoactivos | deco-exchange",
  description: "Catálogo público de criptoactivos disponibles como referencia dentro de Deco Exchange.",
}

export default function CryptoAssetsPage() {
  const assets = getCryptoAssets()

  return (
    <AssetsPageShell>
      <div className="space-y-8">
        <AssetsHero
          eyebrow="Assets · Crypto"
          title="Criptoactivos"
          description="Fichas de mercado con TradingView cuando existe símbolo público y fallback Deco Chart cuando el proveedor no responde."
          aside={<AssetsHeroStat label="MVP" value={`${assets.length}`} detail="BTC, ETH, SOL y stablecoins" />}
        />
        <AssetsCatalogClient assets={assets} methods={[]} mode="assets" />
      </div>
    </AssetsPageShell>
  )
}

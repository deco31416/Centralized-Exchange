import { AssetsCatalogClient } from "@/components/assets/assets-catalog-client"
import { getTokenAssets } from "@/components/assets/assets-data"
import { AssetsHero, AssetsHeroStat, AssetsPageShell } from "@/components/assets/assets-ui"

export const metadata = {
  title: "Tokens Deco | deco-exchange",
  description: "Catálogo público de tokens del ecosistema Deco Exchange.",
}

export default function TokenAssetsPage() {
  const assets = getTokenAssets()

  return (
    <AssetsPageShell>
      <div className="space-y-8">
        <AssetsHero
          eyebrow="Assets · Tokens"
          title="Tokens del ecosistema"
          description="Fichas de producto para tokens internos con gráfica Deco propia y enlaces legales separados."
          aside={<AssetsHeroStat label="Gráfica" value="Deco" detail="No depende de TradingView" />}
        />
        <AssetsCatalogClient assets={assets} methods={[]} mode="assets" />
      </div>
    </AssetsPageShell>
  )
}

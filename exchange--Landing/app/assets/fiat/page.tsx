import { AssetsCatalogClient } from "@/components/assets/assets-catalog-client"
import { getFiatAssets } from "@/components/assets/assets-data"
import { AssetsHero, AssetsHeroStat, AssetsPageShell } from "@/components/assets/assets-ui"

export const metadata = {
  title: "Monedas fiat | deco-exchange",
  description: "Catálogo público de monedas fiat, tasas referenciales y disponibilidad dentro de Deco Exchange.",
}

export default function FiatAssetsPage() {
  const assets = getFiatAssets()

  return (
    <AssetsPageShell>
      <div className="space-y-8">
        <AssetsHero
          eyebrow="Assets · Fiat"
          title="Monedas fiat"
          description="USD, COP, MXN y monedas locales como experiencia de producto. Las condiciones regulatorias siguen en legales."
          aside={<AssetsHeroStat label="Tasa" value="Deco" detail="Gráfica referencial" />}
        />
        <AssetsCatalogClient assets={assets} methods={[]} mode="assets" />
      </div>
    </AssetsPageShell>
  )
}

import { AssetsCatalogClient } from "@/components/assets/assets-catalog-client"
import { catalogAssets, paymentMethods } from "@/components/assets/assets-data"
import { AssetsHero, AssetsHeroStat, AssetsPageShell } from "@/components/assets/assets-ui"

export const metadata = {
  title: "Assets | deco-exchange",
  description: "Catálogo público de activos, monedas fiat, tokens y métodos de pago de Deco Exchange.",
}

export default function AssetsPage() {
  return (
    <AssetsPageShell>
      <div className="space-y-8">
        <AssetsHero
          eyebrow="Catálogo Deco"
          title="Activos, monedas y métodos"
          description="Consulta qué puedes usar en Deco Exchange: cripto, fiat, tokens del ecosistema y medios de pago disponibles. La ficha legal queda separada; esta es la vista de producto."
          aside={
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AssetsHeroStat label="Activos" value={`${catalogAssets.length}`} detail="Crypto, fiat y tokens" />
              <AssetsHeroStat label="Métodos" value={`${paymentMethods.length}`} detail="Wallets, bancos y efectivo" />
              <AssetsHeroStat label="Privacidad" value="Publico" detail="Sin datos personales" />
            </div>
          }
        />
        <AssetsCatalogClient assets={catalogAssets} methods={paymentMethods} />
      </div>
    </AssetsPageShell>
  )
}

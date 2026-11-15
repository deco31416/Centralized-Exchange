import { AssetsListPage } from "@/components/biblioteca/assets/assets-list-page"

export default function AssetsFiatPage() {
  return (
    <AssetsListPage
      title="Monedas fiat"
      description="Monedas fiat disponibles por país, región y método de pago."
      type="fiat"
    />
  )
}

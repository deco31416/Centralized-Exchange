import { AssetsCatalogClient } from "@/components/assets/assets-catalog-client"
import { paymentMethods } from "@/components/assets/assets-data"
import { AssetsHero, AssetsHeroStat, AssetsPageShell } from "@/components/assets/assets-ui"

export const metadata = {
  title: "Métodos de pago | deco-exchange",
  description: "Catálogo público de métodos de pago, bancos, wallets, efectivo y tarjetas de Deco Exchange.",
}

export default function PaymentMethodsPage() {
  return (
    <AssetsPageShell>
      <div className="space-y-8">
        <AssetsHero
          eyebrow="Assets · Métodos"
          title="Métodos de pago"
          description="Bancos, wallets, rails, efectivo y tarjetas con disponibilidad pública antes de crear órdenes privadas."
          aside={<AssetsHeroStat label="MVP" value={`${paymentMethods.length}`} detail="PSE, Nequi, Pix y más" />}
        />
        <AssetsCatalogClient assets={[]} methods={paymentMethods} mode="methods" />
      </div>
    </AssetsPageShell>
  )
}

import { WalletsListPage } from "@/components/biblioteca/wallets/wallets-list-page"

export default function WalletsFiatPage() {
  return (
    <WalletsListPage
      title="Wallets fiat"
      description="Bolsillitos fiat por usuario, moneda, país y disponibilidad."
      mode="fiat"
    />
  )
}

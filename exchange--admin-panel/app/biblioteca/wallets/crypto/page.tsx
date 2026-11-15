import { WalletsListPage } from "@/components/biblioteca/wallets/wallets-list-page"

export default function WalletsCryptoPage() {
  return (
    <WalletsListPage
      title="Wallets crypto"
      description="Wallets cripto por usuario, red, activo y estado operativo."
      mode="crypto"
    />
  )
}

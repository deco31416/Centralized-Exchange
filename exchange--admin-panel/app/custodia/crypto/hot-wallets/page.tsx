import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CryptoHotWalletsPage() {
  return (
    <AdminModulePlaceholderPage
      title="Pool de wallets calientes"
      description="Fondos disponibles para retiros, trading, P2P y operación diaria."
      state="pending"
      percent={20}
      scopes={[
        { title: "Liquidez", description: "Saldo operativo por red y activo." },
        { title: "Umbrales", description: "Mínimos, máximos y alertas de recarga." },
        { title: "Barrido", description: "Movimientos hacia custodia fría o wallets maestras." },
      ]}
    />
  )
}

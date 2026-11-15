import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AssetsParesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Pares de trading"
      description="Pares cripto, fiat y P2P disponibles para operación."
      state="pending"
      percent={25}
      scopes={[
        { title: "Spot", description: "Pares para compra, venta y conversión." },
        { title: "Fiat", description: "Cruces fiat disponibles por mercado." },
        { title: "P2P", description: "Pares permitidos para órdenes entre usuarios." },
      ]}
    />
  )
}

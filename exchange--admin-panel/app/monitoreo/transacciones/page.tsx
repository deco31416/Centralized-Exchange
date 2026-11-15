import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function TransaccionesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Transacciones en vivo"
      description="Stream de operaciones ejecutadas, pendientes y fallidas."
      state="pending"
      percent={10}
      note="Pendiente de canal de eventos por Gateway Admin. No se muestran transacciones generadas."
      scopes={[
        { title: "Eventos", description: "Depósitos, retiros, P2P, remesas, pagos e intercambio." },
        { title: "Estados", description: "Pendiente, completada, fallida, reversada o en revisión." },
        { title: "Trazabilidad", description: "Usuario, correlación, producto y origen del evento." },
      ]}
    />
  )
}

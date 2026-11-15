import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function MarketMakingBotsPage() {
  return (
    <AdminModulePlaceholderPage
      title="Market making bots"
      description="Automatización de liquidez y estrategias de mercado."
      state="pending"
      percent={5}
      note="I+D+i. No hay bots activos ni métricas reales conectadas."
      scopes={[
        { title: "Estrategias", description: "Par, spread objetivo y capital asignado." },
        { title: "Control", description: "Pausa, emergencia, límites y permisos." },
        { title: "Rendimiento", description: "PnL, inventario y exposición." },
      ]}
    />
  )
}

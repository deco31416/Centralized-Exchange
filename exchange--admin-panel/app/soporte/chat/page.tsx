import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function SoporteChatPage() {
  return (
    <AdminModulePlaceholderPage
      title="Chat en vivo"
      description="Conversaciones con usuarios desde canales oficiales."
      state="pending"
      percent={10}
      scopes={[
        { title: "Conversaciones", description: "Chats activos, cola y agente asignado." },
        { title: "Evidencia", description: "Historial, archivos y contexto del usuario." },
        { title: "Escalamiento", description: "Paso a tickets, riesgo o cumplimiento." },
      ]}
    />
  )
}
